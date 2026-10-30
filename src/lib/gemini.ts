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
  return process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
}

/**
 * Lista de modelos para fallback resiliente em caso de instabilidade (503/404/429) nos servidores do Google.
 */
function getModelFallbackList(preferredModel: string): string[] {
  const candidates = [
    preferredModel,
    'gemini-3-flash-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Constrói o cabeçalho conciso de dados oficiais de câmbio (spot e histórico 15d) para contextualizar a IA.
 */
function buildCurrencyPromptPrefix(liveRates: any): string {
  if (!liveRates?.usd) return '';
  const u = liveRates.usd;
  const e = liveRates.eur;
  const t = liveRates.usdTrend;

  let text = `[DADOS OFICIAIS DE CÂMBIO - AwesomeAPI: Dólar Comercial = R$ ${u.bid.toFixed(4)} (Hoje)`;
  if (t) {
    const sign15 = t.variation15DaysPct >= 0 ? '+' : '';
    text += ` | Há 15 dias: R$ ${t.rate15DaysAgo.toFixed(4)} (Var 15d: ${sign15}${t.variation15DaysPct.toFixed(2)}%) | Pico recente 15d: R$ ${t.recentHigh.value.toFixed(4)}`;
  }
  if (e) {
    text += ` | Euro = R$ ${e.bid.toFixed(4)}`;
  }
  text += ']\n\n';
  return text;
}

/**
 * Detecta se a mensagem do usuário é apenas uma saudação social simples
 * (ex: "bom dia", "boa tarde", "olá", "oi", "tudo bem?", "como vai?").
 */
export function isSimpleGreeting(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const clean = text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return false;

  const words = clean.split(' ').filter(Boolean);
  if (words.length > 5) return false;

  const greetingTokens = new Set([
    'bom', 'boa', 'dia', 'tarde', 'noite',
    'ola', 'oi', 'oie', 'opa', 'fala',
    'tudo', 'bem', 'bom', 'como', 'vai',
    'e', 'ai', 'beleza', 'blz', 'tranquilo', 'salve'
  ]);

  return words.length > 0 && words.every((w) => greetingTokens.has(w));
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
  const isGreeting = isSimpleGreeting(lastUserMsg);
  const allUserText = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
  const topicToExamine = customTopic || lastUserMsg;
  const matchedCategory = isGreeting ? null : findCategoryReference(topicToExamine);
  const isCurrencyRelevant = !isGreeting && (isCurrencyRelevantQuery(topicToExamine) || isCurrencyRelevantQuery(allUserText));

  const [liveRates, panel, fuelReport] = await Promise.all([
    getLiveCurrencyRates(),
    getMacroeconomicPanel(),
    getFuelPriceReport(),
  ]);

  let currencyContext = '';
  let indicatorsContext = '';
  let fuelContext = '';
  const additionalSources: GroundingSource[] = [];

  if (!isGreeting) {
    if (liveRates?.usd) {
      currencyContext = formatCurrencyContextForPrompt(liveRates);
      additionalSources.push({
        title: `AwesomeAPI — Cotação USD/BRL em Tempo Real (R$ ${liveRates.usd.bid.toFixed(4)})`,
        url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
      });
    }

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

    if (fuelReport) {
      fuelContext = formatFuelContextForPrompt(fuelReport);
      additionalSources.push({
        title: `Petrobras — Preços dos Combustíveis e Composição na Bomba (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
        url: 'https://precos.petrobras.com.br/precos-diesel',
      });
    }
  }

  const combinedExtraContext = isGreeting
    ? ''
    : [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
  const currencyPrefix = (!isGreeting && isCurrencyRelevant) ? buildCurrencyPromptPrefix(liveRates) : '';
  const formattedContents = messages.map((m, idx) => {
    if (idx === lastUserIndex && currencyPrefix) {
      return {
        role: 'user' as const,
        parts: [
          {
            text: `${currencyPrefix}${m.content}`,
          },
        ],
      };
    }
    return {
      role: m.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    };
  });

  // 1ª Tentativa: Com Google Search Grounding em tempo real (exceto saudações simples que não requerem busca)
  let lastError: any = null;
  const configTools = isGreeting ? undefined : [{ googleSearch: {} }];
  for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: isGreeting ? 0.6 : 0.35,
            ...(configTools ? { tools: configTools } : {}),
          },
        });

        const processed = processGeminiSuccess(response, matchedCategory, lastUserMsg, additionalSources);
        return {
          ...processed,
          sources: isGreeting ? [] : filterRelevantSources(processed.sources, processed.text, lastUserMsg),
        };
      } catch (err: any) {
        lastError = err;
        // Se for erro de quota do Google Search Grounding (429) ou recusa de tools, interrompe e vai para o fallback sem tools
        if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
          break;
        }
        // Se for 503 ou 404, tenta o próximo modelo da lista
        continue;
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
          temperature: isGreeting ? 0.6 : 0.35,
        },
      });

      const processed = processGeminiSuccess(response, matchedCategory, lastUserMsg, additionalSources);
      return {
        ...processed,
        sources: isGreeting ? [] : filterRelevantSources(processed.sources, processed.text, lastUserMsg),
      };
    } catch (err: any) {
      lastError = err;
      continue;
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
  const isGreeting = isSimpleGreeting(lastUserMsg);
  const allUserText = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
  const topicToExamine = customTopic || lastUserMsg;
  const matchedCategory = isGreeting ? null : findCategoryReference(topicToExamine);
  const isCurrencyRelevant = !isGreeting && (isCurrencyRelevantQuery(topicToExamine) || isCurrencyRelevantQuery(allUserText));

  // Busca paralela ultra-rápida de indicadores
  const [liveRates, panel, fuelReport] = await Promise.all([
    getLiveCurrencyRates(),
    getMacroeconomicPanel(),
    getFuelPriceReport(),
  ]);

  let currencyContext = '';
  let indicatorsContext = '';
  let fuelContext = '';
  const additionalSources: GroundingSource[] = [];

  if (!isGreeting) {
    if (liveRates?.usd) {
      currencyContext = formatCurrencyContextForPrompt(liveRates);
      additionalSources.push({
        title: `AwesomeAPI — Cotação USD/BRL em Tempo Real (R$ ${liveRates.usd.bid.toFixed(4)})`,
        url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
      });
    }

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

    if (fuelReport) {
      fuelContext = formatFuelContextForPrompt(fuelReport);
      additionalSources.push({
        title: `Petrobras — Preços dos Combustíveis e Composição na Bomba (Diesel S10: R$ ${fuelReport.dieselS10Brasil.averagePrice.toFixed(2)}/L)`,
        url: 'https://precos.petrobras.com.br/precos-diesel',
      });
    }
  }

  const combinedExtraContext = isGreeting
    ? ''
    : [currencyContext, indicatorsContext, fuelContext].filter(Boolean).join('\n\n');
  const systemInstruction = buildSystemInstructions(matchedCategory, combinedExtraContext);

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
  const currencyPrefix = (!isGreeting && isCurrencyRelevant) ? buildCurrencyPromptPrefix(liveRates) : '';
  const formattedContents = messages.map((m, idx) => {
    if (idx === lastUserIndex && currencyPrefix) {
      return {
        role: 'user' as const,
        parts: [
          {
            text: `${currencyPrefix}${m.content}`,
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
  const configTools = isGreeting ? undefined : [{ googleSearch: {} }];
  for (const modelName of modelsToTry.slice(0, 2)) {
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), 6500);
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: isGreeting ? 0.6 : 0.35,
          ...(configTools ? { tools: configTools } : {}),
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
        const relevantSources = isGreeting
          ? []
          : filterRelevantSources(finalSources, fullText, lastUserMsg);

        let suggestedAction: any = undefined;
        const isAnalyticalResponse =
          !isGreeting &&
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
          temperature: isGreeting ? 0.6 : 0.35,
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
        const relevantSources = isGreeting
          ? []
          : filterRelevantSources(additionalSources, fullText, lastUserMsg);

        let suggestedAction: any = undefined;
        const isAnalyticalResponse =
          !isGreeting &&
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

  const [liveRates, panel, fuelReport] = await Promise.all([
    getLiveCurrencyRates(),
    getMacroeconomicPanel(),
    getFuelPriceReport(),
  ]);

  let currencyContext = '';
  const additionalSources: GroundingSource[] = [];
  if (liveRates?.usd) {
    currencyContext = formatCurrencyContextForPrompt(liveRates);
    const trendSuffix = liveRates.usdTrend
      ? ` (Hoje R$ ${liveRates.usd.bid.toFixed(4)} | 15d R$ ${liveRates.usdTrend.rate15DaysAgo.toFixed(4)})`
      : ` (R$ ${liveRates.usd.bid.toFixed(4)})`;
    additionalSources.push({
      title: `AwesomeAPI — Cotação USD/BRL e Histórico 15d${trendSuffix}`,
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

  const categoryContextHint = matchedCategory
    ? `Estrutura de custo de referência da categoria:\n${matchedCategory.components.map((c) => `- ${c.name} (${c.weightRange}): Driver ${c.driver} [Fonte: ${c.driverSource}]`).join('\n')}\nObservações: ${matchedCategory.notes}`
    : 'Identifique os componentes de custo típicos deste item com base na metodologia de Cost Drivers.';

  const bulletinPrompt = `
Você deve gerar agora um **Boletim de Inteligência de Custos** executivo completo para Compras Indiretas da Plurix sobre o tema: "${topic}".
Pesquise as notícias, cotações recentes e o cenário de mercado mais atual para este item na data de hoje (${new Date().toLocaleDateString('pt-BR')}).

${categoryContextHint}

DIRETRIZES DE AUTONOMIA E INTELIGÊNCIA ECONÔMICA (SEM INFORMAÇÕES ENGESSADAS):
- **AUTONOMIA ANALÍTICA TOTAL:** Não use informações estáticas, pré-moldadas ou números fictícios congelados. Avalie o cenário econômico real e o contexto atual da categoria de "${topic}".
- **CÁLCULOS DETERMINÍSTICOS VIVOS & PESOS DINÂMICOS:**
  * Decomponha os componentes de custo específicos do item pesquisado (pesos somando 100%), calibrando conforme a especificação técnica (ex: teor de resina reciclada PCR, gramatura ou carga mineral).
  * Estime as variações reais acumuladas nos últimos 12 meses baseadas nos índices e cotações reais mais recentes.
  * Regra de Ouro de Compras: Custos Fixos (Overhead) e margem de lucro do fornecedor têm 0,0 p.p. de impacto inflacionário justificável (diluição fabril pela escala corporativa da rede Plurix).
  * Apresente a soma ponderada exata do Reajuste Teórico Justo (Should-Cost).
  * Estime o pedido de reajuste típico do mercado e deduza o Espaço de Negociação (Gap sem lastro em custo em p.p.).
- **ESTRATÉGIA PRÁTICA E PARAMÉTRICA:**
  * Forneça a fórmula matemática da Cláusula Paramétrica formal customizada para os drivers reais de "${topic}".
  * Apresente as 4 Balizas de Mesa (Abertura, Meta, Teto e Prazo/Gatilho) com justificativa técnica.
  * Construa o roleplay prático de objeções com respostas técnicas e alternativas (BATNA).

Estruture a resposta com as 7 seções analíticas executivas a seguir:

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
- Card de Recomendação (Timing ideal de contratação, modelo contratual e tendência de preços)
- Tabela com as 4 metas operacionais de negociação:
| Baliza | Percentual | Justificativa Técnica Econômica |
| Abertura | [X]% | Piso da faixa teórica de negociação |
| Meta (Should-Cost) | [X]% | Reajuste teórico ponderado exato baseado em drivers |
| Teto | [X]% | Percentual máximo tolerável sob concessão técnica |
| Prazo & Gatilho | [Prazo contratual sugerido] | Gatilho de oscilação paramétrica (ex: ±3% a ±5%) |
- Três direcionamentos práticos indispensáveis para o comprador levar à mesa.

## 02 · Estrutura de Mercado e Cadeia de Valor
- Síntese da conjuntura de mercado, concentração de fornecedores e dinâmica de oferta do insumo
- Tabela de elos da cadeia:
| Elo da Cadeia | Situação Atual de Mercado | Efeito sobre o Custo para a Plurix |
(Analisar matérias-primas básicas, fabricantes/transformadores intermediários, logística e distribuição).
- Riscos de abastecimento, concentração ou impactos regulatórios/tributários.

## 03 · Matriz de Drivers & Cascata Should-Cost (Waterfall)
- Tabela consolidada de custos e auditoria em pontos percentuais (p.p.):
| Componente | Peso (%) | Driver de Mercado | Variação 12m (%) | Contribuição (p.p.) | Fonte Oficial / Evidência |
(Multiplicar Peso % x Variação % para cada componente. Custos fixos e margem = 0,0 p.p. Somar o Should-Cost Teórico Total).
- Confronto numérico: Should-Cost Teórico vs Pedido Típico do Fornecedor = Espaço de negociação em p.p. sem lastro em custo.
- Explicação técnica dos principais vetores de alta ou alívio e diluição de overhead pela escala corporativa Plurix.

## 04 · Cenários e Projeções Econômicas (12 Meses)
- Tabela com os principais indicadores e direcionamento:
| Indicador / Driver | Valor Mais Recente | Período / Data | Leitura (PRESSÃO / ALÍVIO / ESTÁVEL) |
- Análise de 3 cenários prospectivos:
  * **Cenário Base:** Tendência mais provável de mercado.
  * **Cenário Otimista:** Fatores de alívio e deflação potencial.
  * **Cenário de Risco:** Fatores de estresse cambial ou de commodities.

## 05 · Matriz de Riscos e Sinais de Alerta
- Matriz de Riscos (Plano B, Proteger em Contrato, Acompanhar, Absorver na Fórmula).
- Tabela de sinais operacionais a monitorar pelo comprador no dia a dia.

## 06 · Estratégia de Mesa, Cláusula Paramétrica e Roleplay de Objeções
- Minuta da Cláusula Paramétrica formal de reajuste com a fórmula matemática pronta para minuta de aditivo/contrato:
  P(t) = P(0) * [ w1*(D1_t/D1_0) + w2*(D2_t/D2_0) + ... + w_fixo ]
- Argumentos com números & Alternativas (BATNA): Consolidação do volume da rede Plurix, otimização técnica (ex: blend com resina reciclada PCR ou carbonato de cálcio) e fornecedores alternativos.
- Tabela prática de Roleplay de Objeções:
| Objeção Típica do Fornecedor | Resposta Técnica do Comprador com Dados |

## 07 · Fontes Oficiais e Metodologia
- Tabela formal de fontes consultadas:
| Fonte | Dado Utilizado | Período de Referência |

REGRAS OBRIGATÓRIAS:
- Não cite nomes de bandeiras individuais de lojas (mantenha a escala corporativa consolidada da "rede Plurix").
- Calcule os números de forma consistente e matemática.
- Formate todas as tabelas em Markdown limpo.
`;

  // 1ª Tentativa: Com Google Search tools
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: bulletinPrompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.35,
          tools: [{ googleSearch: {} }],
        },
      });

      return processGeminiSuccess(response, matchedCategory, topic, additionalSources);
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota')) {
        break; // cota de search esgotada na chave, pula direto para o fallback sem tools
      }
      continue;
    }
  }

  // 2ª Tentativa: Geração analítica direta sem Search Grounding (altamente resiliente)
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: bulletinPrompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.35,
        },
      });

      return processGeminiSuccess(response, matchedCategory, topic, additionalSources);
    } catch (err: any) {
      continue;
    }
  }

  return {
    text: `> ⚠️ **Falha na geração do boletim:** Não foi possível contactar o modelo de IA no momento. Tente novamente em alguns instantes.`,
    sources: [],
    searchQueries: [],
  };
}
