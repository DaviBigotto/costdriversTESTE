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
    expect(formatted).toContain('**Dólar Comercial (USD/BRL):** R$ 5.0461 (Compra) / R$ 5.0476 (Venda)');
    expect(formatted).toContain('Variação do dia: -0.36%');
    expect(formatted).toContain('AwesomeAPI');
  });

  it('handles null currency data gracefully', () => {
    expect(formatCurrencyContextForPrompt(null)).toBe('');
  });
});
