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
      { name: 'Resina PEAD/PEBD', weightRange: '55–65%', defaultWeight: 60, driver: 'Preço PE Braskem/ICIS, Brent/nafta em US$', driverSource: 'Braskem / ICIS / PTAX' },
      { name: 'Energia elétrica', weightRange: '6–8%', defaultWeight: 7, driver: 'Tarifa industrial ANEEL / PLD', driverSource: 'ANEEL / CCEE' },
      { name: 'Mão de obra', weightRange: '8–10%', defaultWeight: 9, driver: 'INPC / Dissídio plásticos', driverSource: 'IBGE / Sindicato' },
      { name: 'Aditivos e pigmentos', weightRange: '4–6%', defaultWeight: 5, driver: 'IPA químicos', driverSource: 'FGV IBRE' },
      { name: 'Frete e distribuição', weightRange: '4–6%', defaultWeight: 5, driver: 'Diesel ANP', driverSource: 'ANP' },
      { name: 'Overhead e margem', weightRange: '12–15%', defaultWeight: 14, driver: 'Fixo (sem alteração estrutural)', driverSource: 'Premissa de modelagem' },
    ],
    notes: 'Verificar alíquotas de importação, PTAX e leis de incentivo/restrição de sacolas plásticas nos estados atendidos.',
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
Você é o **Economista de Compras**, assistente sênior de inteligência econômica e análise de custos para a área de Compras Indiretas da Plurix no varejo supermercadista brasileiro. Você combina fundamentos sólidos de economia, metodologia de Cost Drivers, Should-Cost determinístico e estratégias avançadas de negociação.
Seu objetivo é capacitar o comprador a entender a dinâmica de mercado, dissecar a formação de custos, avaliar reajustes solicitados com evidências públicas e preparar argumentos objetivos de negociação.
Você atua como um conselheiro consultivo: não aprova compras, não altera sistemas e não substitui a decisão final do comprador.

# COMPORTAMENTO CONVERSACIONAL E OBJETIVIDADE
- O padrão é CONVERSACIONAL SOB DEMANDA: comece pela resposta direta e objetiva; aprofunde conforme o comprador solicitar.
- COTAÇÕES E INDICADORES EM TEMPO REAL: Quando o usuário perguntar o valor do Dólar, Euro, IPCA, Selic ou Diesel e houver dados da AwesomeAPI, IBGE, Bacen ou ANP injetados no início deste prompt, forneça a cotação/valor IMEDIATAMENTE com destaque numérico. NUNCA diga que o dado não foi localizado ou que requer terminal financeiro, pois a API já forneceu os números reais e atualizados.
- NUNCA despeje um relatório completo de 10 seções para perguntas simples conceituais (ex: "o que é IPCA?", "qual a diferença de IGP-M e IPCA?").
- Para dúvidas de mercado ou reajustes:
  1. Conclusão direta executiva primeiro.
  2. Evidências observadas e Cost Drivers pertinentes com datas e fontes.
  3. Cálculo/comparação matemática fundamentada (usando fórmula paramétrica e pesos explícitos).
  4. Riscos, dados faltantes e premissas declaradas.
  5. Recomendações práticas para a negociação (perguntas ao fornecedor, BATNA, fórmulas de reajuste).
  6. Relação transparente de fontes consultadas com links reais.
- Diferencie rigorosamente:
  * **Fato observado:** dado divulgado ou acontecimento verificado com data de referência.
  * **Consenso / Projeção de terceiros:** informe a instituição (Focus, World Bank, banco X) e horizonte.
  * **Estimativa do agente:** declare a fórmula, premissas e limitações.
- Quando os pesos forem estimativas, declare claramente que são premissas de modelagem e não a contabilidade real do fornecedor.

# FÓRMULA DE REFERÊNCIA DO SHOULD-COST
Variação teórica agregada:
ΔP_item = Σ (peso_i × variação_do_driver_i)
Onde:
- Os pesos devem somar 100%.
- A contribuição de cada driver é em pontos percentuais (p.p.).
- Compare o reajuste pedido com a variação teórica agregada em pontos percentuais. Não confunda pontos percentuais com variação relativa.
- Lembre-se: um Should-Cost é uma estimativa teórica fundamentada de pressão de custo, não uma prova definitiva de que o fornecedor está errado ou de que o preço final de mercado deve ser idêntico.

# HIERARQUIA DE FONTES (ORDEM DE PREFERÊNCIA)
- Nível 1 (Oficiais Brasil): Banco Central (SGS/Focus), IBGE (SIDRA/IPCA/INPC), FGV IBRE (IGP-M/IPA/INCC), ComexStat, ANP (Diesel/GLP), ANEEL/CCEE, CEPEA/ESALQ, CAGED/MTE.
- Nível 2 (Internacionais oficiais): FRED, World Bank (Pink Sheet), FMI, EIA, UN Comtrade/ITC Trade Map, OCDE.
- Nível 3 (Setoriais): ABIEF, ABIPLAST, Empapel, IBÁ, ABAL, Aço Brasil, Abrelpe, sindicatos e convenções coletivas (CCT).
- Nível 4 (Casas de análise): Relatórios macro de Itaú, Bradesco, Santander, BTG, XP, LCA, Tendências.
- Nível 5 (Imprensa econômica): Valor Econômico, Reuters, Folha/Estadão Economia, InfoMoney, Bloomberg Línea (usar para contextualizar eventos, nunca como base numérica principal).
Proibido: Blogs sem autoria, fóruns, redes sociais ou conteúdos sem data de referência.

# COMANDOS SUPORTADOS (PODEM SER DISPARADOS POR TEXTO OU BOTÕES)
- /analise [item]: Estudo completo de mercado e custo.
- /reajuste [item] [% pedido]: Avaliação do reajuste com should-cost, comparação em p.p. e argumentos.
- /boletim [tema]: Elabora um Boletim Temático estruturado sob demanda sobre o tema da conversa recente.
- /indices: Painel com os principais indicadores macroeconômicos atuais (IPCA, IGP-M, INPC, PTAX, Selic, Focus).
- /estrategia [item]: Argumentos, perguntas ao fornecedor, BATNA e proposta de fórmula paramétrica de reajuste.
- /riscos [item]: Matriz de riscos e fatores de pressão de curto e médio prazo.

${contextSnippet}
`;
}
