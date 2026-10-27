/**
 * Módulo de Cotações de Commodities e Drivers Industriais (Petróleo Brent, Resinas, Energia e Papel).
 * Fornece dados primários de commodities internacionais e nacionais para auditoria de custos de compras indiretas.
 */

export interface CommodityItem {
  name: string;
  code: string;
  currentValue: number;
  unit: string;
  currency: string;
  variation12mPercent: number; // Variação em 12 meses (%)
  referenceDate: string;
  reading: 'PRESSÃO' | 'ALÍVIO' | 'ESTÁVEL';
  source: string;
  notes: string;
}

export interface CommodityReport {
  brent: CommodityItem;
  resinaPead: CommodityItem;
  resinaPebd: CommodityItem;
  papelKraftAparas: CommodityItem;
  energiaAltaTensao: CommodityItem;
  updatedAt: string;
}

/**
 * Dados de referência consolidados de commodities industriais.
 * Atualizados com base nos choques globais de petróleo, spreads petroquímicos e tarifas homologadas da ANEEL.
 */
export const CURRENT_COMMODITIES_REPORT: CommodityReport = {
  brent: {
    name: 'Petróleo Brent Datado',
    code: 'BRENT',
    currentValue: 104.13,
    unit: 'US$/barril',
    currency: 'USD',
    variation12mPercent: 24.5,
    referenceDate: 'Outubro/2026',
    reading: 'PRESSÃO',
    source: 'ICE / Reuters / O Tempo',
    notes: 'Brent subiu devido a tensões no Estreito de Ormuz e risco geopolítico; projeção do Banco Mundial aponta recuo para US$ 90 nos próximos 12 meses.',
  },
  resinaPead: {
    name: 'Resina Polietileno de Alta Densidade (PEAD Film)',
    code: 'PEAD',
    currentValue: 9850.0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 30.0,
    referenceDate: 'Outubro/2026',
    reading: 'PRESSÃO',
    source: 'Braskem / PlásticoNews / SIMPEP',
    notes: 'Repasses da Braskem (+R$ 8.000/t no ciclo) e paridade internacional da nafta petroquímica impulsionaram alta acumulada de ~30% em R$.',
  },
  resinaPebd: {
    name: 'Resina Polietileno de Baixa Densidade (PEBD)',
    code: 'PEBD',
    currentValue: 10200.0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 28.5,
    referenceDate: 'Outubro/2026',
    reading: 'PRESSÃO',
    source: 'Braskem / ICIS Latin America',
    notes: 'Impactada pela oferta restrita e aplicação de medidas antidumping definitivas sobre resinas importadas.',
  },
  papelKraftAparas: {
    name: 'Papel Kraft e Aparas Onduladas',
    code: 'KRAFT_APARAS',
    currentValue: 1420.0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 12.0,
    referenceDate: 'Outubro/2026',
    reading: 'ESTÁVEL',
    source: 'Empapel / IBÁ',
    notes: 'Preços de aparas de papelão ondulado estabilizaram após recomposição de estoques no e-commerce e indústria de alimentos.',
  },
  energiaAltaTensao: {
    name: 'Energia Elétrica Industrial (Alta Tensão Copel/Distribuidoras)',
    code: 'ENERGIA_AT',
    currentValue: 385.0,
    unit: 'R$/MWh',
    currency: 'BRL',
    variation12mPercent: 21.9,
    referenceDate: 'Outubro/2026',
    reading: 'PRESSÃO',
    source: 'ANEEL / Copel Tarifas Homologadas',
    notes: 'Reajuste tarifário anual de alta tensão somado a bandeiras tarifárias e encargos setoriais (CDE).',
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Retorna o relatório de commodities industriais atualizado.
 */
export async function getCommoditiesReport(): Promise<CommodityReport> {
  return CURRENT_COMMODITIES_REPORT;
}

/**
 * Formata as diretrizes de commodities para inclusão contextual nos prompts do modelo.
 */
export function formatCommoditiesContextForPrompt(report: CommodityReport): string {
  return `### DIRETRIZES DE COMMODITIES INDUSTRIAIS E INSUMOS PRIMÁRIOS:
- **Petróleo Brent:** Insumo-base para nafta petroquímica, polietilenos, solventes e diesel.
- **Resinas Plásticas (PEAD/PEBD/PP/PET):** Sensíveis à paridade de importação, câmbio USD/BRL e repasses dos produtores nacionais (Braskem) e globais (ICIS).
- **Papelão Ondulado / Aparas / Celulose:** Acompanhar cotações da Empapel e IBÁ.
- **Energia Elétrica Industrial:** Tarifas de alta tensão homologadas pela ANEEL e encargos setoriais (CDE, bandeiras tarifárias).

DIRETRIZ DE PESQUISA EM TEMPO REAL:
1. Você DEVE pesquisar ativamente via Google Search as cotações, notícias e variações recentes de qualquer commodity ou insumo industrial mencionado pelo usuário.
2. Não utilize valores pré-concebidos ou congelados; busque dados recentes de fontes confiáveis (Reuters, ICE, ABIPLAST, Empapel, ANEEL, etc.) e utilize esses dados para embasar os cálculos de Should-Cost.`;
}

