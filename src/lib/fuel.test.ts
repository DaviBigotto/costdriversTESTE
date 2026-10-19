import { describe, it, expect } from 'vitest';
import {
  getFuelPriceReport,
  isFuelRelevantQuery,
  formatFuelContextForPrompt,
} from './fuel';

describe('fuel module', () => {
  it('detects fuel and freight relevant queries', () => {
    expect(isFuelRelevantQuery('Qual o preço do diesel S10 na ANP?')).toBe(true);
    expect(isFuelRelevantQuery('A transportadora pediu reajuste de frete rodoviário')).toBe(true);
    expect(isFuelRelevantQuery('Como a logística de distribuição é impactada?')).toBe(true);
    expect(isFuelRelevantQuery('Qual a regra do gatilho da ANTT?')).toBe(true);
    expect(isFuelRelevantQuery('Qual a taxa Selic hoje?')).toBe(false);
  });

  it('formats fuel context for prompt correctly', async () => {
    const report = await getFuelPriceReport();
    const formatted = formatFuelContextForPrompt(report);
    expect(formatted).toContain('Diesel S10 (Média Brasil):');
    expect(formatted).toContain('R$ 6.04/litro');
    expect(formatted).toContain('SP: R$ 5.94/L');
    expect(formatted).toContain('ANTT');
    expect(formatted).toContain('ANP');
  });
});
