/**
 * Módulo de Indicadores Macroeconômicos Oficiais.
 * Conecta diretamente às APIs públicas do IBGE e BrasilAPI para obter:
 * - IPCA (IBGE): Variação mensal e acumulada em 12 meses
 * - INPC (IBGE): Variação mensal e acumulada em 12 meses
 * - Taxa Selic & CDI (BrasilAPI / Banco Central)
 */

export interface EconomicIndicator {
  name: string;
  code: string;
  monthlyVariation?: number; // % no mês mais recente
  accumulated12m?: number; // % acumulado em 12 meses
  referencePeriod: string; // Ex: "09/2026"
  source: string;
  sourceUrl: string;
  annualRate?: number; // Para Selic/CDI (% a.a.)
}

export interface MacroeconomicPanel {
  ipca?: EconomicIndicator;
  inpc?: EconomicIndicator;
  selic?: EconomicIndicator;
  cdi?: EconomicIndicator;
  fetchedAt: number;
}

// Cache em memória de 1 hora (os índices macroeconômicos mudam mensalmente)
let cachedPanel: MacroeconomicPanel | null = null;
const PANEL_CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Busca os dados oficiais de IPCA e INPC direto da API de Serviços de Dados do IBGE.
 */
async function fetchIbgeIndicators(): Promise<{ ipca?: EconomicIndicator; inpc?: EconomicIndicator }> {
  const result: { ipca?: EconomicIndicator; inpc?: EconomicIndicator } = {};

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // IPCA - Agregado 7060 (Variáveis: 63 = mensal, 2265 = 12 meses)
    const ipcaRes = await fetch(
      'https://servicodados.ibge.gov.br/api/v3/agregados/7060/periodos/-2/variaveis/63|2265?localidades=N1[all]',
      { signal: controller.signal, next: { revalidate: 3600 } }
    );

    if (ipcaRes.ok) {
      const ipcaData = await ipcaRes.json();
      const mensalSeries = ipcaData?.[0]?.resultados?.[0]?.series?.[0]?.serie || {};
      const dozeMesesSeries = ipcaData?.[1]?.resultados?.[0]?.series?.[0]?.serie || {};

      const periods = Object.keys(mensalSeries).sort();
      const latestPeriod = periods[periods.length - 1];

      if (latestPeriod) {
        const formattedPeriod = `${latestPeriod.slice(4, 6)}/${latestPeriod.slice(0, 4)}`;
        result.ipca = {
          name: 'IPCA (Índice de Preços ao Consumidor Amplo)',
          code: 'IPCA',
          monthlyVariation: parseFloat(mensalSeries[latestPeriod]) || 0,
          accumulated12m: parseFloat(dozeMesesSeries[latestPeriod]) || 0,
          referencePeriod: formattedPeriod,
          source: 'IBGE — Sistema Nacional de Índices de Preços ao Consumidor',
          sourceUrl: 'https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-indice-nacional-de-precos-ao-consumidor-amplo.html',
        };
      }
    }

    // INPC - Agregado 7063 (Variáveis: 44 = mensal, 2292 = 12 meses)
    const inpcRes = await fetch(
      'https://servicodados.ibge.gov.br/api/v3/agregados/7063/periodos/-2/variaveis/44|2292?localidades=N1[all]',
      { signal: controller.signal, next: { revalidate: 3600 } }
    );

    if (inpcRes.ok) {
      const inpcData = await inpcRes.json();
      const mensalSeries = inpcData?.[0]?.resultados?.[0]?.series?.[0]?.serie || {};
      const dozeMesesSeries = inpcData?.[1]?.resultados?.[0]?.series?.[0]?.serie || {};

      const periods = Object.keys(mensalSeries).sort();
      const latestPeriod = periods[periods.length - 1];

      if (latestPeriod) {
        const formattedPeriod = `${latestPeriod.slice(4, 6)}/${latestPeriod.slice(0, 4)}`;
        result.inpc = {
          name: 'INPC (Índice Nacional de Preços ao Consumidor)',
          code: 'INPC',
          monthlyVariation: parseFloat(mensalSeries[latestPeriod]) || 0,
          accumulated12m: parseFloat(dozeMesesSeries[latestPeriod]) || 0,
          referencePeriod: formattedPeriod,
          source: 'IBGE — Sistema Nacional de Índices de Preços ao Consumidor',
          sourceUrl: 'https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9258-indice-nacional-de-precos-ao-consumidor.html',
        };
      }
    }

    clearTimeout(timeout);
  } catch (err) {
    console.error('Falha ao consultar indicadores do IBGE:', err);
  }

  return result;
}

/**
 * Busca taxas de juros (Selic e CDI) via BrasilAPI.
 */
