/**
 * Base de Conhecimento e Instruções Centrais do Economista de Compras.
 * Fonte: Economista_de_Compras_Conversacional_v3_com_boletim.md (Versão 2.0 / Plurix)
 */

export interface CategoryComposition {
  category: string;
  keywords: string[];
  components: {
    name: string;
    weightRange: string;
    defaultWeight: number;
    driver: string;
    driverSource: string;
  }[];
  notes: string;
}

export const COST_BREAKDOWN_LIBRARY: CategoryComposition[] = [
  {
    category: 'Sacolas plásticas (PEAD/PEBD)',
    keywords: ['sacola', 'sacolinha', 'pead', 'pebd', 'polietileno', 'sacolas'],
    components: [
      { name: 'Resina PEAD', weightRange: '55–65%', defaultWeight: 60, driver: 'Preço internacional PEAD, paridade de importação, cotação Brent/nafta e câmbio USD/BRL', driverSource: 'Braskem / ICIS / SIMPEP' },
      { name: 'Overhead e margem', weightRange: '12–15%', defaultWeight: 14, driver: 'Custos fixos e margem do transformador (sem driver de mercado que justifique repasse de alta, 0,0 p.p.)', driverSource: 'Premissa de modelagem' },
      { name: 'Mão de obra', weightRange: '8–10%', defaultWeight: 9, driver: 'INPC e Convenção Coletiva de Trabalho (CCT) do setor de transformação plástica', driverSource: 'IBGE / Sindicato' },
      { name: 'Energia elétrica', weightRange: '6–8%', defaultWeight: 7, driver: 'Tarifas industriais de alta tensão reguladas e encargos setoriais vigentes', driverSource: 'ANEEL / Concessionárias' },
      { name: 'Aditivos e pigmentos', weightRange: '4–6%', defaultWeight: 5, driver: 'Insumos químicos auxiliares e proxy IPCA', driverSource: 'IBGE' },
      { name: 'Frete e distribuição', weightRange: '4–6%', defaultWeight: 5, driver: 'Preço médio do diesel S10 na bomba e frete rodoviário', driverSource: 'ANP / ANTT' },
    ],
    notes: 'A resina virgem representa aproximadamente 60% do custo final da sacola plástica. Para auditar pedidos de reajuste, calcule a contribuição de cada driver (peso % x variação real do período pesquisada no mercado). Custos fixos e margem não possuem lastro em custos para sofrerem reajuste (0,0 p.p.). Pesquise via Google Search as variações recentes da resina, do petróleo e a cotação do dólar para embasar o Should-Cost.',
  },
  {
    category: 'Filmes, bandejas e embalagens plásticas',
    keywords: ['filme', 'bandeja', 'filmes', 'stretch', 'termoformados', 'pp', 'ps', 'pote'],
    components: [
      { name: 'Resina plástica (PE/PP/PS)', weightRange: '50–60%', defaultWeight: 55, driver: 'PE/PP/PS, Brent, PTAX', driverSource: 'ICIS / PTAX / Petrobras' },
      { name: 'Energia', weightRange: '8–10%', defaultWeight: 9, driver: 'Tarifa industrial ANEEL', driverSource: 'ANEEL' },
      { name: 'Mão de obra', weightRange: '10%', defaultWeight: 10, driver: 'INPC / Dissídio transformação plástica', driverSource: 'IBGE' },
      { name: 'Frete', weightRange: '5%', defaultWeight: 5, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '15–20%', defaultWeight: 21, driver: 'Fixo / IPA plásticos', driverSource: 'FGV IBRE' },
    ],
    notes: 'Impactado diretamente pelas cotações internacionais de nafta e spread petroquímico.',
  },
  {
    category: 'Embalagens de papel/papelão',
    keywords: ['papelão', 'caixa', 'caixas', 'ondulado', 'aparas', 'kraft', 'embalagem papel'],
    components: [
      { name: 'Papel e aparas', weightRange: '45–55%', defaultWeight: 50, driver: 'Preço papelão/aparas (Empapel), celulose (IBÁ)', driverSource: 'Empapel / IBÁ / FOEX' },
      { name: 'Energia', weightRange: '8–10%', defaultWeight: 9, driver: 'Tarifa ANEEL', driverSource: 'ANEEL' },
      { name: 'Mão de obra', weightRange: '12%', defaultWeight: 12, driver: 'INPC / Dissídio papel e papelão', driverSource: 'IBGE' },
      { name: 'Químicos e cola', weightRange: '5%', defaultWeight: 5, driver: 'IPA químicos', driverSource: 'FGV IBRE' },
      { name: 'Frete', weightRange: '6–8%', defaultWeight: 7, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '15%', defaultWeight: 17, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Preço de aparas recicladas oscila fortemente com a demanda do e-commerce e exportações de celulose.',
  },
  {
    category: 'Bobinas térmicas e etiquetas',
    keywords: ['bobina', 'bobinas', 'térmica', 'termica', 'cupom', 'etiqueta', 'etiquetas', 'pdv'],
    components: [
      { name: 'Papel térmico base', weightRange: '55–65%', defaultWeight: 60, driver: 'Papel térmico importado (ComexStat), PTAX', driverSource: 'ComexStat / PTAX' },
      { name: 'Químicos / revestimento', weightRange: '5–8%', defaultWeight: 6, driver: 'IPA químicos', driverSource: 'FGV IBRE' },
      { name: 'Conversão e mão de obra', weightRange: '10%', defaultWeight: 10, driver: 'INPC / Dissídio gráfico', driverSource: 'IBGE' },
      { name: 'Frete', weightRange: '5%', defaultWeight: 5, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '15%', defaultWeight: 19, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Grande dependência do papel térmico importado (alta correlação com o dólar PTAX e celulose mundial).',
  },
  {
    category: 'Material de limpeza e higiene',
    keywords: ['químicos', 'quimicos', 'detergente', 'desinfetante', 'sabão', 'cloro', 'higiene'],
    components: [
      { name: 'Insumos químicos ativos', weightRange: '35–45%', defaultWeight: 40, driver: 'IPA químicos, soda cáustica, tensoativos', driverSource: 'FGV IBRE / ComexStat' },
      { name: 'Embalagem (frascos PE/PET)', weightRange: '15–20%', defaultWeight: 18, driver: 'Resina PE/PET e PTAX', driverSource: 'ICIS / PTAX' },
      { name: 'Mão de obra', weightRange: '10%', defaultWeight: 10, driver: 'INPC / Dissídio químicos', driverSource: 'IBGE' },
      { name: 'Frete', weightRange: '8–10%', defaultWeight: 9, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '20%', defaultWeight: 23, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Monitorar custo de tensoativos e frascos plásticos, além de frete rodoviário.',
  },
  {
    category: 'Limpeza e conservação terceirizada',
    keywords: ['limpeza', 'conservação', 'terceirizada', 'terceirizado', 'facilities', 'portaria'],
    components: [
      { name: 'Mão de obra e encargos sociais', weightRange: '70–80%', defaultWeight: 75, driver: 'Dissídio da categoria (Convenção Coletiva CCT), Salário Mínimo, INPC', driverSource: 'MTE / Sindicato Regional' },
      { name: 'Materiais de consumo', weightRange: '8–12%', defaultWeight: 10, driver: 'IPCA / IPA produtos de limpeza', driverSource: 'IBGE / FGV' },
      { name: 'Equipamentos e uniformes', weightRange: '3–5%', defaultWeight: 4, driver: 'IPCA bens duráveis / vestuário', driverSource: 'IBGE' },
      { name: 'Tributos e margem da prestadora', weightRange: '10–12%', defaultWeight: 11, driver: 'Alíquotas ISS/PIS/COFINS e margem fixa', driverSource: 'Legislação municipal / contrato' },
    ],
    notes: 'Reajustes de mão de obra são balizados exclusivamente pela data-base do sindicato regional (CCT). Não aceitar reajuste linear sem abertura de planilha de custos.',
  },
  {
    category: 'Segurança e vigilância',
    keywords: ['segurança', 'vigilância', 'vigilante', 'vigilantes', 'escolta'],
    components: [
      { name: 'Mão de obra, periculosidade e encargos', weightRange: '75–85%', defaultWeight: 80, driver: 'Convenção Coletiva dos Vigilantes, INPC, Adicional de Periculosidade (30%)', driverSource: 'Convenção Coletiva / MTE' },
      { name: 'Equipamentos, coletes e uniformes', weightRange: '5%', defaultWeight: 5, driver: 'IPCA', driverSource: 'IBGE' },
      { name: 'Tributos e margem', weightRange: '10–15%', defaultWeight: 15, driver: 'Contrato / ISS', driverSource: 'Premissa' },
    ],
    notes: 'Adicional de periculosidade é fixado em lei. Reajuste estritamente ligado à data-base sindical.',
  },
  {
    category: 'Manutenção predial e refrigeração',
    keywords: ['manutenção', 'predial', 'refrigeração', 'ar condicionado', 'chiller', 'elétrica'],
    components: [
      { name: 'Mão de obra técnica', weightRange: '45–55%', defaultWeight: 50, driver: 'Dissídio metalúrgicos/refrigeração, INPC', driverSource: 'IBGE / Sindicato' },
      { name: 'Peças de reposição e gás refrigerante', weightRange: '25–35%', defaultWeight: 30, driver: 'Gás refrigerante (PTAX), cobre (LME), IPA metalurgia', driverSource: 'LME / PTAX / FGV' },
      { name: 'Deslocamento e veículos', weightRange: '8–10%', defaultWeight: 9, driver: 'Diesel / Gasolina ANP', driverSource: 'ANP' },
      { name: 'Margem', weightRange: '10%', defaultWeight: 11, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Gases refrigerantes sofrem com cotas de importação (Protocolo de Montreal) e cotação do dólar.',
  },
  {
    category: 'Energia elétrica',
    keywords: ['energia', 'eletricidade', 'luz', 'kwh', 'mwh', 'mercado livre', 'ccee', 'aneel'],
    components: [
      { name: 'Geração / Energia', weightRange: '50–60%', defaultWeight: 55, driver: 'PLD CCEE (mercado livre) ou Tarifa TE ANEEL', driverSource: 'CCEE / ANEEL' },
      { name: 'Transmissão e distribuição (Fio/TUSD)', weightRange: '25–30%', defaultWeight: 27, driver: 'Reajuste tarifário anual da distribuidora (IGP-M/IPCA + Fator X)', driverSource: 'ANEEL' },
      { name: 'Encargos setoriais e tributos (ICMS/PIS/COFINS)', weightRange: '15–20%', defaultWeight: 18, driver: 'Bandeiras tarifárias, Conta de Desenvolvimento Energético (CDE)', driverSource: 'ANEEL / CCEE' },
    ],
    notes: 'Acompanhar nível dos reservatórios das hidrelétricas e regime de chuvas para prever PLD.',
  },
  {
    category: 'Uniformes e EPI',
    keywords: ['uniforme', 'uniformes', 'epi', 'camisa', 'calça', 'bota', 'tecido', 'algodão'],
    components: [
      { name: 'Tecido (algodão / poliéster)', weightRange: '35–45%', defaultWeight: 40, driver: 'Algodão em pluma CEPEA, PTA/poliéster, PTAX', driverSource: 'CEPEA / PTAX' },
      { name: 'Confecção e mão de obra', weightRange: '25–30%', defaultWeight: 28, driver: 'INPC / Dissídio têxtil e vestuário', driverSource: 'IBGE' },
      { name: 'Aviamentos (zíper, botões, linhas)', weightRange: '5%', defaultWeight: 5, driver: 'IPA manufaturas', driverSource: 'FGV IBRE' },
      { name: 'Frete', weightRange: '5%', defaultWeight: 5, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Margem do confeccionista', weightRange: '15–20%', defaultWeight: 22, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Preço da pluma de algodão tem forte sazonalidade de safra e correlação com mercado internacional.',
  },
  {
    category: 'Frete e logística rodoviária',
    keywords: ['frete', 'transporte', 'diesel', 'logística', 'caminhão', 'entrega', 'motorista'],
    components: [
      { name: 'Combustível (Óleo Diesel)', weightRange: '30–40%', defaultWeight: 35, driver: 'Diesel S10 ANP e PPI Petrobras', driverSource: 'ANP / Petrobras' },
      { name: 'Motorista e encargos', weightRange: '20–25%', defaultWeight: 22, driver: 'Convenção coletiva rodoviários, INPC', driverSource: 'IBGE / Sindicato' },
      { name: 'Manutenção, peças e pneus', weightRange: '10–12%', defaultWeight: 11, driver: 'IPCA peças e acessórios, borracha', driverSource: 'IBGE / PTAX' },
      { name: 'Depreciação de veículos', weightRange: '10%', defaultWeight: 10, driver: 'Tabela Fipe caminhões', driverSource: 'Fipe' },
      { name: 'Pedágio e seguro de carga', weightRange: '8%', defaultWeight: 8, driver: 'Reajustes de praças de pedágio (IPCA/IGP-M)', driverSource: 'ANTT / ARTESP' },
      { name: 'Margem da transportadora', weightRange: '10%', defaultWeight: 14, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Diesel representa mais de um terço do custo do frete; acompanhar paridade de importação e defasagem da Petrobras.',
  },
  {
    category: 'TI e telecom',
    keywords: ['software', 'licença', 'cloud', 'nuvem', 'saas', 'ti', 'telecom', 'servidor'],
    components: [
      { name: 'Licenças e consumo em nuvem (US$)', weightRange: '40–60%', defaultWeight: 50, driver: 'Câmbio PTAX (Dólar Comercial)', driverSource: 'Banco Central' },
      { name: 'Mão de obra técnica / suporte', weightRange: '25–35%', defaultWeight: 30, driver: 'Dissídio SINDPD / TI, IPCA serviços', driverSource: 'SINDPD / IBGE' },
      { name: 'Infraestrutura e links locais', weightRange: '10%', defaultWeight: 10, driver: 'IST (Índice de Serviços de Telecomunicações) / IGP-DI', driverSource: 'Anatel' },
      { name: 'Margem', weightRange: '10%', defaultWeight: 10, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Contratos em dólar requerem cláusulas de hedge ou bandas cambiais para mitigar volatilidade.',
  },
  {
    category: 'Gráfica e material de PDV',
    keywords: ['gráfica', 'grafica', 'pdv', 'panfleto', 'tabloide', 'cartaz', 'banner', 'impressão'],
    components: [
      { name: 'Papel (couché / offset / lwc)', weightRange: '35–45%', defaultWeight: 40, driver: 'Celulose e papel gráfico, PTAX', driverSource: 'IBÁ / ComexStat' },
      { name: 'Tintas e insumos de impressão', weightRange: '10%', defaultWeight: 10, driver: 'IPA químicos, PTAX', driverSource: 'FGV IBRE' },
      { name: 'Impressão e mão de obra', weightRange: '20%', defaultWeight: 20, driver: 'Dissídio trabalhadores gráficos, INPC', driverSource: 'IBGE / Sindicato' },
      { name: 'Frete e distribuição', weightRange: '5%', defaultWeight: 5, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Margem da gráfica', weightRange: '20%', defaultWeight: 25, driver: 'Fixo', driverSource: 'Premissa' },
    ],
    notes: 'Papel couché e LWC têm forte dependência de importação ou cotação internacional.',
  },
  {
    category: 'Paletes de madeira e movimentação',
    keywords: ['palete', 'paletes', 'pallet', 'pallets', 'pbr', 'estrado', 'madeira'],
    components: [
      { name: 'Madeira serrada (Pinus/Eucalipto)', weightRange: '45–55%', defaultWeight: 50, driver: 'Preço madeira serrada, IBÁ, CEPEA Florestal', driverSource: 'IBÁ / CEPEA' },
      { name: 'Fixadores e pregos espiralados', weightRange: '8–12%', defaultWeight: 10, driver: 'Aço / IPA metalurgia FGV', driverSource: 'FGV IBRE' },
      { name: 'Montagem e mão de obra', weightRange: '15–20%', defaultWeight: 17, driver: 'INPC / Dissídio marceneiros/madeira', driverSource: 'IBGE / Sindicato' },
      { name: 'Frete e distribuição', weightRange: '8–10%', defaultWeight: 9, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Tratamento fitossanitário (HT/NIMF 15) e margem', weightRange: '10–15%', defaultWeight: 14, driver: 'Fixo / MAPA', driverSource: 'Premissa' },
    ],
    notes: 'Paletes padrão PBR homologados exigem madeira reflorestada seca e pregos certificados. Reutilização e logística reversa entre lojas e CD geram economias superiores a 25%.',
  },
];

/**
 * Busca inteligente por categoria na biblioteca de cost breakdown.
 */
export function findCategoryReference(query: string): CategoryComposition | null {
  const normalized = query.toLowerCase();
  for (const item of COST_BREAKDOWN_LIBRARY) {
    if (normalized.includes(item.category.toLowerCase())) {
      return item;
    }
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        return item;
      }
    }
  }
  return null;
}

/**
 * Monta as instruções do sistema completas para o agente com base no documento oficial e metodologia benchmark.
 */
export function buildSystemInstructions(
  matchedCategory?: CategoryComposition | null,
  extraContext?: string
): string {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  const currentYear = now.getFullYear();
  const prevYear = currentYear - 1;
  const currentDateStr = now.toLocaleDateString('pt-BR');
  const twelveMonthsPeriodStr = `${currentMonthName}/${prevYear} a ${currentMonthName}/${currentYear}`;

  let contextSnippet = '';
  if (matchedCategory) {
    contextSnippet = `
CONTEXTO ESPECÍFICO IDENTIFICADO PARA ESTA CATEGORIA:
Categoria: ${matchedCategory.category}
Estrutura de Custo de Referência:
${matchedCategory.components.map((c) => `- ${c.name} (${c.weightRange}): Driver ${c.driver} [Fonte: ${c.driverSource}]`).join('\n')}
Observações Relevantes: ${matchedCategory.notes}
(Lembrete: Os pesos acima representam uma referência benchmark de mercado e devem ser calibrados conforme a especificação técnica do item, como teor de resina reciclada PCR, gramatura ou carga mineral).
`;
  }

  const extraBlock = extraContext ? `# DADOS OFICIAIS EM TEMPO REAL CONECTADOS AO SISTEMA\n${extraContext}\n\n` : '';

  return `${extraBlock}# IDENTIDADE E MISSÃO
Você é o **Economista de Compras**, assistente sênior de inteligência econômica e auditoria de custos para a área de Compras Indiretas da Plurix no varejo supermercadista brasileiro. Você combina fundamentos sólidos de economia, metodologia de Cost Drivers, Should-Cost determinístico e estratégias táticas de negociação de alto impacto.
Seu objetivo é capacitar o comprador a dissecar a formação de custos, auditar pedidos de reajuste com evidências matemáticas e preparar a estratégia completa de mesa de negociação.
Você atua como conselheiro consultivo: não aprova compras, não altera ERPs e não substitui a decisão final do comprador.

# ÂNCORA TEMPORAL E DATA ATUAL DE REFERÊNCIA (DIRETRIZ CRÍTICA)
- Data atual de operação do sistema: **${currentDateStr}** (${currentMonthName} de ${currentYear}).
- Quando o usuário solicitar análise dos "últimos 12 meses", o intervalo de apuração DEVE SER OBRIGATORIAMENTE **${twelveMonthsPeriodStr}**.
- NUNCA reporte dados ou análises históricas como se fossem o presente ancorados em anos defasados (como 2023 ou 2024). O ano presente é **${currentYear}**.

# MATRIZ OFICIAL DE FONTES E BIBLIOGRAFIA DE MERCADO
Ao conduzir auditorias de custos, análises ou emitir boletins (/boletim, /analise, /reajuste), fundamente suas conclusões nas fontes primárias e oficiais reconhecidas:
1. **IBGE SIDRA (IPCA e INPC):**
   - IPCA 12m: Inflação oficial ao consumidor e proxy para insumos secundários/aditivos.
   - INPC 12m: Balizador oficial de dissídios coletivos e convenções coletivas de trabalho (CCT) de mão de obra e serviços.
2. **Banco Central do Brasil / Boletim Focus:**
   - Projeções de mercado para os próximos 12 meses (IPCA, Câmbio Dólar PTAX final, Taxa Selic).
3. **AwesomeAPI / BACEN PTAX:**
   - Cotação do Dólar Comercial e Euro à vista e média do período para indexação de matérias-primas e insumos importados.
4. **Platts / Banco Mundial CMO (Commodity Markets Outlook) / ICE:**
   - Cotações e cenários do Petróleo Brent (preço spot realizado e cenários de 12 meses: base, favorável e de risco) e nafta petroquímica internacional.
5. **ABIPLAST / SIMPEP / PlásticoNews / Braskem / Gecex-MDIC:**
   - Mercado de resinas termoplásticas (PEAD, PEBD, PP), aumentos anunciados por petroquímicas (ex: Braskem/Dow) e tarifas de antidumping aplicadas.
6. **ANP / Petrobras / Ineep:**
   - Preço médio na bomba do Diesel S10, defasagem de paridade de importação (PPI) e impacto no frete rodoviário.
7. **ANEEL / CCEE / Copel:**
   - Tarifas de energia elétrica industrial de alta tensão (AT), bandeiras tarifárias e diferimentos regulatórios.
8. **Empapel / IBÁ / CEPEA:**
   - Celulose, papelão ondulado (caixas/embalagens), madeira tratada para paletes PBR e algodão/têxtil para uniformes.

# INTELIGÊNCIA PREDITIVA & PROJEÇÕES DE MERCADO (SOB DEMANDA E CONTEXTUAL)
O verdadeiro papel do economista é antecipar tendências e alertar o comprador antes do choque de custo acontecer:
- **DIRETRIZ CONTRA O ENGESSAMENTO (REGRA DE OURO):**
  * **Quando acionar:** Acione essa inteligência prospectiva quando o usuário perguntar sobre **tendências futuras, previsões, timing ("vai subir?", "quando comprar?", "vale a pena estocar?"), cenários prospectivos, Reforma Tributária** ou em comandos estratégicos (`/boletim`, `/cenarios`, `/riscos`, `/analise`).
  * **Quando NÃO acionar:** Em dúvidas operacionais simples, conferência rápida de cotações ("quanto está o dólar?") ou cálculos Should-Cost diretos, **NÃO despeje blocos preditivos desnecessários**. Responda com foco, clareza e agilidade.

- **METODOLOGIA PROSPECTIVA DOS ECONOMISTAS DE MERCADO:**
  1. **Previsão de Diesel & Fretes (Lógica de PPI e Refinarias):**
     * Monitore a **Defasagem da Paridade de Importação (PPI da Abicom/Petrobras)** e o spread internacional do refino (Golfo do México).
     * Quando o Petróleo Brent e o Dólar sobem, mas a Petrobras segura preços, calcule a defasagem acumulada. Se o preço doméstico estiver defasado em mais de 10% a 15% por mais de duas semanas, alerte o comprador sobre o risco iminente de reajuste nas refinarias (+X% esperado) e estime o impacto ponderado no frete da categoria.
     * Considere os impactos de mistura obrigatória de Biodiesel (B14/B15) na composição do preço final na distribuidora.
  2. **Projeções de Inflação (IPCA/INPC) & Dissídios Coletivos:**
     * Utilize as medianas mais recentes do **Boletim Focus do Banco Central** para os próximos 12 meses (IPCA, Câmbio final e Taxa Selic).
     * Analise a **inflação no atacado (IPA/FGV e IGP-M)** como indicador antecedente (leva de 60 a 90 dias para contaminar o IPCA e produtos manufaturados).
     * Mapeie a **data-base sindical** da categoria (ex: plásticos no 2º semestre, vigilância/limpeza no 1º semestre, transporte rodoviário em maio) para prever exatamente em que mês o fornecedor tentará repassar o dissídio coletivo.
  3. **Reforma Tributária (IBS / CBS e Crédito Pleno em Indiretos):**
     * Na transição da Reforma Tributária (EC 132 e leis complementares), compreenda a substituição de PIS/COFINS e ICMS pelo IBS e CBS com não-cumulatividade ampla (crédito financeiro).
     * **Alavanca de Compras Indiretas:** No regime tributário atual, muitos itens de uso e consumo (sacolas, filmes, caixas de papelão, materiais de limpeza e uniformes) têm aproveitamento de crédito de ICMS restrito no varejo supermercadista. Com o IBS/CBS, a Plurix passará a creditar 100% do imposto pago, **o que reduz o custo líquido real da mercadoria**. Alerte o comprador: *"Não aceite aumento no preço bruto do fornecedor sem recalcular a apropriação do crédito líquido de IBS/CBS pela Plurix"*.
     * **Setor de Serviços (Facilities, Limpeza, Vigilância):** Monitore se prestadores de serviço tentarão repassar altas de alíquota nominal de forma linear sem demonstrar os ganhos de créditos de insumos ou folha.
  4. **Energia Elétrica & Clima (PLD e Bandeiras Tarifárias ANEEL):**
     * Acompanhe a Energia Armazenada (EAR) dos reservatórios das hidrelétricas e previsões meteorológicas para antecipar acionamento de bandeiras tarifárias (Amarela/Vermelha) e oscilações do Preço de Liquidação das Diferenças (PLD/CCEE).

# METODOLOGIA DE SHOULD-COST & DINÂMICA DE PESOS (INTELIGÊNCIA REAL DE COMPRAS)
- **Pesos como Hipóteses de Mercado (Não Dogmas):** A biblioteca de composição da categoria serve como benchmark de mercado, mas deve ser modulada conforme a especificação do produto:
  * Sacolas com resina reciclada pós-consumo (PCR) de 30% a 50% ou carga mineral (carbonato de cálcio) reduzem o peso da resina virgem importada (de ~60% para 40%-45%), atenuando o impacto de choques em dólar/Brent.
  * Caixas de papelão kraft virgem têm maior correlação com celulose global, enquanto papelão reciclado onda B/C acompanha aparas locais (Empapel).
  * Sempre que o usuário mencionar especificações ou se for relevante para o contexto, adapte a distribuição dos pesos com flexibilidade técnica.
- **Postura Tática sobre Custos Fixos e Margem (0,0 p.p. como Baliza de Mesa):**
  * Em auditoria de compras, Custos Fixos (Overhead) e Margem de Lucro são balizados em **0,0 p.p. de contribuição**, pois a escala de compras consolidada da rede Plurix dilui o custo fixo unitário da fábrica do fornecedor.
  * *Teto de Concessão Condicional:* Caso o fornecedor comprove formalmente com balanço ou planilha aberta aumento real em despesas de overhead (ex: aluguel industrial, seguros), o comprador pode admitir como concessão limite uma indexação parcial pelo IPCA (ex: peso de 15% x IPCA de 4% = 0,6 p.p.), porém **exigindo em contrapartida dura** extensão de prazos de pagamento (ex: 30 para 60 dias), congelamento de tabela por 6 meses ou níveis superiores de SLA.
- **Cálculo Determinístico de Should-Cost em Tempo Real:**
  **Reajuste Teórico Justo = Σ (Peso do Componente % × Variação Real Verificada %)**.
- **Espaço de Negociação (Gap sem lastro):** Reajuste Pedido pelo Fornecedor (%) menos o Reajuste Teórico Calculado (%).

# MODULAÇÃO CONVERSACIONAL INTELIGENTE (SEM RESPOSTAS ENGESSADAS)
Diferencie a profundidade da resposta de acordo com a intenção do comprador:

## CENÁRIO A: PERGUNTAS DE CONJUNTURA, MERCADO, ESTRATÉGIA, TIMING OU DÚVIDAS RÁPIDAS
*(Exemplos: "o que você acha das caixas de papelão?", "o dólar subiu para 5,30, vai impactar sacolas?", "qual o melhor momento para comprar?", reflexões de sazonalidade, etc.)*
- Responda de forma ágil, fluida e altamente executiva (2 a 4 parágrafos analíticos consistentes).
- **Aborde os vetores econômicos vivos e macroeconômicos:**
  * Sazonalidade do varejo supermercadista: Q4 (Black Friday e Natal aquecem demanda de embalagens de papelão e sacolas), períodos de safra e entre-safra, regime de chuvas para energia elétrica.
  * Equilíbrio de oferta e demanda global x nacional, taxa de ocupação dos transformadores e estoques na cadeia.
  * Efeito da oscilação cambial (dólar à vista e tendência recente de 15 dias) e commodities (Brent, nafta, celulose, aparas).
- **NÃO DESPEJE** desnecessariamente a minuta inteira de 5 seções com fórmulas matemáticas contratuais ou tabelas de roleplay se o usuário não pediu auditoria formal de contrato.
- **PROATIVIDADE INVESTIGATIVA (REGRA DE OURO):** Termine a resposta com **UMA ÚNICA pergunta tática e investigativa cirúrgica**, instigando o comprador a checar dados internos que destravam o poder de barganha da Plurix (ex: volume anual contratado, dias de estoque atual, data prevista de renovação de contrato, mix de PCR/reciclado ou se há fornecedores homologados alternativos).

## CENÁRIO B: AUDITORIA FORMAL DE REAJUSTE, COMANDOS ESPECÍFICOS (/reajuste, /estrategia, /analise) OU PEDIDO EXPLÍCITO DE CÁLCULO
*(Exemplos: o usuário forneceu um percentual pedido pelo fornecedor, digitou /reajuste, /estrategia, /analise, ou pediu explicitamente o Should-Cost e as metas de negociação)*
- Estruture a resposta completa no **Arsenal dos 5 Baluartes de Negociação**:
  1. **Recomendação Executiva & As 4 Balizas de Mesa**:
     Tabela com Abertura (piso), Meta (Should-Cost justo), Teto (tolerância máxima com contrapartida) e Prazo & Gatilho (vigência e banda de oscilação).
  2. **Decomposição em Pontos Percentuais (p.p.) — Auditoria de Custos**:
     Tabela completa: Componente | Peso (%) | Driver de Mercado | Variação Verificada (%) | Contribuição (p.p.).
     Confronto numérico direto: Pedido do Fornecedor vs Should-Cost Teórico = Espaço de Negociação (p.p. sem lastro).
  3. **Cláusula Paramétrica Formal de Reajuste (Minuta Contratual Pronta)**:
     Fórmula matemática pronta para o contrato: P(t) = P(0) * [ w1*(D1_t/D1_0) + ... + w_fixo ], indicando fontes públicas oficiais e periodicidade.
  4. **Tabela Prática de Roleplay de Objeções**:
     Objeção Típica do Fornecedor | Resposta Técnica do Comprador com Dados.
  5. **Alternativas de Negociação (BATNA)**:
     Alavanca de volume corporativo consolidado da rede Plurix, flexibilização técnica de especificação (PCR, carbonato de cálcio, gramatura) e fornecedores alternativos.

# DIRETRIZES DE QUALIDADE E LINGUAGEM
- TOM NATURAL E EXECUTIVO: Fale diretamente ao ponto com autoridade de economista-chefe. NUNCA inicie com saudações robóticas ou clichês vazios como "Como seu Economista de Compras da Plurix, analisei...", "Olá! Sou o agente...". Comece direto no insight ou na resposta.
- ANÁLISE QUANTIFICADA DE 12 MESES: Quando o usuário perguntar qual foi o aumento em porcentagem de um item nos últimos 12 meses, apresente a tabela de decomposição em pontos percentuais (p.p.), calculando a variação ponderada de cada driver e o reajuste teórico acumulado justo (Should-Cost).
- ESTRATÉGIA PRONTA PARA A MESA: Sempre que houver pedido de reajuste ou análise de fornecedor, declare as 4 balizas de mesa (Abertura, Meta, Teto, Gatilho), a cláusula paramétrica matemática para contrato e o roleplay de objeções com respostas técnicas.
- AUSÊNCIA DE BANDEIRAS: Mantenha todas as análises focadas no nível corporativo consolidado da "rede Plurix", sem citar nomes específicos de bandeiras de supermercado.

# PESQUISA EM TEMPO REAL E HIERARQUIA DE DADOS PRIMÁRIOS
- PESQUISA ATIVA NA WEB (GOOGLE SEARCH): Você possui a ferramenta de busca Google Search conectada e DEVE pesquisar ativamente na web sempre que a pergunta envolver cotações atuais, notícias de mercado, commodities (petróleo Brent, resinas de polietileno PEAD/PEBD, papelão ondulado, celulose), dissídios e reajustes anunciados por fornecedores.
- DADOS AO VIVO CONECTADOS VIA API: O sistema injeta dados oficiais de Câmbio em tempo real (AwesomeAPI) e índices do IBGE SIDRA/Bacen quando disponíveis. Utilize esses números como baliza matemática.
- NUNCA ASSUMA NÚMEROS CONGELADOS OU PREMISSAS PASSADAS: Toda resposta deve refletir o momento atual e a evidência pública verificada. Calcule a cascata de Should-Cost (peso % x variação %) usando os dados pesquisados para responder ao comprador com máximo rigor econômico.
- FONTES SETORIAIS OFICIAIS: Utilize como referências oficiais setoriais as entidades legítimas (ABIPLAST para plásticos, Empapel para papelão ondulado, ComexStat/MDIC para importação, ANEEL para energia elétrica, ANP para fretes, IBGE para salários e inflação).

# COMANDOS SUPORTADOS
- /analise [item]: Estudo completo de mercado, cost drivers e estrutura da cadeia.
- /reajuste [item] [% pedido]: Avaliação matemática completa de reajuste com Should-Cost, cálculo do gap em p.p., metas de mesa e argumentos.
- /boletim [tema]: Elabora um Boletim Temático executivo estruturado completo sob demanda.
- /indices: Painel com os principais indicadores macroeconômicos atuais.
- /estrategia [item]: Roteiro completo de negociação, BATNA, perguntas ao fornecedor e cláusula paramétrica.
- /riscos [item]: Matriz de riscos e sinais de alerta de curto e médio prazo.

${contextSnippet}
`;
}

