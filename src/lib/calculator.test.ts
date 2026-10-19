import { describe, it, expect } from 'vitest';
import { validateWeights, calculateShouldCost, CostComponent } from './calculator';

describe('Motor de Cálculo Econômico — Economista de Compras', () => {
  it('deve validar corretamente uma estrutura com soma de pesos = 100%', () => {
    const components: CostComponent[] = [
      { name: 'Resina PEAD', weight: 60, driverName: 'Preço PE em R$', driverVariation: 5.0 },
      { name: 'Energia', weight: 7, driverName: 'Tarifa ANEEL', driverVariation: 4.0 },
      { name: 'Mão de obra', weight: 9, driverName: 'INPC / dissídio', driverVariation: 5.5 },
      { name: 'Aditivos', weight: 5, driverName: 'IPA químicos', driverVariation: 2.0 },
      { name: 'Frete', weight: 5, driverName: 'Diesel ANP', driverVariation: 3.0 },
      { name: 'Overhead/Margem', weight: 14, driverName: 'Fixo', driverVariation: 0.0 },
    ];

    const validation = validateWeights(components);
    expect(validation.isValid).toBe(true);
    expect(validation.sumOfWeights).toBe(100);
    expect(validation.errors).toHaveLength(0);
  });

  it('deve rejeitar estruturas onde a soma dos pesos não totaliza 100%', () => {
    const components: CostComponent[] = [
      { name: 'Mão de obra', weight: 60, driverName: 'Dissídio', driverVariation: 6.0 },
      { name: 'Materiais', weight: 20, driverName: 'IPCA', driverVariation: 4.0 },
    ]; // Soma = 80%

    const validation = validateWeights(components);
    expect(validation.isValid).toBe(false);
    expect(validation.sumOfWeights).toBe(80);
    expect(validation.errors[0]).toContain('A soma dos pesos deve totalizar 100%');
  });

  it('deve rejeitar pesos negativos ou acima de 100%', () => {
    const components: CostComponent[] = [
      { name: 'Item A', weight: -10, driverName: 'Driver A', driverVariation: 2.0 },
      { name: 'Item B', weight: 110, driverName: 'Driver B', driverVariation: 3.0 },
    ];

    const validation = validateWeights(components);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('não pode ser negativo'))).toBe(true);
    expect(validation.errors.some((e) => e.includes('não pode exceder 100%'))).toBe(true);
  });

  it('deve reproduzir com exatidão o exemplo canônico de sacolinhas plásticas da seção 10 do documento', () => {
    // Exemplo canônico do documento:
    // Resina: 60% * +5% = +3.00 p.p.
    // Energia: 7% * +4% = +0.28 p.p.
    // Mão de obra: 9% * +5.5% = +0.495 p.p. (~0.50 p.p.)
    // Aditivos: 5% * +2% = +0.10 p.p.
    // Frete: 5% * +3% = +0.15 p.p.
    // Margem: 14% * 0% = 0.00 p.p.
    // Total ponderado esperado = ~4.025% (~4.0%)
    // Pedido do fornecedor: 8.0%
    // Diferença em p.p.: ~4.0 p.p.
    const components: CostComponent[] = [
      { name: 'Resina PEAD', weight: 60, driverName: 'Preço PE em R$', driverVariation: 5.0 },
      { name: 'Energia', weight: 7, driverName: 'Tarifa ANEEL', driverVariation: 4.0 },
      { name: 'Mão de obra', weight: 9, driverName: 'INPC / dissídio', driverVariation: 5.5 },
      { name: 'Aditivos e pigmentos', weight: 5, driverName: 'IPA químicos', driverVariation: 2.0 },
      { name: 'Frete', weight: 5, driverName: 'Diesel ANP', driverVariation: 3.0 },
      { name: 'Overhead e margem', weight: 14, driverName: 'Fixo', driverVariation: 0.0 },
    ];

    const result = calculateShouldCost(components, 8.0);

    expect(result.isValid).toBe(true);
    // Variação teórica agregada esperada: 3.0 + 0.28 + 0.495 + 0.10 + 0.15 = 4.025 -> arredondado 4.03%
    expect(result.aggregatedTheoreticalVariation).toBe(4.03);
    // Diferença em pontos percentuais: 8.0 - 4.03 = 3.97 p.p.
    expect(result.differencePercentagePoints).toBe(3.97);
    expect(result.summaryText).toContain('supera o reajuste teórico ponderado em 3.97 pontos percentuais');
  });

  it('deve calcular adequadamente quando os drivers apresentam variações negativas (deflação/alívio)', () => {
    const components: CostComponent[] = [
      { name: 'Commodity', weight: 70, driverName: 'Cotação Internacional', driverVariation: -8.0 },
      { name: 'Câmbio', weight: 15, driverName: 'PTAX', driverVariation: -2.0 },
      { name: 'Custos Locais', weight: 15, driverName: 'IPCA', driverVariation: 4.0 },
    ];

    const result = calculateShouldCost(components, 0.0);
    // 70 * -8% = -5.6 p.p.
    // 15 * -2% = -0.3 p.p.
    // 15 * 4% = +0.6 p.p.
    // Total = -5.6 - 0.3 + 0.6 = -5.3%
    expect(result.isValid).toBe(true);
    expect(result.aggregatedTheoreticalVariation).toBe(-5.3);
    expect(result.differencePercentagePoints).toBe(5.3);
  });
});
