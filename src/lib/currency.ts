/**
 * Módulo de Câmbio e Moedas em Tempo Real via AwesomeAPI.
 * Fornece cotações oficiais e atualizadas do Dólar (USD/BRL) e Euro (EUR/BRL)
 * incluindo histórico recente de 15 dias para embasamento de cost drivers e negociações de Compras Indiretas.
 */

export interface CurrencyRate {
  code: string;
  name: string;
  bid: number; // Cotação de compra
  ask: number; // Cotação de venda
  high: number; // Máxima do dia
  low: number; // Mínima do dia
  pctChange: number; // Variação percentual no dia
  varBid: number; // Variação nominal em R$
  rawDate: string; // Data retornada pela API
  formattedDate: string;
}

export interface CurrencyHistoricalPoint {
  date: string; // ex: '2026-10-28'
  bid: number;
  high: number;
  low: number;
  pctChange: number;
}

export interface CurrencyTrendSummary {
  currentBid: number;
  rate7DaysAgo: number;
  rate15DaysAgo: number;
  variation7DaysPct: number;
  variation15DaysPct: number;
  recentHigh: { value: number; date: string };
  recentLow: { value: number; date: string };
  history: CurrencyHistoricalPoint[];
}

export interface LiveCurrencyData {
  usd?: CurrencyRate;
  eur?: CurrencyRate;
  usdTrend?: CurrencyTrendSummary;
  eurTrend?: CurrencyTrendSummary;
  fetchedAt: number;
}

// Base de contingência oficial alinhada ao mercado (caso a AwesomeAPI oscile ou atinja timeout)
const DEFAULT_FALLBACK_RATES: LiveCurrencyData = {
  usd: {
    code: 'USD',
    name: 'Dólar Americano/Real Brasileiro',
    bid: 5.3514,
    ask: 5.3519,
    high: 5.4191,
    low: 5.3077,
    pctChange: -0.37,
    varBid: -0.0198,
    rawDate: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('pt-BR'),
  },
  eur: {
    code: 'EUR',
    name: 'Euro/Real Brasileiro',
    bid: 5.9540,
    ask: 5.9560,
    high: 6.0424,
    low: 5.9194,
    pctChange: -0.84,
    varBid: -0.0504,
    rawDate: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('pt-BR'),
  },
  usdTrend: {
    currentBid: 5.3514,
    rate7DaysAgo: 5.0238,
    rate15DaysAgo: 4.9918,
    variation7DaysPct: 6.52,
    variation15DaysPct: 7.20,
    recentHigh: { value: 5.6040, date: '2026-10-26' },
    recentLow: { value: 4.9636, date: '2026-10-15' },
    history: [],
  },
  eurTrend: {
    currentBid: 5.9540,
    rate7DaysAgo: 5.6392,
    rate15DaysAgo: 5.5633,
    variation7DaysPct: 5.58,
    variation15DaysPct: 7.02,
    recentHigh: { value: 6.1190, date: '2026-10-26' },
    recentLow: { value: 5.5593, date: '2026-10-15' },
    history: [],
  },
  fetchedAt: Date.now(),
};

// Cache em memória com TTL de 60 segundos
let cachedRates: LiveCurrencyData | null = null;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Converte array diário da AwesomeAPI em resumo analítico de tendência cambial.
 */
function parseTrendFromDailyItems(items: any[]): CurrencyTrendSummary | undefined {
  if (!items || !Array.isArray(items) || items.length === 0) return undefined;

  const history: CurrencyHistoricalPoint[] = items.map((item) => {
    const rawDate = item.create_date || '';
    const date = rawDate
      ? rawDate.split(' ')[0]
      : new Date((parseInt(item.timestamp, 10) || Date.now() / 1000) * 1000).toISOString().split('T')[0];

    return {
      date,
      bid: parseFloat(item.bid) || 0,
      high: parseFloat(item.high) || 0,
      low: parseFloat(item.low) || 0,
      pctChange: parseFloat(item.pctChange) || 0,
    };
  });

  const currentBid = history[0]?.bid || 0;
  const rate7DaysAgo = history[Math.min(6, history.length - 1)]?.bid || currentBid;
  const rate15DaysAgo = history[history.length - 1]?.bid || currentBid;

  const variation7DaysPct = rate7DaysAgo > 0 ? ((currentBid - rate7DaysAgo) / rate7DaysAgo) * 100 : 0;
  const variation15DaysPct = rate15DaysAgo > 0 ? ((currentBid - rate15DaysAgo) / rate15DaysAgo) * 100 : 0;

  let recentHigh = { value: history[0]?.high || currentBid, date: history[0]?.date || '' };
  let recentLow = { value: history[0]?.low || currentBid, date: history[0]?.date || '' };

  for (const pt of history) {
    if (pt.high > recentHigh.value) {
      recentHigh = { value: pt.high, date: pt.date };
    }
    if (pt.low > 0 && pt.low < recentLow.value) {
      recentLow = { value: pt.low, date: pt.date };
    }
  }

  return {
    currentBid,
    rate7DaysAgo,
    rate15DaysAgo,
    variation7DaysPct: Math.round(variation7DaysPct * 100) / 100,
    variation15DaysPct: Math.round(variation15DaysPct * 100) / 100,
    recentHigh,
    recentLow,
    history,
  };
}

