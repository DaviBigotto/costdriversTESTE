'use client';

import React, { useState } from 'react';
import { COST_BREAKDOWN_LIBRARY } from '@/lib/knowledge';
import { calculateShouldCost, CostComponent, CalculationResult } from '@/lib/calculator';
import { PlurixLogo } from '@/components/PlurixLogo';
import {
  Plus,
  Trash2,
  Calculator,
  ArrowRight,
  X,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Layers,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoChat: (formattedText: string) => void;
}

const PALETTE = [
  '#00147D', // Navy Plurix
  '#0284C7', // Sky Blue
  '#0D9488', // Teal
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#64748B', // Slate
  '#E11D48', // Rose
  '#2563EB', // Royal Blue
];

export function CalculatorModal({ isOpen, onClose, onInsertIntoChat }: CalculatorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Sacolas plásticas (PEAD/PEBD)');
  const [components, setComponents] = useState<CostComponent[]>([
    { name: 'Resina PEAD/PEBD', weight: 60, driverName: 'Preço PE Braskem/ICIS em R$', driverVariation: 4.8 },
    { name: 'Energia elétrica', weight: 7, driverName: 'Tarifa ANEEL / PLD', driverVariation: 3.5 },
    { name: 'Mão de obra', weight: 9, driverName: 'INPC / Dissídio plásticos', driverVariation: 4.3 },
    { name: 'Aditivos e pigmentos', weight: 5, driverName: 'IPA químicos (FGV)', driverVariation: 2.1 },
    { name: 'Frete e distribuição', weight: 5, driverName: 'Diesel ANP', driverVariation: -0.3 },
    { name: 'Overhead e margem', weight: 14, driverName: 'Fixo / Custo operacional', driverVariation: 0.0 },
  ]);
  const [requestedAdjustment, setRequestedAdjustment] = useState<number>(8.0);

  if (!isOpen) return null;

  const handleSelectPreset = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const found = COST_BREAKDOWN_LIBRARY.find((c) => c.category === categoryName);
    if (found) {
      setComponents(
        found.components.map((c) => ({
          name: c.name,
          weight: c.defaultWeight,
          driverName: c.driver,
          driverVariation: 0.0,
        }))
      );
    }
  };

  const handleResetToCurrentPreset = () => {
    handleSelectPreset(selectedCategory);
  };

  const handleUpdateComponent = (index: number, field: keyof CostComponent, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { name: 'Novo Componente', weight: 0, driverName: 'Índice de Mercado', driverVariation: 0 },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const result: CalculationResult = calculateShouldCost(components, requestedAdjustment);
  const sumWeights = components.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
  const isSumValid = Math.abs(sumWeights - 100) <= 0.5;

  const gap = result.differencePercentagePoints ?? 0;
  const isOverpriced = gap > 0.05;

  const handleExportToChat = () => {
    const formatted = `### Análise Determinística de Should-Cost — ${selectedCategory}
**Data de emissão:** ${new Date().toLocaleDateString('pt-BR')} | **Metodologia:** Engenharia de Custos Plurix

- **Reajuste Solicitado pelo Fornecedor:** ${requestedAdjustment >= 0 ? '+' : ''}${requestedAdjustment.toFixed(2)}%
- **Variação Justificada por Drivers (Should-Cost):** ${result.aggregatedTheoreticalVariation >= 0 ? '+' : ''}${result.aggregatedTheoreticalVariation.toFixed(2)}%
- **Diferença (GAP de Negociação):** ${gap >= 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)} p.p. ${isOverpriced ? '⚠️ (Pleito acima do justificado pelos índices)' : '✅ (Alinhado à estrutura de custos)'}

| Componente de Custo | Peso (%) | Driver Associado | Var. Driver (%) | Impacto Ponderado |
| :--- | :---: | :--- | :---: | :---: |
${result.components
  .map(
    (c) =>
      `| **${c.name}** | ${c.weight}% | ${c.driverName} | ${c.driverVariation >= 0 ? '+' : ''}${c.driverVariation.toFixed(2)}% | ${c.contributionPp >= 0 ? '+' : ''}${c.contributionPp.toFixed(2)} p.p. |`
  )
  .join('\n')}

> **Parecer do Economista de Compras:** ${result.summaryText}
`;
    onInsertIntoChat(formatted);
    onClose();
  };

  return (
    <div className="calc-overlay" onClick={onClose}>
      <div className="calc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Corporativo Plurix */}
        <div className="calc-modal-header">
          <div className="calc-modal-brand">
            <PlurixLogo height={22} />
            <div className="calc-modal-divider" />
            <div>
              <div className="calc-modal-title">Simulador de Should-Cost & Decomposição de Custos</div>
              <div className="calc-modal-subtitle">
                Modelagem paramétrica de custos por drivers de mercado para negociação
              </div>
            </div>
          </div>

          <div className="calc-modal-header-actions">
            <div className="calc-method-pill">
              <ShieldCheck size={12} color="var(--pos-d)" />
              <span>Metodologia Compras Indiretas</span>
            </div>

            <button
              type="button"
              className="calc-icon-btn"
              onClick={handleResetToCurrentPreset}
              title="Restaurar valores padrão da categoria selecionada"
            >
              <RotateCcw size={13} />
            </button>

            <button
              type="button"
              className="calc-close-btn"
              onClick={onClose}
              title="Fechar (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="calc-modal-body">
          {/* Barra de Controles Superiores */}
          <div className="calc-controls-card">
            <div className="calc-control-group main">
              <label className="calc-control-label">Categoria de Compras Indiretas</label>
              <select
                className="calc-select"
                value={selectedCategory}
                onChange={(e) => handleSelectPreset(e.target.value)}
              >
                {COST_BREAKDOWN_LIBRARY.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="calc-control-group side">
              <label className="calc-control-label">Reajuste Pleiteado (%)</label>
              <div className="calc-input-wrapper">
                <input
                  type="number"
                  step="0.1"
                  className="calc-input-number"
                  value={requestedAdjustment}
                  onChange={(e) => setRequestedAdjustment(parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
                <span className="calc-input-suffix">%</span>
              </div>
            </div>

            <div className="calc-control-group side">
              <label className="calc-control-label">Ponderação Total</label>
              <div className={`calc-weight-status ${isSumValid ? 'valid' : 'invalid'}`}>
                {isSumValid ? (
                  <>
                    <CheckCircle size={13} color="var(--pos-d)" />
                    <span>{sumWeights.toFixed(1)}% (100% OK)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={13} color="var(--neg)" />
                    <span>{sumWeights.toFixed(1)}% (Ajustar para 100%)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* KPI Dashboard Executivo */}
          <div className="calc-kpis-grid">
            {/* KPI 1 */}
            <div className="calc-kpi-card">
              <div className="calc-kpi-head">
                <span className="calc-kpi-tag">PLEITO DO FORNECEDOR</span>
                <Percent size={13} className="calc-kpi-icon" />
              </div>
              <div className="calc-kpi-val requested">
                {requestedAdjustment >= 0 ? '+' : ''}
                {requestedAdjustment.toFixed(2)}%
              </div>
              <div className="calc-kpi-sub">Percentual solicitado de aumento</div>
            </div>

            {/* KPI 2 */}
            <div className="calc-kpi-card">
              <div className="calc-kpi-head">
                <span className="calc-kpi-tag highlight">SHOULD-COST JUSTIFICADO</span>
                <Calculator size={13} className="calc-kpi-icon" />
              </div>
              <div className="calc-kpi-val theoretical">
                {result.aggregatedTheoreticalVariation >= 0 ? '+' : ''}
                {result.aggregatedTheoreticalVariation.toFixed(2)}%
              </div>
              <div className="calc-kpi-sub">Variação ponderada pelos drivers</div>
            </div>

            {/* KPI 3 */}
            <div className={`calc-kpi-card ${isOverpriced ? 'kpi-warning' : 'kpi-positive'}`}>
              <div className="calc-kpi-head">
                <span className="calc-kpi-tag">
                  {isOverpriced ? 'GAP / SOBREPREÇO' : 'ALINHAMENTO TÉCNICO'}
                </span>
                {isOverpriced ? (
                  <TrendingUp size={13} color="var(--neg)" />
                ) : (
                  <TrendingDown size={13} color="var(--pos-d)" />
                )}
              </div>
              <div className={`calc-kpi-val ${isOverpriced ? 'gap-neg' : 'gap-pos'}`}>
                {gap >= 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)} p.p.
              </div>
              <div className="calc-kpi-sub">
                {isOverpriced
                  ? 'Margem de negociação a favor do comprador'
                  : 'Pleito aderente à estrutura de mercado'}
              </div>
            </div>
          </div>

          {/* Barra de Distribuição de Custos (Cost Breakdown Bar) */}
          <div className="calc-breakdown-card">
            <div className="calc-breakdown-title-row">
              <span className="calc-breakdown-title">Estrutura de Custos da Categoria</span>
              <span className="calc-breakdown-counter">{components.length} componentes ponderados</span>
            </div>
            <div className="calc-stacked-bar">
              {components.map((c, i) => {
                const w = Math.max(0, Number(c.weight) || 0);
                if (w === 0) return null;
                const color = PALETTE[i % PALETTE.length];
                return (
                  <div
                    key={i}
                    className="calc-bar-segment"
                    style={{ width: `${w}%`, backgroundColor: color }}
                    title={`${c.name}: ${w}%`}
                  >
                    {w >= 10 && <span className="calc-segment-label">{c.name.split(' ')[0]} ({w}%)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela Interativa de Componentes */}
          <div className="calc-table-card">
            <div className="calc-table-header-row">
              <div className="calc-table-heading">Matriz de Drivers e Ponderação de Insumos</div>
              <button
                type="button"
                onClick={handleAddComponent}
                className="calc-add-btn"
              >
                <Plus size={13} /> Adicionar Insumo
              </button>
            </div>

            <div className="calc-table-wrapper">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Componente de Custo</th>
                    <th style={{ width: '13%' }}>Peso (%)</th>
                    <th style={{ width: '30%' }}>Driver / Indicador Oficial</th>
                    <th style={{ width: '14%' }}>Var. Driver (%)</th>
                    <th style={{ width: '15%' }}>Impacto (p.p.)</th>
                    <th style={{ width: '4%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c, index) => {
                    const compCalc = result.components[index];
                    const contrib = compCalc ? compCalc.contributionPp : 0;
                    return (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            className="calc-cell-input"
                            value={c.name}
                            onChange={(e) => handleUpdateComponent(index, 'name', e.target.value)}
                            placeholder="Nome do componente"
                          />
                        </td>
                        <td>
                          <div className="calc-cell-weight-wrap">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              className="calc-cell-input num"
                              value={c.weight}
                              onChange={(e) =>
                                handleUpdateComponent(index, 'weight', parseFloat(e.target.value) || 0)
                              }
                            />
                            <span className="calc-cell-unit">%</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="calc-cell-input"
                            value={c.driverName}
                            onChange={(e) => handleUpdateComponent(index, 'driverName', e.target.value)}
                            placeholder="Fonte / Indicador balizador"
                          />
                        </td>
                        <td>
                          <div className="calc-cell-weight-wrap">
                            <input
                              type="number"
                              step="0.1"
                              className="calc-cell-input num"
                              value={c.driverVariation}
                              onChange={(e) =>
                                handleUpdateComponent(
                                  index,
                                  'driverVariation',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                            <span className="calc-cell-unit">%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`calc-contrib-pill ${
                              contrib > 0 ? 'pos' : contrib < 0 ? 'neg' : 'zero'
                            }`}
                          >
                            {contrib >= 0 ? '+' : ''}
                            {contrib.toFixed(2)} p.p.
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(index)}
                            className="calc-row-del-btn"
                            title="Remover linha"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>TOTAL PONDERADO</strong></td>
                    <td>
                      <span className={`calc-foot-weight ${isSumValid ? 'valid' : 'invalid'}`}>
                        {sumWeights.toFixed(1)}%
                      </span>
                    </td>
                    <td colSpan={2} style={{ textAlign: 'right', color: '#64748B', fontWeight: 600 }}>
                      Variação Agregada Teórica (Should-Cost):
                    </td>
                    <td>
                      <span className="calc-foot-val">
                        {result.aggregatedTheoreticalVariation >= 0 ? '+' : ''}
                        {result.aggregatedTheoreticalVariation.toFixed(2)}%
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Parecer do Economista de Compras */}
          {result.isValid && (
            <div className="calc-summary-card">
              <div className="calc-summary-badge">
                <AlertCircle size={13} color="var(--navy)" />
                <span>Recomendação Estratégica para o Comprador</span>
              </div>
              <p className="calc-summary-text">{result.summaryText}</p>
            </div>
          )}
        </div>

        {/* Rodapé Corporativo */}
        <div className="calc-modal-footer">
          <div className="calc-footer-info">
            Engenharia reversa de preços baseada em pesos percentuais e séries econômicas oficiais.
          </div>

          <div className="calc-footer-actions">
            <button type="button" className="calc-btn-secondary" onClick={onClose}>
              Fechar
            </button>

            <button
              type="button"
              className="calc-btn-primary"
              onClick={handleExportToChat}
              disabled={!result.isValid}
              title="Inserir matriz detalhada de Should-Cost na conversa"
            >
              <Layers size={13} />
              <span>Inserir Cálculo no Chat</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
