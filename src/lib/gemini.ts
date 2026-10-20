import { GoogleGenAI } from '@google/genai';
import { buildSystemInstructions, findCategoryReference } from './knowledge';
import {
  getLiveCurrencyRates,
  isCurrencyRelevantQuery,
  formatCurrencyContextForPrompt,
} from './currency';
import {
  getMacroeconomicPanel,
  isIndicatorsRelevantQuery,
  formatIndicatorsContextForPrompt,
} from './indicators';
import {
  getFuelPriceReport,
  isFuelRelevantQuery,
  formatFuelContextForPrompt,
} from './fuel';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GeminiResponse {
  text: string;
  sources: GroundingSource[];
  searchQueries: string[];
  suggestedAction?: {
    type: 'generate_bulletin' | 'open_calculator';
    label: string;
    topic?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * Retorna a instância do Google GenAI SDK.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Obtém o modelo configurado via variável de ambiente ou usa o default recomendado.
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
}

/**
 * Lista de modelos para fallback resiliente em caso de instabilidade (503/404) nos servidores do Google.
 */
function getModelFallbackList(preferredModel: string): string[] {
  const candidates = [
    preferredModel,
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Mapeia cada categoria da biblioteca de Cost Drivers para a entidade oficial ou regulatória legítima do setor.
 */
function getSectorSourceForCategory(categoryName: string): GroundingSource {
  const sourcesMap: Record<string, GroundingSource> = {
    'Sacolas plásticas (PEAD/PEBD)': {
      title: 'ABIPLAST — Associação Brasileira da Indústria do Plástico',
      url: 'https://www.abiplast.org.br/',
    },
    'Filmes, bandejas e embalagens plásticas': {
      title: 'ABIPLAST — Associação Brasileira da Indústria do Plástico',
      url: 'https://www.abiplast.org.br/',
    },
    'Embalagens de papel/papelão': {
      title: 'Empapel — Associação Brasileira de Embalagens em Papel',
      url: 'https://empapel.org.br/',
    },
    'Bobinas térmicas e etiquetas': {
      title: 'ComexStat / MDIC — Estatísticas Oficiais de Importação de Papel Térmico',
      url: 'https://comexstat.mdic.gov.br/',
    },
    'Material de limpeza e higiene': {
      title: 'ABIPLA — Associação Brasileira das Indústrias de Produtos de Higiene e Limpeza',
      url: 'https://abipla.org.br/',
    },
    'Limpeza e conservação terceirizada': {
      title: 'IBGE — SIDRA (INPC e Dissídios Coletivos de Trabalho)',
      url: 'https://sidra.ibge.gov.br/',
    },
    'Manutenção predial e refrigeração comercial': {
      title: 'ABRAVA — Associação Brasileira de Refrigeração e Ar Condicionado',
      url: 'https://abrava.com.br/',
    },
    'Uniformes e EPIs': {
      title: 'ABIT — Associação Brasileira da Indústria Têxtil',
      url: 'https://www.abit.org.br/',
    },
    'Frete dedicado e transporte de transferência': {
      title: 'ANP — Levantamento de Preços de Combustíveis (Diesel S10)',
      url: 'https://www.gov.br/anp/pt-br',
    },
    'TI e Telecom': {
      title: 'Banco Central do Brasil — Câmbio PTAX Oficial',
      url: 'https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes',
    },
    'Gráfica, encartes promocionais e material de PDV': {
      title: 'ABIGRAF — Associação Brasileira da Indústria Gráfica',
      url: 'https://abigraf.org.br/',
    },
  };

  return (
    sourcesMap[categoryName] || {
      title: `Referencial Setorial Plurix: ${categoryName}`,
      url: 'https://sidra.ibge.gov.br/',
    }
  );
}

/**
 * Executa a chamada à Gemini API para o assistente conversacional do Economista de Compras.
 * Implementa estratégia resiliente: tenta com Google Search Grounding; caso a cota do Grounding
 * esteja esgotada (429 RESOURCE_EXHAUSTED), realiza fallback automático para o modelo direto
 * com a rica base de conhecimento econômico.
 */
export async function generateEconomistResponse(
  messages: ChatMessage[],
  customTopic?: string
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      text: `> ⚠️ **Atenção: Chave de API não configurada.**\n\nPara que o **Economista de Compras** consulte dados em tempo real e responda dinamicamente via IA, você precisa configurar a variável \`GEMINI_API_KEY\` no arquivo \`.env\`.\n\n### Como configurar:\n1. Crie ou edite o arquivo \`.env\` na raiz do projeto (baseado em \`.env.example\`).\n2. Adicione sua chave: \`GEMINI_API_KEY=sua_chave_aqui\`\n3. Adicione o modelo desejado: \`GEMINI_MODEL=gemini-3.5-flash\`\n4. Reinicie o servidor de desenvolvimento (\`npm run dev\`).\n\n*Enquanto a chave não for configurada, o motor de cálculo determinístico e a biblioteca de composições continuam funcionando localmente.*`,
      sources: [],
      searchQueries: [],
    };
  }

  const ai = getGeminiClient();
  const preferredModel = getGeminiModel();
  const modelsToTry = getModelFallbackList(preferredModel);

  // Contextualização com base na biblioteca de custos e dados de câmbio em tempo real (AwesomeAPI)
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const allUserText = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
  const topicToExamine = customTopic || lastUserMsg;
  const matchedCategory = findCategoryReference(topicToExamine);
  const isCurrencyRelevant = isCurrencyRelevantQuery(topicToExamine) || isCurrencyRelevantQuery(allUserText);

  const [liveRates, panel, fuelReport] = await Promise.all([
    isCurrencyRelevant ? getLiveCurrencyRates() : Promise.resolve(null),
    isIndicatorsRelevantQuery(topicToExamine) || isIndicatorsRelevantQuery(allUserText)
      ? getMacroeconomicPanel()
      : Promise.resolve(null),
    isFuelRelevantQuery(topicToExamine) || isFuelRelevantQuery(allUserText)
      ? getFuelPriceReport()
      : Promise.resolve(null),
  ]);

  let currencyContext = '';
  const additionalSources: GroundingSource[] = [];

  if (liveRates?.usd) {
    currencyContext = formatCurrencyContextForPrompt(liveRates);
    additionalSources.push({
      title: `AwesomeAPI — Cotação USD/BRL em Tempo Real (R$ ${liveRates.usd.bid.toFixed(4)})`,
      url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
    });
  }

  let indicatorsContext = '';
  if (panel) {
    indicatorsContext = formatIndicatorsContextForPrompt(panel);
    if (panel.ipca) {
      additionalSources.push({
        title: `IBGE — IPCA Oficial (${panel.ipca.referencePeriod}): 12m ${panel.ipca.accumulated12m}%`,
        url: panel.ipca.sourceUrl,
      });
    }
    if (panel.inpc) {
      additionalSources.push({
        title: `IBGE — INPC Oficial (${panel.inpc.referencePeriod}): 12m ${panel.inpc.accumulated12m}%`,
        url: panel.inpc.sourceUrl,
      });
    }
    if (panel.selic) {
      additionalSources.push({
        title: `Banco Central — Taxa Selic (${panel.selic.annualRate}% a.a.)`,
        url: panel.selic.sourceUrl,
      });
    }
  }

  let fuelContext = '';
  if (fuelReport) {
    fuelContext = formatFuelContextForPrompt(fuelReport);
    additionalSources.push({
      title: `ANP — Levantamento de Preços de Combustíveis (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: fuelReport.dieselS10Brasil.sourceUrl,
    });
  }

  const combinedExtraContext = [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
  const formattedContents = messages.map((m, idx) => {
    if (idx === lastUserIndex && liveRates?.usd) {
      return {
        role: 'user' as const,
        parts: [
          {
            text: `[DADOS OFICIAIS ATUAIS DE CÂMBIO - AwesomeAPI / Radar de Mercado: Dólar Comercial = R$ ${liveRates.usd.bid.toFixed(4)} | Euro = R$ ${liveRates.eur?.bid.toFixed(4) || '5.6728'}. Use OBRIGATORIAMENTE este valor oficial como referência atual do dólar]\n\n${m.content}`,
          },
        ],
      };
    }
    return {
      role: m.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    };
  });

  // Quando o usuário pesquisa câmbio, evitamos que o Google Search sobreponha a cotação oficial da AwesomeAPI com páginas desatualizadas
  const skipSearchGrounding = isCurrencyRelevant;

  // 1ª Tentativa: Com Google Search Grounding (apenas para pesquisas sem foco direto de cotação oficial)
  let lastError: any = null;
  if (!skipSearchGrounding) {
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            tools: [{ googleSearch: {} }],
          },
        });

        return processGeminiSuccess(response, matchedCategory, lastUserMsg, additionalSources);
      } catch (err: any) {
        lastError = err;
        // Se for erro de quota do Google Search Grounding (429) ou recusa de tools, interrompe e vai para o fallback sem tools
        if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
          break;
        }
        // Se for 503 ou 404, tenta o próximo modelo da lista
        if (err?.status === 503 || err?.status === 404) {
          continue;
        }
      }
    }
  }

  // 2ª Tentativa (Fallback Gracioso): Chamada direta ao modelo sem a tool de search (caso o Grounding esteja sem cota ou seja consulta direta de cotação)
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      const processed = processGeminiSuccess(response, matchedCategory, lastUserMsg, additionalSources);
      // Adiciona a entidade regulatória ou setorial oficial correspondente à categoria
      const finalSources = [...processed.sources];
      if (matchedCategory && !finalSources.some((s) => s.title.includes(matchedCategory.category))) {
        finalSources.push(getSectorSourceForCategory(matchedCategory.category));
      }

      return {
        ...processed,
        sources: finalSources,
      };
    } catch (err: any) {
      lastError = err;
      if (err?.status === 503 || err?.status === 404) {
        continue;
      }
    }
  }

  // Se todos os modelos falharem, trata o erro de forma clara
  console.error('Erro em todas as tentativas da Gemini API:', lastError);

  if (lastError?.status === 403 || lastError?.message?.includes('API_KEY_INVALID')) {
    return {
      text: `> 🛑 **Erro de Autenticação:** A chave \`GEMINI_API_KEY\` configurada no arquivo \`.env\` é inválida. Por favor, verifique se a chave gerada no Google AI Studio está correta.`,
      sources: [],
      searchQueries: [],
    };
  }

  if (lastError?.status === 429 || lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
    return {
      text: `> ⏳ **Limite Geral de Requisições:** A sua cota na Gemini API foi excedida no momento. Aguarde cerca de 1 minuto antes de enviar uma nova consulta.`,
      sources: [],
      searchQueries: [],
    };
  }

  return {
    text: `> ⚠️ **Falha na comunicação:** Ocorreu um problema temporário de conexão com os servidores da Gemini API (${lastError?.message || 'Serviço indisponível'}). Por favor, tente novamente em instantes.`,
    sources: [],
    searchQueries: [],
  };
}

/**
 * Executa a geração com Streaming token-a-token para experiência instantânea do usuário.
 */
export async function* streamEconomistResponse(
  messages: ChatMessage[],
  customTopic?: string
): AsyncGenerator<
  | { type: 'token'; content: string }
  | { type: 'done'; text: string; sources: GroundingSource[]; suggestedAction?: any }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const errorText = `> ⚠️ **Atenção: Chave de API não configurada.**\n\nConfigure a variável \`GEMINI_API_KEY\` no arquivo \`.env\` ou na Vercel para ativar as respostas de IA em tempo real.`;
    yield { type: 'token', content: errorText };
    yield { type: 'done', text: errorText, sources: [], suggestedAction: undefined };
    return;
  }

  const ai = getGeminiClient();
  const preferredModel = getGeminiModel();
  const modelsToTry = getModelFallbackList(preferredModel);

  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const allUserText = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
  const topicToExamine = customTopic || lastUserMsg;
  const matchedCategory = findCategoryReference(topicToExamine);
  const isCurrencyRelevant = isCurrencyRelevantQuery(topicToExamine) || isCurrencyRelevantQuery(allUserText);

  // Busca paralela ultra-rápida de indicadores
  const [liveRates, panel, fuelReport] = await Promise.all([
    isCurrencyRelevant ? getLiveCurrencyRates() : Promise.resolve(null),
    isIndicatorsRelevantQuery(topicToExamine) || isIndicatorsRelevantQuery(allUserText)
      ? getMacroeconomicPanel()
      : Promise.resolve(null),
    isFuelRelevantQuery(topicToExamine) || isFuelRelevantQuery(allUserText)
      ? getFuelPriceReport()
      : Promise.resolve(null),
  ]);

  let currencyContext = '';
  const additionalSources: GroundingSource[] = [];

  if (liveRates?.usd) {
    currencyContext = formatCurrencyContextForPrompt(liveRates);
    additionalSources.push({
      title: `AwesomeAPI — Cotação USD/BRL em Tempo Real (R$ ${liveRates.usd.bid.toFixed(4)})`,
      url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
    });
  }

  let indicatorsContext = '';
  if (panel) {
    indicatorsContext = formatIndicatorsContextForPrompt(panel);
    if (panel.ipca) {
      additionalSources.push({
        title: `IBGE — IPCA Oficial (${panel.ipca.referencePeriod}): 12m ${panel.ipca.accumulated12m}%`,
        url: panel.ipca.sourceUrl,
      });
    }
    if (panel.inpc) {
      additionalSources.push({
        title: `IBGE — INPC Oficial (${panel.inpc.referencePeriod}): 12m ${panel.inpc.accumulated12m}%`,
        url: panel.inpc.sourceUrl,
      });
    }
    if (panel.selic) {
      additionalSources.push({
        title: `Banco Central — Taxa Selic (${panel.selic.annualRate}% a.a.)`,
        url: panel.selic.sourceUrl,
      });
    }
  }

  let fuelContext = '';
  if (fuelReport) {
    fuelContext = formatFuelContextForPrompt(fuelReport);
    additionalSources.push({
      title: `ANP — Levantamento de Preços de Combustíveis (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: fuelReport.dieselS10Brasil.sourceUrl,
    });
  }

  const combinedExtraContext = [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
  const formattedContents = messages.map((m, idx) => {
    if (idx === lastUserIndex && liveRates?.usd) {
      return {
        role: 'user' as const,
        parts: [
          {
            text: `[DADOS OFICIAIS ATUAIS DE CÂMBIO - AwesomeAPI / Radar de Mercado: Dólar Comercial = R$ ${liveRates.usd.bid.toFixed(4)} | Euro = R$ ${liveRates.eur?.bid.toFixed(4) || '5.6728'}. Use OBRIGATORIAMENTE este valor oficial como referência atual do dólar]\n\n${m.content}`,
          },
        ],
      };
    }
    return {
      role: m.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    };
  });

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        const token = chunk.text || '';
        if (token) {
          fullText += token;
          yield { type: 'token', content: token };
        }
      }

      const finalSources = [...additionalSources];
      if (matchedCategory && !finalSources.some((s) => s.title.includes(matchedCategory.category))) {
        finalSources.push(getSectorSourceForCategory(matchedCategory.category));
      }

      let suggestedAction: any = undefined;
      const isAnalyticalResponse =
        fullText.length > 300 &&
        (matchedCategory !== null ||
          /reajuste|cost driver|should-cost|projeção|cenário|mercado|análise|inflação|câmbio|dólar|dolar/i.test(lastUserMsg));

      if (isAnalyticalResponse) {
        suggestedAction = {
          type: 'generate_bulletin',
          label: 'Gerar boletim deste tema',
          topic: matchedCategory ? matchedCategory.category : lastUserMsg.slice(0, 60),
        };
      }

      yield {
        type: 'done',
        text: fullText,
        sources: finalSources,
        suggestedAction,
      };
      return;
    } catch (err: any) {
      lastError = err;
      if (err?.status === 503 || err?.status === 404 || err?.status === 429) {
        continue;
      }
    }
  }

  const errText = `> ⚠️ **Falha na comunicação:** Ocorreu um problema temporário de conexão com os servidores da Gemini API (${lastError?.message || 'Serviço indisponível'}). Por favor, tente novamente em instantes.`;
  yield { type: 'token', content: errText };
  yield { type: 'done', text: errText, sources: [], suggestedAction: undefined };
}

function processGeminiSuccess(
  response: any,
  matchedCategory: any,
  lastUserMsg: string,
  extraSources: GroundingSource[] = []
): GeminiResponse {
  const responseText = response.text || 'Não foi possível gerar uma resposta para esta solicitação.';
  const candidate = response.candidates?.[0];
  const groundingMetadata = candidate?.groundingMetadata;

  const sources: GroundingSource[] = [];
  const searchQueries: string[] = [];

  // Fontes oficiais dinâmicas em tempo real (ex: AwesomeAPI)
  for (const extra of extraSources) {
    if (!sources.some((s) => s.url === extra.url)) {
      sources.push(extra);
    }
  }

  if (groundingMetadata?.webSearchQueries) {
    searchQueries.push(...groundingMetadata.webSearchQueries);
  }

  if (groundingMetadata?.groundingChunks) {
    for (const chunk of groundingMetadata.groundingChunks) {
      if (chunk.web?.uri) {
        const title = chunk.web.title || chunk.web.uri;
        if (!sources.some((s) => s.url === chunk.web?.uri)) {
          sources.push({ title, url: chunk.web.uri });
        }
      }
    }
  }

  let suggestedAction: GeminiResponse['suggestedAction'] = undefined;
  const isAnalyticalResponse =
    responseText.length > 300 &&
    (matchedCategory !== null ||
      /reajuste|cost driver|should-cost|projeção|cenário|mercado|análise|inflação|câmbio|dólar|dolar/i.test(lastUserMsg));

  if (isAnalyticalResponse) {
    suggestedAction = {
      type: 'generate_bulletin',
      label: 'Gerar boletim deste tema',
      topic: matchedCategory ? matchedCategory.category : lastUserMsg.slice(0, 60),
    };
  }

  return {
    text: responseText,
    sources,
    searchQueries,
    suggestedAction,
  };
}

/**
 * Geração de Boletim Temático Sob Demanda com fallback resiliente.
 */
export async function generateBulletinContent(
  topic: string,
  contextHistory?: string
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      text: `> ⚠️ **GEMINI_API_KEY não configurada.** Não é possível gerar o boletim sem chave da API no arquivo \`.env\`.`,
      sources: [],
      searchQueries: [],
    };
  }

  const ai = getGeminiClient();
  const preferredModel = getGeminiModel();
  const modelsToTry = getModelFallbackList(preferredModel);
  const matchedCategory = findCategoryReference(topic);

  let currencyContext = '';
  const additionalSources: GroundingSource[] = [];
  if (isCurrencyRelevantQuery(topic) || isCurrencyRelevantQuery(contextHistory || '')) {
    const liveRates = await getLiveCurrencyRates();
    if (liveRates?.usd) {
      currencyContext = formatCurrencyContextForPrompt(liveRates);
      additionalSources.push({
        title: `AwesomeAPI — Cotação USD/BRL em Tempo Real (R$ ${liveRates.usd.bid.toFixed(4)})`,
        url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
      });
    }
  }

  let indicatorsContext = '';
  if (isIndicatorsRelevantQuery(topic) || isIndicatorsRelevantQuery(contextHistory || '')) {
    const panel = await getMacroeconomicPanel();
    indicatorsContext = formatIndicatorsContextForPrompt(panel);
    if (panel.ipca) {
      additionalSources.push({
        title: `IBGE — IPCA Oficial (${panel.ipca.referencePeriod}): 12m ${panel.ipca.accumulated12m}%`,
        url: panel.ipca.sourceUrl,
      });
    }
    if (panel.inpc) {
      additionalSources.push({
        title: `IBGE — INPC Oficial (${panel.inpc.referencePeriod}): 12m ${panel.inpc.accumulated12m}%`,
        url: panel.inpc.sourceUrl,
      });
    }
    if (panel.selic) {
      additionalSources.push({
        title: `Banco Central — Taxa Selic (${panel.selic.annualRate}% a.a.)`,
        url: panel.selic.sourceUrl,
      });
    }
  }

  let fuelContext = '';
  if (isFuelRelevantQuery(topic) || isFuelRelevantQuery(contextHistory || '')) {
    const fuelReport = await getFuelPriceReport();
    fuelContext = formatFuelContextForPrompt(fuelReport);
    additionalSources.push({
      title: `ANP — Levantamento de Preços de Combustíveis (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: fuelReport.dieselS10Brasil.sourceUrl,
    });
  }

  const combinedExtraContext = [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const bulletinPrompt = `
Você deve gerar agora um **Boletim de Mercado Sob Demanda** para Compras Indiretas da Plurix sobre o tema: "${topic}".
Siga ESTRITAMENTE a estrutura corporativa definida na metodologia do Economista de Compras:

# Boletim de Mercado — ${topic}
**Data de elaboração:** ${new Date().toLocaleDateString('pt-BR')}
**Escopo:** ${matchedCategory ? matchedCategory.category : topic}
**Contexto de análise prévia:** ${contextHistory ? contextHistory.slice(0, 1500) : 'Análise econômica sob demanda do comprador.'}

Estrutura OBRIGATÓRIA:
## 1. Resumo executivo (até 5 pontos diretos com a conclusão para Compras)
## 2. O que está acontecendo (acontecimentos recentes com datas de ocorrência e publicação)
## 3. Indicadores econômicos acompanhados (Tabela Markdown com: Indicador | Último Valor | Variação Período | Data de Referência | Fonte)
## 4. Principais Cost Drivers (Fatores diretos e indiretos, explicando o canal de transmissão)
## 5. Impacto para Compras Indiretas (Quais categorias/itens são afetados e como)
## 6. Riscos e Oportunidades (Separar fatos confirmados de hipóteses e riscos)
## 7. Implicações para a Negociação (Pontos a checar com fornecedores, argumentos com dados, perguntas-chave)
## 8. O que monitorar a seguir (Gatilhos, datas-base e eventos críticos)
## 9. Fontes consultadas (Lista de fontes com datas e links das pesquisas)

REGRAS:
- Fundamente as análises na metodologia de Cost Drivers e na biblioteca do setor.
- Não invente dados numéricos como fatos comprovados; declare premissas e estimativas.
${currencyContext ? `- COTAÇÃO ATUAL DO DÓLAR E EURO (AwesomeAPI / Radar de Mercado): Use rigorosamente os dados oficiais informados nas instruções do sistema. Toda menção ao valor atual do dólar deve seguir a base oficial da AwesomeAPI (~R$ 5,05 a R$ 5,06). NUNCA utilize valores desatualizados como 5,75.` : ''}
- Formate tabelas de forma limpa em Markdown.
`;

  // Tenta com tools primeiro, fallback sem tools
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: bulletinPrompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        },
      });

      return processGeminiSuccess(response, matchedCategory, topic, additionalSources);
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        break; // vai para fallback sem tool
      }
    }
  }

  // Fallback sem tool
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: bulletinPrompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      return processGeminiSuccess(response, matchedCategory, topic, additionalSources);
    } catch (err: any) {
      if (err?.status === 503 || err?.status === 404) {
        continue;
      }
    }
  }

  return {
    text: `> ⚠️ **Falha na geração do boletim:** Não foi possível contactar o modelo de IA no momento. Tente novamente em alguns instantes.`,
    sources: [],
    searchQueries: [],
  };
}