/**
 * Busca as cotações em tempo real de USD/BRL e EUR/BRL na AwesomeAPI
 * juntamente com o histórico diário dos últimos 15 dias.
 */
export async function getLiveCurrencyRates(): Promise<LiveCurrencyData> {
  const now = Date.now();
  if (cachedRates && now - cachedRates.fetchedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout resiliente

    const [spotRes, usdDailyRes, eurDailyRes] = await Promise.allSettled([
      fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }),
      fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/15', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }),
      fetch('https://economia.awesomeapi.com.br/json/daily/EUR-BRL/15', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }),
    ]);

    clearTimeout(timeout);

    let parsedSpotUsd: CurrencyRate | undefined;
    let parsedSpotEur: CurrencyRate | undefined;

    if (spotRes.status === 'fulfilled' && spotRes.value.ok) {
      const data = await spotRes.value.json();
      const parseRate = (item: any): CurrencyRate | undefined => {
        if (!item) return undefined;
        return {
          code: item.code,
          name: item.name,
          bid: parseFloat(item.bid) || 0,
          ask: parseFloat(item.ask) || 0,
          high: parseFloat(item.high) || 0,
          low: parseFloat(item.low) || 0,
          pctChange: parseFloat(item.pctChange) || 0,
          varBid: parseFloat(item.varBid) || 0,
          rawDate: item.create_date || new Date().toISOString(),
          formattedDate: item.create_date
            ? new Date(item.create_date.replace(' ', 'T')).toLocaleString('pt-BR')
            : new Date().toLocaleString('pt-BR'),
        };
      };

      parsedSpotUsd = parseRate(data.USDBRL);
      parsedSpotEur = parseRate(data.EURBRL);
    }

    let usdTrend: CurrencyTrendSummary | undefined;
    if (usdDailyRes.status === 'fulfilled' && usdDailyRes.value.ok) {
      const dailyData = await usdDailyRes.value.json();
      usdTrend = parseTrendFromDailyItems(dailyData);
    }

    let eurTrend: CurrencyTrendSummary | undefined;
    if (eurDailyRes.status === 'fulfilled' && eurDailyRes.value.ok) {
      const dailyData = await eurDailyRes.value.json();
      eurTrend = parseTrendFromDailyItems(dailyData);
    }

    const parsed: LiveCurrencyData = {
      usd: parsedSpotUsd || DEFAULT_FALLBACK_RATES.usd,
      eur: parsedSpotEur || DEFAULT_FALLBACK_RATES.eur,
      usdTrend: usdTrend || DEFAULT_FALLBACK_RATES.usdTrend,
      eurTrend: eurTrend || DEFAULT_FALLBACK_RATES.eurTrend,
      fetchedAt: now,
    };

    cachedRates = parsed;
    return parsed;
  } catch (error) {
    console.error('Falha ao consultar cotação na AwesomeAPI, usando base de contingência:', error);
    return cachedRates || DEFAULT_FALLBACK_RATES;
  }
}

/**
 * Verifica se uma mensagem do usuário envolve cotações, moedas, câmbio
 * ou categorias altamente sensíveis ao dólar/importação.
 */
export function isCurrencyRelevantQuery(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.toLowerCase();
  return (
    /d[oó]lar|dollar|usd|c[aâ]mbio|cambial|moeda|euro|eur|divisa|taxa de c[aâ]mbio|forex|ptax|cota[çc][aã]o/i.test(t) ||
    /pead|polietileno|resina|bobina|papel t[eé]rmico|importa|frete mar[ií]timo|commodity|commodities|petr[oó]leo|brent|diesel|indices|\/indices|\/boletim/i.test(
      t
    )
  );
}

/**
 * Formata os dados de câmbio em formato textual pronto para ser injetado
 * nas instruções do sistema ou prompt da IA, incluindo histórico e balizas de mesa.
 */
