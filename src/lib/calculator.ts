/**
 * Motor de Cálculo Econômico Determinístico para o Economista de Compras.
 * Responsável por executar contas matemáticas exatas, validações de pesos,
 * contribuição por componente e comparação de should-cost com reajustes solicitados.
 */

export interface CostComponent {
  name: string;
  weight: number; // Percentual de 0 a 100
  driverName: string;
  driverVariation: number; // Variação percentual do driver (ex: 5.0 para +5%)
}

export interface ComponentContribution extends CostComponent {
  contributionPp: number; // Contribuição em pontos percentuais: (weight * driverVariation) / 100
}

export interface ValidationResult {
  isValid: boolean;
  sumOfWeights: number;
  errors: string[];
  warnings: string[];
}

export interface CalculationResult {
  isValid: boolean;
  validation: ValidationResult;
  components: ComponentContribution[];
  aggregatedTheoreticalVariation: number; // Variação estimada do custo (% teórica)
  requestedAdjustment?: number; // Percentual pedido pelo fornecedor (%)
  differencePercentagePoints?: number; // Diferença em pontos percentuais (p.p.)
  relativeDifferencePercentage?: number; // Diferença relativa entre pedido e teórico (%)
  summaryText: string;
}

/**
 * Valida a integridade dos pesos informados.
 * Os pesos devem ser numéricos, não-negativos e a soma deve ser 100% (com tolerância de 0.5% para arredondamentos).
 */
export function validateWeights(components: CostComponent[], tolerance = 0.5): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!components || components.length === 0) {
    return {
      isValid: false,
      sumOfWeights: 0,
      errors: ['Nenhum componente de custo foi fornecido.'],
      warnings: [],
    };
  }

  let sum = 0;

  components.forEach((comp, index) => {
    if (!comp.name || comp.name.trim() === '') {
      errors.push(`Componente #${index + 1} sem nome.`);
    }

    if (typeof comp.weight !== 'number' || isNaN(comp.weight)) {
      errors.push(`Peso inválido para o componente "${comp.name || index + 1}".`);
      return;
    }

    if (comp.weight < 0) {
      errors.push(`O peso do componente "${comp.name}" não pode ser negativo (${comp.weight}%).`);
    }

    if (comp.weight > 100) {
      errors.push(`O peso do componente "${comp.name}" não pode exceder 100% (${comp.weight}%).`);
    }

    if (typeof comp.driverVariation !== 'number' || isNaN(comp.driverVariation)) {
      errors.push(`Variação do driver inválida para "${comp.name}".`);
    }

    sum += comp.weight;
  });

  const roundedSum = Math.round(sum * 100) / 100;
  const diffFrom100 = Math.abs(roundedSum - 100);

  if (diffFrom100 > tolerance) {
    errors.push(
      `A soma dos pesos deve totalizar 100%. A soma atual é ${roundedSum.toFixed(2)}% (diferença de ${diffFrom100.toFixed(2)} p.p.).`
    );
  } else if (diffFrom100 > 0.001) {
    warnings.push(
      `A soma dos pesos é ${roundedSum.toFixed(2)}%, ligeiramente diferente de 100% devido a arredondamento.`
    );
  }

  return {
    isValid: errors.length === 0,
    sumOfWeights: roundedSum,
    errors,
    warnings,
  };
}

/**
 * Executa o cálculo determinístico do Should-Cost:
 * Fórmula de referência:
 * ΔP_item = Σ (peso_i × variação_do_driver_i)
 */
export function calculateShouldCost(
  components: CostComponent[],
  requestedAdjustment?: number
): CalculationResult {
  const validation = validateWeights(components);

  if (!validation.isValid) {
    return {
      isValid: false,
      validation,
      components: components.map((c) => ({
        ...c,
        contributionPp: ((c.weight || 0) * (c.driverVariation || 0)) / 100,
      })),
      aggregatedTheoreticalVariation: 0,
      summaryText: `Falha na validação dos componentes: ${validation.errors.join(' ')}`,
    };
  }

  let aggregatedPp = 0;
  const calculatedComponents: ComponentContribution[] = components.map((comp) => {
    // Contribuição = peso (%) * variação do driver (%) / 100
    // Exemplo: 60% peso * 5% variação = 3.00 p.p.
    const contributionPp = (comp.weight * comp.driverVariation) / 100;
    aggregatedPp += contributionPp;
    return {
      ...comp,
      contributionPp: Math.round(contributionPp * 1000) / 1000,
    };
  });

  const aggregatedTheoretical = Math.round(aggregatedPp * 100) / 100;

  let diffPp: number | undefined;
  let relativeDiff: number | undefined;
  let summary = `Variação teórica agregada do custo: ${aggregatedTheoretical > 0 ? '+' : ''}${aggregatedTheoretical.toFixed(2)}%.`;

  if (typeof requestedAdjustment === 'number' && !isNaN(requestedAdjustment)) {
    // Diferença em pontos percentuais: Reajuste Pedido - Variação Teórica
    diffPp = Math.round((requestedAdjustment - aggregatedTheoretical) * 100) / 100;

    // Diferença relativa (se a variação teórica for diferente de 0)
    if (aggregatedTheoretical !== 0) {
      relativeDiff = Math.round(((requestedAdjustment - aggregatedTheoretical) / Math.abs(aggregatedTheoretical)) * 10000) / 100;
    }

    if (diffPp > 0) {
      summary += ` O reajuste solicitado de ${requestedAdjustment.toFixed(2)}% supera o reajuste teórico ponderado em ${diffPp.toFixed(2)} pontos percentuais (p.p.).`;
    } else if (diffPp < 0) {
      summary += ` O reajuste solicitado de ${requestedAdjustment.toFixed(2)}% está abaixo do reajuste teórico ponderado em ${Math.abs(diffPp).toFixed(2)} pontos percentuais (p.p.).`;
    } else {
      summary += ` O reajuste solicitado de ${requestedAdjustment.toFixed(2)}% coincide exatamente com a variação ponderada dos cost drivers.`;
    }
  }

  return {
    isValid: true,
    validation,
    components: calculatedComponents,
    aggregatedTheoreticalVariation: aggregatedTheoretical,
    requestedAdjustment,
    differencePercentagePoints: diffPp,
    relativeDifferencePercentage: relativeDiff,
    summaryText: summary,
  };
}
