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
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Filtra as fontes para exibir APENAS o que foi efetivamente citado ou pesquisado na resposta.
 * Elimina links genéricos, institucionais estáticos ou índices não mencionados.
 */
function filterRelevantSources(
  sources: GroundingSource[],
  responseText: string,
  userQuery: string
): GroundingSource[] {
  const combined = (responseText + ' ' + userQuery).toLowerCase();

  return sources.filter((s) => {
    // Links reais encontrados pela ferramenta de busca do Google (groundingChunks): mantém sempre
    if (
      !s.url.includes('awesomeapi.com.br') &&
      !s.url.includes('ibge.gov.br') &&
      !s.url.includes('dadosabertos.bcb.gov.br') &&
      !s.url.includes('bcb.gov.br') &&
      !s.url.includes('precos.petrobras.com.br')
    ) {
      return true;
    }

    // Câmbio AwesomeAPI: só se falar de dólar, câmbio, ptax, moeda americana ou moeda estrangeira
    if (s.url.includes('awesomeapi') && /d[oó]lar|c[aâ]mbio|ptax|usd|moeda/i.test(combined)) {
      return true;
    }

    // IPCA (IBGE): só se falar de ipca ou inflação
    if (s.url.includes('ipca') && /ipca|infla[cç][aã]o/i.test(combined)) {
      return true;
    }

    // INPC (IBGE): só se falar de inpc, dissídio, convenção coletiva, cct ou mão de obra
    if (s.url.includes('inpc') && /inpc|diss[ií]dio|cct|m[aã]o de obra|sal[aá]rio/i.test(combined)) {
      return true;
    }

    // Selic: só se falar de juros, selic, copom
    if (s.url.includes('selic') && /selic|juros|copom/i.test(combined)) {
      return true;
    }

    // Diesel (Petrobras): só se falar de diesel, combustível ou frete rodoviário
    if (s.url.includes('precos-diesel') && /diesel|combust[ií]vel|frete|transporte/i.test(combined)) {
      return true;
    }

    return false;
  });
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
    getLiveCurrencyRates(),
    getMacroeconomicPanel(),
    getFuelPriceReport(),
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
      title: `Petrobras — Preços dos Combustíveis e Composição na Bomba (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: 'https://precos.petrobras.com.br/precos-diesel',
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
            text: `[DADOS OFICIAIS DE CÂMBIO - AwesomeAPI: Dólar Comercial = R$ ${liveRates.usd.bid.toFixed(4)} | Euro = R$ ${liveRates.eur?.bid.toFixed(4) || '5.9812'}]\n\n${m.content}`,
          },
        ],
      };
    }
    return {
      role: m.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    };
  });

  // 1ª Tentativa: Com Google Search Grounding em tempo real para todas as pesquisas
  let lastError: any = null;
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

  // 2ª Tentativa (Fallback Gracioso): Chamada direta ao modelo sem a tool de search (caso o Grounding esteja sem cota)
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
      return {
        ...processed,
        sources: filterRelevantSources(processed.sources, processed.text, lastUserMsg),
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
    getLiveCurrencyRates(),
    getMacroeconomicPanel(),
    getFuelPriceReport(),
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
      title: `Petrobras — Preços dos Combustíveis e Composição na Bomba (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: 'https://precos.petrobras.com.br/precos-diesel',
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
            text: `[DADOS OFICIAIS DE CÂMBIO - AwesomeAPI: Dólar Comercial = R$ ${liveRates.usd.bid.toFixed(4)} | Euro = R$ ${liveRates.eur?.bid.toFixed(4) || '5.9812'}]\n\n${m.content}`,
          },
        ],
      };
    }
    return {
      role: m.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    };
  });

  // 1ª Tentativa: Com Google Search Grounding em streaming em tempo real (fail-fast ágil de 6.5s)
  let lastError: any = null;
  for (const modelName of modelsToTry.slice(0, 2)) {
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), 6500);
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
          abortSignal: controller.signal,
        },
      });

      let fullText = '';
      const finalSources = [...additionalSources];

      for await (const chunk of responseStream) {
        clearTimeout(connectTimer);
        const token = chunk.text || '';
        if (token) {
          fullText += token;
          yield { type: 'token', content: token };
        }

        const candidate = chunk.candidates?.[0];
        const groundingMetadata = candidate?.groundingMetadata;
        if (groundingMetadata?.groundingChunks) {
          for (const gChunk of groundingMetadata.groundingChunks) {
            if (gChunk.web?.uri) {
              const url = gChunk.web.uri;
              const title = gChunk.web.title || url;
              if (!finalSources.some((s) => s.url === url)) {
                finalSources.push({ title, url });
              }
            }
          }
        }
      }
      clearTimeout(connectTimer);

      if (fullText.trim()) {
        const relevantSources = filterRelevantSources(finalSources, fullText, lastUserMsg);

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
          sources: relevantSources,
          suggestedAction,
        };
        return;
      }
    } catch (err: any) {
      clearTimeout(connectTimer);
      lastError = err;
      if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
        break; // cota de search esgotada na chave, pula direto para o fallback sem tools
      }
      continue;
    }
  }

  // 2ª Tentativa (Fallback Gracioso Ágil): Streaming direto sem Search Grounding com fail-fast de 6.5s por modelo
  for (const modelName of modelsToTry) {
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), 6500);
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          abortSignal: controller.signal,
        },
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        clearTimeout(connectTimer);
        const token = chunk.text || '';
        if (token) {
          fullText += token;
          yield { type: 'token', content: token };
        }
      }
      clearTimeout(connectTimer);

      if (fullText.trim()) {
        const relevantSources = filterRelevantSources(additionalSources, fullText, lastUserMsg);

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
          sources: relevantSources,
          suggestedAction,
        };
        return;
      }
    } catch (err: any) {
      clearTimeout(connectTimer);
      lastError = err;
      continue;
    }
  }

  const errText = `> ⚠️ **Servidores Ocupados:** Os modelos de inteligência estão em fila de espera nos servidores do Google (${lastError?.message || 'Serviço temporariamente indisponível'}). Por favor, envie sua mensagem novamente em alguns instantes.`;
  yield { type: 'token', content: errText };
  yield { type: 'done', text: errText, sources: additionalSources, suggestedAction: undefined };
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
    sources: filterRelevantSources(sources, responseText, lastUserMsg),
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
      title: `Petrobras — Preços dos Combustíveis e Composição na Bomba (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
      url: 'https://precos.petrobras.com.br/precos-diesel',
    });
  }

  const combinedExtraContext = [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const categoryContextHint = matchedCategory
    ? `Estrutura de custo de referência da categoria:\n${matchedCategory.components.map((c) => `- ${c.name} (${c.weightRange}): Driver ${c.driver} [Fonte: ${c.driverSource}]`).join('\n')}\nObservações: ${matchedCategory.notes}`
    : 'Identifique os componentes de custo típicos deste item com base na metodologia de Cost Drivers.';

  const bulletinPrompt = `