async function fetchInterestRates(): Promise<{ selic?: EconomicIndicator; cdi?: EconomicIndicator }> {
  const result: { selic?: EconomicIndicator; cdi?: EconomicIndicator } = {};

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://brasilapi.com.br/api/taxas/v1', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data: Array<{ nome: string; valor: number }> = await res.json();
      const selicItem = data.find((d) => d.nome.toLowerCase() === 'selic');
      const cdiItem = data.find((d) => d.nome.toLowerCase() === 'cdi');

      const today = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

      if (selicItem) {
        result.selic = {
          name: 'Taxa Selic Meta',
          code: 'SELIC',
          annualRate: selicItem.valor,
          referencePeriod: today,
          source: 'Banco Central do Brasil (COPOM)',
          sourceUrl: 'https://dadosabertos.bcb.gov.br/dataset/11-taxa-de-juros---selic',
        };
      }

      if (cdiItem) {
        result.cdi = {
          name: 'Certificado de Depósito Interbancário (CDI)',
          code: 'CDI',
          annualRate: cdiItem.valor,
          referencePeriod: today,
          source: 'B3 — Brasil, Bolsa, Balcão',
          sourceUrl: 'https://www.b3.com.br',
        };
      }
    }
  } catch (err) {
    console.error('Falha ao consultar taxas no BrasilAPI:', err);
  }

  return result;
}

/**
 * Retorna o painel completo de indicadores econômicos atualizado.
 */
export async function getMacroeconomicPanel(): Promise<MacroeconomicPanel> {
  const now = Date.now();
  if (cachedPanel && now - cachedPanel.fetchedAt < PANEL_CACHE_TTL_MS) {
    return cachedPanel;
  }

  const [ibge, rates] = await Promise.all([fetchIbgeIndicators(), fetchInterestRates()]);

  const panel: MacroeconomicPanel = {
    ipca: ibge.ipca,
    inpc: ibge.inpc,
    selic: rates.selic,
    cdi: rates.cdi,
    fetchedAt: now,
  };

  cachedPanel = panel;
  return panel;
}

/**
 * Avalia se o texto da mensagem do usuário é relevante para índices e inflação.
 */
export function isIndicatorsRelevantQuery(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase();
  return (
    /ipca|inpc|igp-m|igpm|selic|cdi|infla[cç][aã]o|índice|indices|\/indices|taxa de juros|diss[ií]dio|reajuste anual|fórmula paramétrica/i.test(
      t
    )
  );
}

/**
 * Formata os indicadores econômicos em Markdown estruturado para injeção no prompt da IA.
 */
export function formatIndicatorsContextForPrompt(panel: MacroeconomicPanel): string {
  const rows: string[] = [];

  if (panel.ipca) {
    const sign = (panel.ipca.monthlyVariation || 0) >= 0 ? '+' : '';
    rows.push(
      `- **IPCA (IBGE):** ${sign}${panel.ipca.monthlyVariation?.toFixed(2)}% no mês | **${panel.ipca.accumulated12m?.toFixed(2)}% acumulado em 12 meses** (Ref: ${panel.ipca.referencePeriod}) [Fonte: IBGE]`
    );
  }

  if (panel.inpc) {
    const sign = (panel.inpc.monthlyVariation || 0) >= 0 ? '+' : '';
    rows.push(
      `- **INPC (IBGE - Balizador de Dissídios e CCTs):** ${sign}${panel.inpc.monthlyVariation?.toFixed(2)}% no mês | **${panel.inpc.accumulated12m?.toFixed(2)}% acumulado em 12 meses** (Ref: ${panel.inpc.referencePeriod}) [Fonte: IBGE]`
    );
  }

  if (panel.selic) {
    rows.push(
      `- **Taxa Selic Meta (Banco Central):** **${panel.selic.annualRate?.toFixed(2)}% a.a.** (Ref: ${panel.selic.referencePeriod}) [Fonte: Banco Central / COPOM]`
    );
  }

  if (panel.cdi) {
    rows.push(
      `- **Taxa CDI (B3):** **${panel.cdi.annualRate?.toFixed(2)}% a.a.** [Fonte: B3]`
    );
  }

  if (rows.length === 0) return '';

  return [
    '### PAINEL OFICIAL DE INDICADORES MACROECONÔMICOS (FONTES: IBGE / BANCO CENTRAL DO BRASIL / B3):',
    ...rows,
    'REGRA OBRIGATÓRIA: Utilize EXATAMENTE estes valores oficiais para responder dúvidas sobre inflação, reajustes, dissídios, IGP-M/IPCA/INPC ou no comando /indices. Não estime nem invente percentuais quando os dados oficiais acima estiverem disponíveis.',
  ].join('\n');
}