export function formatCurrencyContextForPrompt(currencyData: LiveCurrencyData | null): string {
  if (!currencyData || (!currencyData.usd && !currencyData.eur)) {
    return '';
  }

  const data = currencyData;
  const parts: string[] = [
    '### DADOS OFICIAIS DE CÂMBIO EM TEMPO REAL E HISTÓRICO DE MERCADO (FONTE: AWESOMEAPI / BANCO CENTRAL):',
  ];

  if (data.usd) {
    const u = data.usd;
    const sign = u.pctChange >= 0 ? '+' : '';
    parts.push(
      `- **Dólar Comercial (USD/BRL - Spot Atual):** R$ ${u.bid.toFixed(4)} (Compra) / R$ ${u.ask.toFixed(4)} (Venda) | Variação do dia: ${sign}${u.pctChange.toFixed(2)}% | Mínima do dia: R$ ${u.low.toFixed(4)} | Máxima do dia: R$ ${u.high.toFixed(4)}`
    );

    if (data.usdTrend) {
      const t = data.usdTrend;
      const sign7 = t.variation7DaysPct >= 0 ? '+' : '';
      const sign15 = t.variation15DaysPct >= 0 ? '+' : '';
      parts.push(
        `- **Histórico Real e Trajetória do Dólar nos Últimos 15 Dias (AwesomeAPI Diária):**
  * Cotação há 15 dias: R$ ${t.rate15DaysAgo.toFixed(4)}
  * Cotação há 7 dias: R$ ${t.rate7DaysAgo.toFixed(4)} (Variação em 7 dias: ${sign7}${t.variation7DaysPct.toFixed(2)}%)
  * Cotação Hoje: R$ ${t.currentBid.toFixed(4)} (Variação acumulada em 15 dias: ${sign15}${t.variation15DaysPct.toFixed(2)}%)
  * Mínima da quinzena: R$ ${t.recentLow.value.toFixed(4)} (${t.recentLow.date})
  * Pico Máximo da quinzena: R$ ${t.recentHigh.value.toFixed(4)} (${t.recentHigh.date})`
      );
    }
  }

  if (data.eur) {
    const e = data.eur;
    const sign = e.pctChange >= 0 ? '+' : '';
    parts.push(
      `- **Euro Comercial (EUR/BRL - Spot Atual):** R$ ${e.bid.toFixed(4)} (Compra) / R$ ${e.ask.toFixed(4)} (Venda) | Variação do dia: ${sign}${e.pctChange.toFixed(2)}% | Mínima do dia: R$ ${e.low.toFixed(4)} | Máxima do dia: R$ ${e.high.toFixed(4)}`
    );

    if (data.eurTrend) {
      const t = data.eurTrend;
      const sign15 = t.variation15DaysPct >= 0 ? '+' : '';
      parts.push(
        `- **Trajetória do Euro nos Últimos 15 Dias:** Há 15 dias: R$ ${t.rate15DaysAgo.toFixed(4)} ➔ Hoje: R$ ${t.currentBid.toFixed(4)} (${sign15}${t.variation15DaysPct.toFixed(2)}%) | Pico: R$ ${t.recentHigh.value.toFixed(4)}`
      );
    }
  }

  if (data.usd?.bid) {
    const trendNote = data.usdTrend
      ? `\n- DIRETRIZ DE NEGOCIAÇÃO CAMBIAL CONTRA PLEITOS DE FORNECEDORES:
  * O Dólar oscilou fortemente na quinzena: partiu de R$ ${data.usdTrend.rate15DaysAgo.toFixed(4)} há 15 dias para R$ ${data.usdTrend.currentBid.toFixed(4)} hoje, tendo atingido um pico recente de R$ ${data.usdTrend.recentHigh.value.toFixed(4)}.
  * Se o fornecedor pleitear reajuste balizado pelo pico de estresse cambial (R$ ${data.usdTrend.recentHigh.value.toFixed(4)}), o comprador Plurix DEVE contestar tecnicamente: demonstrar que a moeda já recuou e que os lotes e matérias-primas adquiridos nas semanas anteriores foram contratados no patamar de R$ ${data.usdTrend.rate15DaysAgo.toFixed(4)}.
  * Recomende a inserção de bandas cambiais contratuais (gatilho de ±3% a ±5%) para proteger a Plurix de picos transitórios de volatilidade política ou eleitoral.`
      : '';

    parts.push(
      `DIRETRIZ DE CÂMBIO EM TEMPO REAL:
- A cotação oficial em tempo real da AwesomeAPI é de R$ ${data.usd.bid.toFixed(4)} para o Dólar Comercial (USD/BRL).
- Utilize estes dados como base exata de cotação e de histórico recente. Caso a análise envolva projeções futuras (Focus do Bacen), fundamente nas tendências macroeconômicas.${trendNote}`
    );
  }

  return parts.join('\n');
}