Você deve gerar agora um **Boletim de Inteligência de Custos** executivo completo para Compras Indiretas da Plurix sobre o tema: "${topic}".
Utilize a ferramenta de busca Google Search para pesquisar notícias, cotações recentes e o cenário de mercado mais atual para este item.

${categoryContextHint}

Siga ESTRITAMENTE a estrutura executiva em 9 seções analíticas completas, com dados objetivos, cálculos matemáticos fundamentados e sem premissas congeladas:

# BOLETIM DE INTELIGÊNCIA DE CUSTOS — ${topic}
**Subtítulo:** Análise de mercado, composição de custo e estratégia de negociação para Compras Indiretas da Plurix
**Data de elaboração:** ${new Date().toLocaleDateString('pt-BR')}
**Escopo:** ${matchedCategory ? matchedCategory.category : topic} · Demanda Corporativa Consolidada Rede Plurix
**Contexto de análise prévia:** ${contextHistory ? contextHistory.slice(0, 1500) : 'Análise de mercado sob demanda para Compras Indiretas.'}

> **DESTAQUES DA CAPA (BIG NUMBERS):**
> * **Reajuste Teórico Justo (Should-Cost):** [Calcule o percentual ponderado justo acumulado em 12 meses baseado nos drivers pesquisados]
> * **Espaço de Negociação (Gap sem lastro):** [Calcule a diferença entre pedidos típicos de mercado e o Should-Cost justo]
> * **Projeção 12 Meses:** [Tendência esperada para os próximos 12 meses: recuo, estabilidade ou pressão]
> * **Recomendação Executiva:** [Resumo executivo da diretriz para o comprador Plurix]

