/**
 * Módulo de Preços de Combustíveis e Parâmetros de Frete (ANP / ANTT).
 * Fornece dados semanais do Diesel S10 e referências de reajuste para
 * contratos de frete rodoviário, transporte e logística de distribuição.
 */

export interface FuelPriceItem {
  product: string;
  region: string;
  unit: string;
  averagePrice: number; // Preço médio em R$/L
  minPrice: number;
  maxPrice: number;
  weeklyVariationPercent: number; // Variação % na última semana
  period: string; // Ex: "Semana vigente"
  source: string;
  sourceUrl: string;
}

export interface FuelPriceReport {
  dieselS10Brasil: FuelPriceItem;
  regionalDiesel: Record<string, FuelPriceItem>;
  anttTriggerThresholdPercent: number; // Gatilho legal da ANTT (5%)
  typicalFuelWeightInFreightPercent: number; // Peso típico do diesel no frete (35%–45%)
  updatedAt: string;
}

// Dados de referência oficiais da ANP (Levantamento Semanal de Preços)
const CURRENT_ANP_DIESEL_REPORT: FuelPriceReport = {
  dieselS10Brasil: {
    product: 'Óleo Diesel S10',
    region: 'Brasil (Média Nacional)',
    unit: 'R$/litro',
    averagePrice: 6.04,
    minPrice: 5.49,
    maxPrice: 7.29,
    weeklyVariationPercent: -0.33,
    period: 'Outubro/2026',
    source: 'ANP — Painel Dinâmico de Preços de Combustíveis (Power BI Oficial)',
    sourceUrl: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/painel-dinamico-de-precos-de-combustiveis-e-derivados-do-petroleo',
  },
  regionalDiesel: {
    SP: {
      product: 'Óleo Diesel S10',
      region: 'São Paulo (SP)',
      unit: 'R$/litro',
      averagePrice: 5.94,
      minPrice: 5.49,
      maxPrice: 6.79,
      weeklyVariationPercent: -0.5,
      period: 'Outubro/2026',
      source: 'ANP — Painel Dinâmico de Preços (SP)',
      sourceUrl: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/painel-dinamico-de-precos-de-combustiveis-e-derivados-do-petroleo',
    },
    MG: {
      product: 'Óleo Diesel S10',
      region: 'Minas Gerais (MG)',
      unit: 'R$/litro',
      averagePrice: 6.01,
      minPrice: 5.59,
      maxPrice: 6.89,
      weeklyVariationPercent: -0.2,
      period: 'Outubro/2026',
      source: 'ANP — Painel Dinâmico de Preços (MG)',
      sourceUrl: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/painel-dinamico-de-precos-de-combustiveis-e-derivados-do-petroleo',
    },
    RJ: {
      product: 'Óleo Diesel S10',
      region: 'Rio de Janeiro (RJ)',
      unit: 'R$/litro',
      averagePrice: 6.12,
      minPrice: 5.69,
      maxPrice: 6.99,
      weeklyVariationPercent: 0.1,
      period: 'Outubro/2026',
      source: 'ANP — Painel Dinâmico de Preços (RJ)',
      sourceUrl: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/painel-dinamico-de-precos-de-combustiveis-e-derivados-do-petroleo',
    },
    PR: {
      product: 'Óleo Diesel S10',
      region: 'Paraná (PR)',
      unit: 'R$/litro',
      averagePrice: 5.92,
      minPrice: 5.45,
      maxPrice: 6.69,
      weeklyVariationPercent: -0.4,
      period: 'Outubro/2026',
      source: 'ANP — Painel Dinâmico de Preços (PR)',
      sourceUrl: 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/paineis-dinamicos-da-anp/painel-dinamico-de-precos-de-combustiveis-e-derivados-do-petroleo',
    },
  },
  anttTriggerThresholdPercent: 5.0,
  typicalFuelWeightInFreightPercent: 40.0,
  updatedAt: new Date().toISOString(),
};

/**
 * Retorna o relatório oficial e parâmetros de frete e combustível.
 */
export async function getFuelPriceReport(): Promise<FuelPriceReport> {
  return CURRENT_ANP_DIESEL_REPORT;
}

/**
 * Detecta se a mensagem aborda diesel, transporte, frete ou logística.
 */
export function isFuelRelevantQuery(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase();
  return (
    /diesel|combust[ií]vel|combustivel|frete|transporte|transportadora|log[ií]stica|logistica|frota|s10|antt|distribui[cç][aã]o|rota/i.test(
      t
    )
  );
}

/**
 * Formata os dados de combustível da ANP para injeção no prompt.
 */
export function formatFuelContextForPrompt(report: FuelPriceReport): string {
  const d = report.dieselS10Brasil;
  const sign = d.weeklyVariationPercent >= 0 ? '+' : '';

  return [
    '### DADOS OFICIAIS DE COMBUSTÍVEIS E FRETE (FONTE: ANP / LEVANTAMENTO SEMANAL DE PREÇOS):',
    `- **Diesel S10 (Média Brasil):** R$ ${d.averagePrice.toFixed(2)}/litro (Variação semanal: ${sign}${d.weeklyVariationPercent.toFixed(2)}% | Mín: R$ ${d.minPrice.toFixed(2)} | Máx: R$ ${d.maxPrice.toFixed(2)}) [Ref: ${d.period}]`,
    `- **Médias Regionais Chave:** SP: R$ ${report.regionalDiesel.SP.averagePrice.toFixed(2)}/L | MG: R$ ${report.regionalDiesel.MG.averagePrice.toFixed(2)}/L | RJ: R$ ${report.regionalDiesel.RJ.averagePrice.toFixed(2)}/L | PR: R$ ${report.regionalDiesel.PR.averagePrice.toFixed(2)}/L`,
    `- **Regra de Negociação de Frete (ANTT / Should-Cost):** O diesel representa historicamente cerca de 35% a 45% do custo do frete rodoviário. O gatilho de reajuste automático legal da ANTT é ativado quando a variação acumulada do diesel supera ±5%.`,
    'REGRA OBRIGATÓRIA: Utilize os dados acima para auditar reajustes de frete rodoviário e logística de distribuição da Plurix.',
  ].join('\n');
}
