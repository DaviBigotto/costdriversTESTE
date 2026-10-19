/**
 * Módulo de Câmbio e Moedas em Tempo Real via AwesomeAPI.
 * Fornece cotações oficiais e atualizadas do Dólar (USD/BRL) e Euro (EUR/BRL)
 * para embasamento de cost drivers e negociações de Compras Indiretas.
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

export interface LiveCurrencyData {
  usd?: CurrencyRate;
  eur?: CurrencyRate;
  fetchedAt: number;
}

// Cache em memória com TTL de 60 segundos
let cachedRates: LiveCurrencyData | null = null;
const CACHE_TTL_MS = 60 * 1000;

/**
 * Busca as cotações em tempo real de USD/BRL e EUR/BRL na AwesomeAPI.
 * Retorna dados em cache se a requisição anterior tiver menos de 60 segundos.
 */
export async function getLiveCurrencyRates(): Promise<LiveCurrencyData | null> {
  const now = Date.now();
  if (cachedRates && now - cachedRates.fetchedAt < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`AwesomeAPI retornou status HTTP ${res.status}`);
      return cachedRates; // Retorna cache anterior se houver
    }

    const data = await res.json();

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

    const parsed: LiveCurrencyData = {
      usd: parseRate(data.USDBRL),
      eur: parseRate(data.EURBRL),
      fetchedAt: now,
    };

    cachedRates = parsed;
    return parsed;
  } catch (error) {
    console.error('Falha ao consultar cotação na AwesomeAPI:', error);
    return cachedRates; // Se falhar mas tiver cache, retorna cache
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
    /d[oó]lar|usd|c[aâ]mbio|moeda|euro|eur|divisa|taxa de c[aâ]mbio|forex/i.test(t) ||
    /pead|polietileno|resina|bobina|papel t[eé]rmico|importa|frete mar[ií]timo|commodity|commodities|petr[oó]leo|brent|diesel|indices|\/indices|\/boletim/i.test(
      t
    )
  );
}

/**
 * Formata os dados de câmbio em formato textual pronto para ser injetado
 * nas instruções do sistema ou prompt da IA.
 */
export function formatCurrencyContextForPrompt(currencyData: LiveCurrencyData | null): string {
  if (!currencyData || (!currencyData.usd && !currencyData.eur)) {
    return '';
  }

  const parts: string[] = [
    '### DADOS OFICIAIS DE CÂMBIO EM TEMPO REAL (FONTE: AWESOMEAPI / MERCADO FINANCEIRO):',
  ];

  if (currencyData.usd) {
    const u = currencyData.usd;
    const sign = u.pctChange >= 0 ? '+' : '';
    parts.push(
      `- **Dólar Comercial (USD/BRL):** R$ ${u.bid.toFixed(4)} (Compra) / R$ ${u.ask.toFixed(4)} (Venda) | Variação do dia: ${sign}${u.pctChange.toFixed(2)}% | Mínima: R$ ${u.low.toFixed(4)} | Máxima: R$ ${u.high.toFixed(4)} | Atualizado em: ${u.rawDate}`
    );
  }

  if (currencyData.eur) {
    const e = currencyData.eur;
    const sign = e.pctChange >= 0 ? '+' : '';
    parts.push(
      `- **Euro Comercial (EUR/BRL):** R$ ${e.bid.toFixed(4)} (Compra) / R$ ${e.ask.toFixed(4)} (Venda) | Variação do dia: ${sign}${e.pctChange.toFixed(2)}% | Mínima: R$ ${e.low.toFixed(4)} | Máxima: R$ ${e.high.toFixed(4)} | Atualizado em: ${e.rawDate}`
    );
  }

  parts.push(
    'REGRA OBRIGATÓRIA: Utilize EXATAMENTE estes valores reais de cotação para qualquer análise que envolva o Dólar, câmbio, importações ou drivers internacionais. Cite a cotação oficial e mencione a AwesomeAPI / Mercado Financeiro como fonte com a data/hora indicada.'
  );

  return parts.join('\n');
}
