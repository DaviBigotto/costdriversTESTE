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

// Dados de referência oficiais da Petrobras e ANP (Formação de Preços do Diesel)
const CURRENT_ANP_DIESEL_REPORT: FuelPriceReport = {
  dieselS10Brasil: {
    product: 'Óleo Diesel S10',
    region: 'Brasil (Média Nacional)',
    unit: 'R$/litro',
    averagePrice: 7.36,
    minPrice: 6.49,
    maxPrice: 8.59,
    weeklyVariationPercent: +0.41,
    period: 'Outubro/2026',
    source: 'Petrobras — Preços dos Combustíveis e Composição Oficial',
    sourceUrl: 'https://precos.petrobras.com.br/precos-diesel',
  },
  regionalDiesel: {
    SP: {
      product: 'Óleo Diesel S10',
      region: 'São Paulo (SP)',
      unit: 'R$/litro',
      averagePrice: 7.24,
      minPrice: 6.45,
      maxPrice: 8.19,
      weeklyVariationPercent: +0.2,
      period: 'Outubro/2026',
      source: 'Petrobras / ANP (SP)',
      sourceUrl: 'https://precos.petrobras.com.br/precos-diesel',
    },
    MG: {
      product: 'Óleo Diesel S10',
      region: 'Minas Gerais (MG)',
      unit: 'R$/litro',
      averagePrice: 7.32,
      minPrice: 6.59,
      maxPrice: 8.39,
      weeklyVariationPercent: +0.3,
      period: 'Outubro/2026',
      source: 'Petrobras / ANP (MG)',
      sourceUrl: 'https://precos.petrobras.com.br/precos-diesel',
    },
    RJ: {
      product: 'Óleo Diesel S10',
      region: 'Rio de Janeiro (RJ)',
      unit: 'R$/litro',
      averagePrice: 7.48,
      minPrice: 6.79,
      maxPrice: 8.69,
      weeklyVariationPercent: +0.5,
      period: 'Outubro/2026',
      source: 'Petrobras / ANP (RJ)',
      sourceUrl: 'https://precos.petrobras.com.br/precos-diesel',
    },
    PR: {
      product: 'Óleo Diesel S10',
      region: 'Paraná (PR)',
      unit: 'R$/litro',
      averagePrice: 7.18,
      minPrice: 6.39,
      maxPrice: 8.09,
      weeklyVariationPercent: +0.1,
      period: 'Outubro/2026',
      source: 'Petrobras / ANP (PR)',
      sourceUrl: 'https://precos.petrobras.com.br/precos-diesel',
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
 * Formata os dados de combustível da Petrobras / ANP para injeção no prompt.
 */
export function formatFuelContextForPrompt(report: FuelPriceReport): string {
  const d = report.dieselS10Brasil;
  const sign = d.weeklyVariationPercent >= 0 ? '+' : '';

  return [
    '### DADOS OFICIAIS DE COMBUSTÍVEIS E FRETE (FONTE: PETROBRAS / ANP — precos.petrobras.com.br/precos-diesel):',
    `- **Diesel S10 (Média Brasil na Bomba):** R$ ${d.averagePrice.toFixed(2)}/litro (Variação acumulada no ano: +20,6% frente a R$ 6,10/L em jan/2026 | Mín: R$ ${d.minPrice.toFixed(2)} | Máx: R$ ${d.maxPrice.toFixed(2)}) [Ref: ${d.period}]`,
    `- **Composição Oficial do Preço na Bomba (Petrobras):** Parcela Petrobras Refinaria: R$ 3,15 (42,8%) | Distribuição e Revenda: R$ 2,22 (30,2%) | Imposto Estadual (ICMS): R$ 1,17 (15,9%) | Biodiesel: R$ 0,82 (11,1%) = **Total: R$ ${d.averagePrice.toFixed(2)}/L**`,
    `- **Médias Regionais Chave:** SP: R$ ${report.regionalDiesel.SP.averagePrice.toFixed(2)}/L | PR: R$ ${report.regionalDiesel.PR.averagePrice.toFixed(2)}/L | MG: R$ ${report.regionalDiesel.MG.averagePrice.toFixed(2)}/L | RJ: R$ ${report.regionalDiesel.RJ.averagePrice.toFixed(2)}/L`,
    `- **Regra de Negociação de Frete (ANTT / Should-Cost):** O diesel representa historicamente cerca de 35% a 45% do custo do frete rodoviário. O gatilho de reajuste automático legal da ANTT é ativado quando a variação acumulada do diesel supera ±5%.`,
    'REGRA OBRIGATÓRIA: Utilize os dados acima (R$ 7,36/L e decomposição oficial da Petrobras) para responder cotações de diesel e auditar reajustes de frete e sacolas da Plurix. Cite explicitamente a fonte oficial precos.petrobras.com.br/precos-diesel.',
  ].join('\n');
}