## 01 · Resumo Executivo & Balizas de Mesa
- Manchete: Síntese da conjuntura de custos e sustentação do reajuste
- Card de Recomendação:
  * Timing: Momento adequado para fechar o contrato
  * Contrato: Prazo sugerido e gatilhos de oscilação (±5%)
  * Tendência: Direção dos preços nos próximos trimestres
- Tabela com as 4 metas operacionais de negociação:
| Baliza | Percentual | Justificativa Técnica Econômica |
| Abertura | [X]% | Piso da faixa teórica de negociação |
| Meta (Should-Cost) | [X]% | Reajuste teórico ponderado exato baseado em drivers |
| Teto | [X]% | Percentual máximo tolerável sob concessão técnica |
| Prazo & Gatilho | 6 meses | Revisão periódica e gatilho de oscilação |
- Três coisas fundamentais para o comprador levar à mesa de negociação.

## 02 · Estrutura de Mercado e Cadeia de Valor
- Manchete sobre a concentração de fornecedores e dinâmica de oferta do insumo
- Tabela de elos da cadeia:
| Elo da Cadeia | Situação Atual de Mercado | Efeito sobre o Custo para a Plurix |
(Analisar matérias-primas básicas, fabricantes/transformadores intermediários, logística e distribuição).
- Riscos de abastecimento, concentração de fornecedores ou barreiras regulatórias/tributárias.

## 03 · Composição de Custos e Drivers
- Tabela de composição estimada do preço (%):
| Componente | Peso (%) | Driver de Mercado |
(Preencher com os componentes da categoria somando 100%, destacando que custos fixos e margem não devem sofrer reajuste por inflação de insumos).

## 04 · Drivers: Histórico e Situação Atual
- Tabela de variação em 12 meses dos drivers relevantes:
| Driver | Variação 12m (%) | Fonte Oficial / Evidência Pública |
(Pesquisar e apresentar as variações reais recentes dos índices, commodities e mão de obra envolvidos).

## 05 · Projeções e Cenários
- Tabela com os principais indicadores e direcionamento:
| Indicador / Driver | Valor Mais Recente | Data / Período | Leitura (PRESSÃO / ALÍVIO / ESTÁVEL) |
- Cenário Base, Cenário Otimista e Cenário Pessimista para os próximos 12 meses.

## 06 · Impacto no Preço (Cascata Waterfall em p.p.)
- Tabela de contribuição por componente:
| Componente | Peso (%) | Variação Verificada (%) | Contribuição (p.p.) |
(Multiplicar Peso % x Variação % para cada componente. Custos fixos e margem = 0,0 p.p. Somar o Should-Cost Teórico Total).
- Confronto numérico: Should-Cost Teórico vs Pedido Típico do Fornecedor = Espaço de negociação em p.p. sem lastro em custo.

## 07 · Matriz de Riscos e Sinais de Monitoramento
- Matriz 2x2 de Riscos (Plano B, Proteger em Contrato, Acompanhar, Absorver na Fórmula).
- Tabela de sinais operacionais a monitorar pelo comprador.

## 08 · Estratégia de Negociação, Cláusula Paramétrica e Objeções
- Minuta da Cláusula Paramétrica formal de reajuste com a fórmula matemática pronta para minuta de contrato:
  P(t) = P(0) * [ w1*(D1_t/D1_0) + w2*(D2_t/D2_0) + ... + w_fixo ]
- Argumentos com números & Alternativas (BATNA): Consolidação do volume da rede Plurix, otimização de especificações e cotações spot.
- Tabela prática de Roleplay de Objeções:
| Objeção Típica do Fornecedor | Resposta Técnica do Comprador com Dados |

## 09 · Fontes Oficiais e Metodologia
- Tabela formal de fontes consultadas:
| Fonte | Dado Utilizado | Período de Referência |

REGRAS OBRIGATÓRIAS:
- Não cite nomes de bandeiras individuais de lojas (mantenha a escala corporativa consolidada da "rede Plurix").
- Calcule os números de forma consistente e matemática.
- Formate todas as tabelas em Markdown limpo.
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
