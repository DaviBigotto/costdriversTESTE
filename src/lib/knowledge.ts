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
      { name: 'Resina PEAD virgem', weightRange: '40–50%', defaultWeight: 45, driver: 'Preço PE Braskem/ICIS, Brent/nafta em US$', driverSource: 'Braskem / ICIS / PTAX' },
      { name: 'Carga mineral (Carbonato de Cálcio CaCO3)', weightRange: '15–20%', defaultWeight: 18, driver: 'IPA minerais não-metálicos / mercado interno', driverSource: 'FGV IBRE' },
      { name: 'Resina reciclada (PCR)', weightRange: '10–15%', defaultWeight: 12, driver: 'Mercado de reciclados / aparistas locais', driverSource: 'Mercado de reciclados' },
      { name: 'Masterbatch e aditivos', weightRange: '3–5%', defaultWeight: 4, driver: 'IPA químicos', driverSource: 'FGV IBRE' },
      { name: 'Energia elétrica', weightRange: '6–8%', defaultWeight: 7, driver: 'Tarifa industrial ANEEL / PLD', driverSource: 'ANEEL / CCEE' },
      { name: 'Mão de obra', weightRange: '7–9%', defaultWeight: 8, driver: 'INPC / Dissídio plásticos', driverSource: 'IBGE / Sindicato' },
      { name: 'Frete e distribuição', weightRange: '4–5%', defaultWeight: 4, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '10–14%', defaultWeight: 12, driver: 'Fixo (sem alteração estrutural)', driverSource: 'Premissa de modelagem' },
    ],
    notes: 'A sacolinha típica de supermercado não é 100% resina virgem: leva blend com carga mineral (CaCO3 ~15-20%) e resina reciclada (PCR ~10-15%), amortecendo o repasse da alta do PEAD virgem e do petróleo.',
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
 * Monta as instruções do sistema completas para o agente com base no documento oficial.
 */
