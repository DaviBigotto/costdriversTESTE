import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isIndicatorsRelevantQuery,
  formatIndicatorsContextForPrompt,
  MacroeconomicPanel,
} from './indicators';

describe('indicators module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects relevant queries for economic indicators', () => {
    expect(isIndicatorsRelevantQuery('Qual o IPCA acumulado em 12 meses?')).toBe(true);
    expect(isIndicatorsRelevantQuery('Como o INPC afeta o dissídio da limpeza?')).toBe(true);
    expect(isIndicatorsRelevantQuery('/indices')).toBe(true);
    expect(isIndicatorsRelevantQuery('Qual a taxa Selic atual?')).toBe(true);
    expect(isIndicatorsRelevantQuery('Qual o reajuste anual de contrato?')).toBe(true);
    expect(isIndicatorsRelevantQuery('Como embalar caixas de papelão?')).toBe(false);
  });

  it('formats macroeconomic panel into structured prompt markdown', () => {
    const mockPanel: MacroeconomicPanel = {
      ipca: {
        name: 'IPCA',
        code: 'IPCA',
        monthlyVariation: 0.82,
        accumulated12m: 4.58,
        referencePeriod: '09/2026',
        source: 'IBGE',
        sourceUrl: 'https://ibge.gov.br',
      },
      inpc: {
        name: 'INPC',
        code: 'INPC',
        monthlyVariation: 0.82,
        accumulated12m: 4.29,
        referencePeriod: '09/2026',
        source: 'IBGE',
        sourceUrl: 'https://ibge.gov.br',
      },
      selic: {
        name: 'Selic',
        code: 'SELIC',
        annualRate: 13.75,
        referencePeriod: '10/2026',
        source: 'Banco Central do Brasil',
        sourceUrl: 'https://bcb.gov.br',
      },
      fetchedAt: Date.now(),
    };

    const formatted = formatIndicatorsContextForPrompt(mockPanel);
    expect(formatted).toContain('IPCA (IBGE):');
    expect(formatted).toContain('4.58% acumulado em 12 meses');
    expect(formatted).toContain('INPC (IBGE - Balizador de Dissídios e CCTs):');
    expect(formatted).toContain('4.29% acumulado em 12 meses');
    expect(formatted).toContain('13.75% a.a.');
    expect(formatted).toContain('BANCO CENTRAL DO BRASIL');
  });

  it('handles empty panel gracefully', () => {
    const emptyPanel: MacroeconomicPanel = { fetchedAt: Date.now() };
    expect(formatIndicatorsContextForPrompt(emptyPanel)).toBe('');
  });
});
