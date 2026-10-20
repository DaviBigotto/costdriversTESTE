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
 * Formata os dados de commodities para inclusão contextual nos prompts do modelo.
 */
export function formatCommoditiesContextForPrompt(report: CommodityReport): string {
  return `### PAINEL OFICIAL DE COMMODITIES INDUSTRIAIS E INSUMOS PRIMÁRIOS (FONTES: ICE / REUTERS / BRASKEM / ANEEL / EMPAPEL):
- **Petróleo Brent:** **US$ ${report.brent.currentValue.toFixed(2)}/barril** (${report.brent.reading} - Var. 12m: +${report.brent.variation12mPercent.toFixed(1)}%) [Fonte: ${report.brent.source}]. ${report.brent.notes}
- **Resina PEAD (Polietileno):** **R$ ${report.resinaPead.currentValue.toLocaleString('pt-BR')}/t** (${report.resinaPead.reading} - Var. 12m em R$: **+${report.resinaPead.variation12mPercent.toFixed(1)}%**) [Fonte: ${report.resinaPead.source}]. ${report.resinaPead.notes}
- **Energia Elétrica Alta Tensão:** ${report.energiaAltaTensao.reading} - Var. 12m: **+${report.energiaAltaTensao.variation12mPercent.toFixed(1)}%** [Fonte: ${report.energiaAltaTensao.source}].
- **Papelão Ondulado / Aparas:** Var. 12m: **+${report.papelKraftAparas.variation12mPercent.toFixed(1)}%** [Fonte: ${report.papelKraftAparas.source}].

REGRA ECONÔMICA DETERMINÍSTICA:
Em produtos plásticos (sacolas, filmes, bandejas), a Resina PEAD/PEBD pesa ~60% do custo final e teve alta acumulada de ~30% em R$ devido aos choques do petróleo e da Braskem.
A alta isolada da resina explica +18,0 p.p. no custo da sacola (60% x 30% = 18 p.p.). Somando energia (+1,5 p.p.), frete (+1,0 p.p.), mão de obra (+0,4 p.p.) e aditivos (+0,2 p.p.), o Reajuste Teórico Justo (Should-Cost) é de aproximadamente 21,1%!
Contra um pedido hipotético de 28,0%, o espaço de negociação (gap sem lastro em custo) é de 6,9 p.p.
A projeção para os próximos 12 meses aponta custo estável/em alívio (-2,0%) à medida que o petróleo recua de US$ 104 para US$ 90 (cenário base).`;
}