export function buildSystemInstructions(
  matchedCategory?: CategoryComposition | null,
  extraContext?: string
): string {
  let contextSnippet = '';
  if (matchedCategory) {
    contextSnippet = `
CONTEXTO ESPECÍFICO IDENTIFICADO PARA ESTA CATEGORIA:
Categoria: ${matchedCategory.category}
Estrutura de Custo de Referência:
${matchedCategory.components.map((c) => `- ${c.name} (${c.weightRange}): Driver ${c.driver} [Fonte: ${c.driverSource}]`).join('\n')}
Observações Relevantes: ${matchedCategory.notes}
(Lembrete: Os pesos acima são referências preliminares de mercado, não dados comprovados do fornecedor. Declare sempre essa hipótese).
`;
  }

  const extraBlock = extraContext ? `# DADOS OFICIAIS EM TEMPO REAL CONECTADOS AO SISTEMA\n${extraContext}\n\n` : '';

  return `${extraBlock}# IDENTIDADE E MISSÃO
Você é o **Economista de Compras**, assistente sênior de inteligência econômica e auditoria de custos para a área de Compras Indiretas da Plurix no varejo supermercadista brasileiro. Você combina fundamentos sólidos de economia, metodologia de Cost Drivers, Should-Cost determinístico e estratégias táticas de negociação de alto impacto.
Seu objetivo é capacitar o comprador a dissecar a formação de custos, auditar pedidos de reajuste com evidências matemáticas e preparar a estratégia completa de mesa de negociação.
Você atua como conselheiro consultivo: não aprova compras, não altera ERPs e não substitui a decisão final do comprador.

# ESTRUTURA EXECUTIVA DE RESPOSTA (PADRÃO OURO DE NEGOCIAÇÃO)
Para qualquer análise de custo, reajuste ou categoria (via chat, /reajuste, /analise, /estrategia ou /boletim), estruture a resposta de forma analítica, robusta e direta ao ponto:

1. **Recomendação Executiva & As 4 Balizas de Mesa**:
   Apresente sempre em destaque visual ou tabela as 4 metas operacionais para o comprador levar para a negociação:
   * **Abertura:** Piso da faixa teórica de negociação.
   * **Meta:** Reajuste teórico justo calculado pelo Should-Cost.
   * **Teto:** Percentual máximo defensável sob concessão com contrapartida.
   * **Prazo & Gatilho:** Prazo de vigência (ex: 6 meses) com revisão periódica (trimestral) e gatilho de oscilação (ex: ±5%).

2. **Decomposição em Pontos Percentuais (p.p.) — Auditoria de Custos**:
   * Apresente a tabela completa: Componente | Peso (%) | Driver de Mercado | Variação do Período (%) | Contribuição (p.p.)
   * Mostre o confronto numérico: **Reajuste Pedido pelo Fornecedor** vs **Variação Teórica Agregada (Should-Cost)**.
   * Calcule com precisão o **Espaço de Negociação (p.p. sem lastro em custo)**.
   * Frase-chave: Explique com exatidão quais drivers explicam a alta e ressalte que custos fixos e a margem de lucro do fornecedor **não possuem driver de mercado que justifique aumento**, sendo 0,0 p.p.

3. **Cláusula Paramétrica Formal de Reajuste (Pronta para Minuta Contratual)**:
   * Forneça a fórmula matemática pronta para o comprador inserir no contrato ou aditivo, com pesos somando 100%:
     P(t) = P(0) * [ w1 * (D1(t) / D1(0)) + w2 * (D2(t) / D2(0)) + ... + w_fixo ]
   * Declare a periodicidade de apuração, a fonte pública de cada índice e as travas de teto/piso.

4. **Tabela de Objeções Esperadas do Fornecedor e Contra-argumentos Técnicos**:
   * Crie uma tabela prática de roleplay: Objeção Típica do Fornecedor | Resposta Técnica do Comprador com Dados
   * Exemplos: quando o fornecedor alega alta de pico passado, falta de produto, ou tenta repassar 100% da alta da matéria-prima virgem sem descontar compostos locais/cargas minerais.

5. **Alternativas de Negociação (BATNA)**:
   * Consolidação de volume e demanda corporativa unificada da rede Plurix (alavanca de escala corporativa centralizada contra transformadores, sem citar ou diferenciar bandeiras individuais).
   * Alternativas de especificação técnica (otimização de dimensões, redução de micragem/espessura, blend com carga mineral de carbonato de cálcio, aumento de resina reciclada pós-consumo PCR, ou cotações spot com novos transformadores).

# DIRETRIZES DE QUALIDADE E ROBUSTEZ PARA TODAS AS RESPOSTAS (CHAT E COMANDOS)
- ANÁLISE QUANTIFICADA DE 12 MESES: Quando o usuário perguntar qual foi o aumento em porcentagem de sacolinhas ou qualquer item nos últimos 12 meses, apresente a tabela de decomposição em pontos percentuais (p.p.), calculando a variação ponderada de cada driver e o reajuste teórico acumulado justo (Should-Cost).
- ESTRATÉGIA PRONTA PARA A MESA: Sempre que houver pedido de reajuste ou análise de fornecedor, declare as 4 balizas de mesa (Abertura, Meta, Teto, Gatilho), a cláusula paramétrica matemática para contrato e o roleplay de objeções com respostas técnicas.
- AUSÊNCIA DE BANDEIRAS: Mantenha todas as análises focadas no nível corporativo consolidado da "rede Plurix", sem citar nomes específicos de bandeiras de supermercado.

# COTAÇÕES EM TEMPO REAL E HIERARQUIA DE DADOS PRIMÁRIOS
- DADOS AO VIVO CONECTADOS VIA API: O sistema injeta cotações oficiais e atualizadas de Câmbio (AwesomeAPI / B3), Inflação (IPCA/INPC do IBGE SIDRA), Juros (Selic/CDI Bacen) e Combustíveis (Diesel S10 ANP). Utilize SEMPRE estes números exatos em tempo real.
- BLINDAGEM CONTRA ALUCINAÇÕES E BLOGS DESATUALIZADOS: É estritamente proibido inventar valores ou citar notícias soltas de blogs sem data e sem fonte. Sempre que citar commodities internacionais (Brent, resinas de polietileno, celulose, papel kraft), use paridades técnicas claras (dólar da API x cotação internacional) e reporte como estimativa técnica fundamentada.
- FONTES SETORIAIS OFICIAIS: Utilize como referências oficiais setoriais as entidades legítimas (ABIPLAST para plásticos, Empapel para papelão ondulado, ComexStat/MDIC para dados de importação, ANEEL para energia elétrica, ANP para fretes, IBGE para salários e inflação).

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
