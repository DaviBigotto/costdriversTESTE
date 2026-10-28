import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLiveCurrencyRates,
  isCurrencyRelevantQuery,
  formatCurrencyContextForPrompt,
  LiveCurrencyData,
} from './currency';

describe('currency module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects currency relevance correctly', () => {
    expect(isCurrencyRelevantQuery('Qual a cotação do dólar hoje?')).toBe(true);
    expect(isCurrencyRelevantQuery('Como o câmbio afeta as sacolas PEAD?')).toBe(true);
    expect(isCurrencyRelevantQuery('/indices')).toBe(true);
    expect(isCurrencyRelevantQuery('Bobinas térmicas de PDV')).toBe(true);
    expect(isCurrencyRelevantQuery('Qual a composição de limpeza terceirizada?')).toBe(false);
  });

  it('formats currency context for prompt correctly', () => {
    const mockData: LiveCurrencyData = {
      usd: {
        code: 'USD',
        name: 'Dólar Americano/Real Brasileiro',
        bid: 5.0461,
        ask: 5.0476,
        high: 5.0645,
        low: 5.0427,
        pctChange: -0.36,
        varBid: -0.0184,
        rawDate: '2026-10-19 09:14:54',
        formattedDate: '19/10/2026 09:14:54',
      },
      fetchedAt: Date.now(),
    };

    const formatted = formatCurrencyContextForPrompt(mockData);
    expect(formatted).toContain('Dólar Comercial (USD/BRL');
    expect(formatted).toContain('R$ 5.0461 (Compra) / R$ 5.0476 (Venda)');
    expect(formatted).toContain('Variação do dia: -0.36%');
    expect(formatted).toContain('AwesomeAPI');
  });

  it('formats currency trend and negotiation directive when trend data is available', () => {
    const mockData: LiveCurrencyData = {
      usd: {
        code: 'USD',
        name: 'Dólar Americano/Real Brasileiro',
        bid: 5.3514,
        ask: 5.3519,
        high: 5.4191,
        low: 5.3077,
        pctChange: -0.37,
        varBid: -0.0198,
        rawDate: '2026-10-28 09:00:00',
        formattedDate: '28/10/2026 09:00:00',
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
      fetchedAt: Date.now(),
    };

    const formatted = formatCurrencyContextForPrompt(mockData);
    expect(formatted).toContain('Histórico Real e Trajetória do Dólar nos Últimos 15 Dias');
    expect(formatted).toContain('Cotação há 15 dias: R$ 4.9918');
    expect(formatted).toContain('Pico Máximo da quinzena: R$ 5.6040');
    expect(formatted).toContain('DIRETRIZ DE NEGOCIAÇÃO CAMBIAL CONTRA PLEITOS DE FORNECEDORES');
  });

  it('handles null currency data gracefully', () => {
    expect(formatCurrencyContextForPrompt(null)).toBe('');
  });
});
