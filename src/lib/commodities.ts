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
 * Estrutura referencial de drivers industriais para pesquisa dinâmica da LLM.
 * Não utiliza valores fixos: o modelo pesquisa livremente as cotações atuais de mercado.
 */
export const CURRENT_COMMODITIES_REPORT: CommodityReport = {
  brent: {
    name: 'Petróleo Brent Datado',
    code: 'BRENT',
    currentValue: 0,
    unit: 'US$/barril',
    currency: 'USD',
    variation12mPercent: 0,
    referenceDate: 'Pesquisa Dinâmica',
    reading: 'ESTÁVEL',
    source: 'ICE / Reuters / Platts',
    notes: 'Insumo-base para a nafta petroquímica internacional e refino de diesel.',
  },
  resinaPead: {
    name: 'Resina Polietileno de Alta Densidade (PEAD Film)',
    code: 'PEAD',
    currentValue: 0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 0,
    referenceDate: 'Pesquisa Dinâmica',
    reading: 'ESTÁVEL',
    source: 'Braskem / PlásticoNews / ComexStat',
    notes: 'Matéria-prima de filmes e sacolas plásticas. Cotada por comunicados da Braskem e paridade de importação.',
  },
  resinaPebd: {
    name: 'Resina Polietileno de Baixa Densidade (PEBD)',
    code: 'PEBD',
    currentValue: 0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 0,
    referenceDate: 'Pesquisa Dinâmica',
    reading: 'ESTÁVEL',
    source: 'Braskem / ICIS / SIMPEP',
    notes: 'Embalagens flexíveis e filmes industriais.',
  },
  papelKraftAparas: {
    name: 'Papel Kraft e Aparas Onduladas',
    code: 'KRAFT_APARAS',
    currentValue: 0,
    unit: 'R$/tonelada',
    currency: 'BRL',
    variation12mPercent: 0,
    referenceDate: 'Pesquisa Dinâmica',
    reading: 'ESTÁVEL',
    source: 'Empapel / IBÁ',
    notes: 'Matéria-prima de caixas de papelão ondulado.',
  },
  energiaAltaTensao: {
    name: 'Energia Elétrica Industrial (Alta Tensão Copel/Distribuidoras)',
    code: 'ENERGIA_AT',
    currentValue: 0,
    unit: 'R$/MWh',
    currency: 'BRL',
    variation12mPercent: 0,
    referenceDate: 'Pesquisa Dinâmica',
    reading: 'ESTÁVEL',
    source: 'ANEEL / CCEE / Copel',
    notes: 'Tarifas industriais reguladas pela ANEEL e mercado livre de energia (PLD).',
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

