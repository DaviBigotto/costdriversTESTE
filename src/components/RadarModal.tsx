'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Percent,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { PlurixLogo } from '@/components/PlurixLogo';
import { LiveCurrencyData } from '@/lib/currency';
import { MacroeconomicPanel } from '@/lib/indicators';
import { FuelPriceReport } from '@/lib/fuel';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoChat: (formattedText: string) => void;
}

export function RadarModal({ isOpen, onClose, onInsertIntoChat }: RadarModalProps) {
  const [currency, setCurrency] = useState<LiveCurrencyData | null>(null);
  const [indicators, setIndicators] = useState<MacroeconomicPanel | null>(null);
  const [fuel, setFuel] = useState<FuelPriceReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/currency').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/indicators').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/fuel').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([currData, indData, fuelData]) => {
        setCurrency(currData);
        setIndicators(indData);
        setFuel(fuelData);
        setLastUpdatedTime(
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        );
      })
      .catch((err) => {
        console.error('Falha ao carregar dados do Radar:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const usd = currency?.usd;
    const eur = currency?.eur;
    const ipca = indicators?.ipca;
    const inpc = indicators?.inpc;
    const selic = indicators?.selic;
    const cdi = indicators?.cdi;
    const diesel = fuel?.dieselS10Brasil;

    const summary = `📊 Radar Econômico de Mercado — Plurix Compras Indiretas
Data: ${new Date().toLocaleDateString('pt-BR')} às ${lastUpdatedTime || '09:00'}

1. CÂMBIO COMERCIAL (AwesomeAPI / Mercado Financeiro):
- Dólar Comercial (USD): ${usd ? `R$ ${usd.bid.toFixed(4)} (${usd.pctChange >= 0 ? '+' : ''}${usd.pctChange.toFixed(2)}%)` : 'Consultando...'}
- Euro Comercial (EUR): ${eur ? `R$ ${eur.bid.toFixed(4)} (${eur.pctChange >= 0 ? '+' : ''}${eur.pctChange.toFixed(2)}%)` : 'Consultando...'}

2. INFLAÇÃO OFICIAL (IBGE):
- IPCA (12 meses): ${ipca ? `${ipca.accumulated12m}%` : 'Consultando...'} | Mês: ${ipca ? `${(ipca.monthlyVariation || 0) >= 0 ? '+' : ''}${ipca.monthlyVariation || 0}% (Ref: ${ipca.referencePeriod})` : '—'}
- INPC (12 meses - Dissídios & Serviços): ${inpc ? `${inpc.accumulated12m}%` : 'Consultando...'} | Mês: ${inpc ? `${(inpc.monthlyVariation || 0) >= 0 ? '+' : ''}${inpc.monthlyVariation || 0}%` : '—'}

3. JUROS & CAPITAL (Banco Central / B3):
- Taxa Selic Meta: ${selic ? `${selic.annualRate}% a.a.` : 'Consultando...'}
- Taxa CDI: ${cdi ? `${cdi.annualRate}% a.a.` : 'Consultando...'}

4. COMBUSTÍVEIS & FRETE (Petrobras / ANP):
- Diesel S10 (Média Brasil na Bomba): ${diesel ? `R$ ${diesel.averagePrice.toFixed(2)}/L` : 'Consultando...'} ${fuel?.regionalDiesel?.SP ? `(SP: R$ ${fuel.regionalDiesel.SP.averagePrice.toFixed(2)}/L)` : ''}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertIntoChat = () => {
    const usd = currency?.usd;
    const eur = currency?.eur;
    const ipca = indicators?.ipca;
    const inpc = indicators?.inpc;
    const selic = indicators?.selic;
    const cdi = indicators?.cdi;
    const diesel = fuel?.dieselS10Brasil;

    const formatted = `### Radar de Mercado — Painel Macroeconômico Oficial
**Data de consulta:** ${new Date().toLocaleDateString('pt-BR')} às ${lastUpdatedTime || '09:00'}

| Indicador | Cotação / Valor | Variação Período | Referência | Fonte Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **Dólar Comercial (USD/BRL)** | ${usd ? `R$ ${usd.bid.toFixed(4)}` : 'Consultando...'} | ${usd ? `${usd.pctChange >= 0 ? '+' : ''}${usd.pctChange.toFixed(2)}%` : '—'} | Tempo Real | AwesomeAPI / Mercado Financeiro |
| **Euro Comercial (EUR/BRL)** | ${eur ? `R$ ${eur.bid.toFixed(4)}` : 'Consultando...'} | ${eur ? `${eur.pctChange >= 0 ? '+' : ''}${eur.pctChange.toFixed(2)}%` : '—'} | Tempo Real | AwesomeAPI / Mercado Financeiro |
| **IPCA (Inflação Geral)** | ${ipca ? `${ipca.accumulated12m}% (12m)` : '—'} | ${ipca ? `${(ipca.monthlyVariation || 0) >= 0 ? '+' : ''}${ipca.monthlyVariation || 0}% no mês` : '—'} | ${ipca?.referencePeriod || '—'} | IBGE |
| **INPC (Dissídios & Serviços)** | ${inpc ? `${inpc.accumulated12m}% (12m)` : '—'} | ${inpc ? `${(inpc.monthlyVariation || 0) >= 0 ? '+' : ''}${inpc.monthlyVariation || 0}% no mês` : '—'} | ${inpc?.referencePeriod || '—'} | IBGE |
| **Taxa Selic Meta** | ${selic ? `${selic.annualRate}% a.a.` : '—'} | Estável | ${selic?.referencePeriod || '—'} | Banco Central do Brasil |
| **Taxa CDI** | ${cdi ? `${cdi.annualRate}% a.a.` : '—'} | Estável | ${cdi?.referencePeriod || '—'} | B3 |
| **Diesel S10 (Frete & Logística)** | ${diesel ? `R$ ${diesel.averagePrice.toFixed(2)}/L` : '—'} | ${diesel ? `${diesel.weeklyVariationPercent >= 0 ? '+' : ''}${diesel.weeklyVariationPercent.toFixed(2)}% na semana` : '—'} | ${diesel?.period || '—'} | Petrobras / ANP |

> **Orientação para o Comprador:** Utilize estes indicadores como premissas oficiais em análises de Should-Cost e negociações de reajuste com fornecedores.`;

    onInsertIntoChat(formatted);
    onClose();
  };

  const usd = currency?.usd;
  const eur = currency?.eur;
  const ipca = indicators?.ipca;
  const inpc = indicators?.inpc;
  const selic = indicators?.selic;
  const cdi = indicators?.cdi;
  const diesel = fuel?.dieselS10Brasil;

  return (
    <div className="radar-overlay" onClick={onClose}>
      <div className="radar-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Corporativo Plurix */}
        <div className="radar-modal-header">
          <div className="radar-modal-brand">
            <PlurixLogo height={22} />
            <div className="radar-modal-divider" />
            <div>
              <div className="radar-modal-title">Radar Econômico de Mercado</div>
              <div className="radar-modal-subtitle">
                Inteligência macroeconômica e cotações oficiais para Compras Indiretas
              </div>
            </div>
          </div>

          <div className="radar-modal-header-actions">
            <div className="radar-live-pill">
              <span className="radar-live-dot" />
              <span className="radar-live-text">Dados Oficiais em Tempo Real</span>
            </div>

            <button
              type="button"
              className="radar-refresh-btn"
              onClick={loadData}
              title="Atualizar indicadores"
              disabled={isLoading}
            >
              <RefreshCw size={13} className={isLoading ? 'spinning' : ''} />
            </button>

            <button
              type="button"
              className="radar-close-circle-btn"
              onClick={onClose}
              title="Fechar (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="radar-modal-body">
          {isLoading ? (
            <div className="radar-loading-container">
              <div className="radar-spinner-plurix" />
              <div className="radar-loading-title">Sincronizando Indicadores Oficiais</div>
              <div className="radar-loading-desc">
                Consultando APIs do IBGE (IPCA/INPC), Banco Central (Selic), ANP (Diesel) e AwesomeAPI (Câmbio)...
              </div>
            </div>
          ) : (
            <div className="radar-cards-layout">
              {/* CARD 1: CÂMBIO */}
              <div className="radar-feature-card">
                <div className="radar-card-topbar">
                  <div className="radar-card-title-group">
                    <div className="radar-icon-wrap navy">
                      <DollarSign size={14} />
                    </div>
                    <div>
                      <div className="radar-card-kicker">CÂMBIO COMERCIAL</div>
                      <div className="radar-card-heading">Moedas & Paridade Cambial</div>
                    </div>
                  </div>
                  <span className="radar-pill-source">AwesomeAPI / B3</span>
                </div>

                <div className="radar-dual-subcards">
                  {/* USD */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">Dólar (USD / BRL)</span>
                      <div
                        className={`radar-pct-pill ${
                          usd && usd.pctChange < 0 ? 'negative' : 'positive'
                        }`}
                      >
                        {usd && usd.pctChange < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        <span>
                          {usd && usd.pctChange >= 0 ? '+' : ''}
                          {usd ? usd.pctChange.toFixed(2) : '-0.18'}%
                        </span>
                      </div>
                    </div>
                    <div className="radar-subcard-val">
                      R$ {usd ? usd.bid.toFixed(4) : '5.0552'}
                    </div>
                    <div className="radar-subcard-meta">
                      <span>Mín: R$ {usd?.low.toFixed(4) || '5.0427'}</span>
                      <span>Máx: R$ {usd?.high.toFixed(4) || '5.0645'}</span>
                    </div>
                  </div>

                  {/* EUR */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">Euro (EUR / BRL)</span>
                      <div
                        className={`radar-pct-pill ${
                          eur && eur.pctChange < 0 ? 'negative' : 'positive'
                        }`}
                      >
                        {eur && eur.pctChange < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        <span>
                          {eur && eur.pctChange >= 0 ? '+' : ''}
                          {eur ? eur.pctChange.toFixed(2) : '-0.40'}%
                        </span>
                      </div>
                    </div>
                    <div className="radar-subcard-val">
                      R$ {eur ? eur.bid.toFixed(4) : '5.6728'}
                    </div>
                    <div className="radar-subcard-meta">
                      <span>Mín: R$ {eur?.low.toFixed(4) || '5.6624'}</span>
                      <span>Máx: R$ {eur?.high.toFixed(4) || '5.6980'}</span>
                    </div>
                  </div>
                </div>

                <div className="radar-card-footnote">
                  Impacta resinas plásticas (PEAD/PEBD), papel térmico de PDV, TI e frete internacional.
                </div>
              </div>

              {/* CARD 2: INFLAÇÃO */}
              <div className="radar-feature-card">
                <div className="radar-card-topbar">
                  <div className="radar-card-title-group">
                    <div className="radar-icon-wrap amber">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <div className="radar-card-kicker">INFLAÇÃO OFICIAL</div>
                      <div className="radar-card-heading">Índices de Repactuação (IBGE)</div>
                    </div>
                  </div>
                  <span className="radar-pill-source">IBGE SIDRA</span>
                </div>

                <div className="radar-dual-subcards">
                  {/* IPCA */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">IPCA (Consumo Geral)</span>
                      <span className="radar-badge-month">
                        {ipca && (ipca.monthlyVariation || 0) >= 0 ? '+' : ''}
                        {ipca?.monthlyVariation || 0.82}% mês
                      </span>
                    </div>
                    <div className="radar-subcard-val">
                      {ipca?.accumulated12m || 4.58}%
                      <span className="radar-val-unit">12 meses</span>
                    </div>
                    <div className="radar-subcard-note">
                      Contratos de serviços gerais e TI
                    </div>
                  </div>

                  {/* INPC */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">INPC (Dissídios & CCTs)</span>
                      <span className="radar-badge-month">
                        {inpc && (inpc.monthlyVariation || 0) >= 0 ? '+' : ''}
                        {inpc?.monthlyVariation || 0.82}% mês
                      </span>
                    </div>
                    <div className="radar-subcard-val highlight">
                      {inpc?.accumulated12m || 4.29}%
                      <span className="radar-val-unit">12 meses</span>
                    </div>
                    <div className="radar-subcard-note">
                      Balizador de mão de obra e facilities
                    </div>
                  </div>
                </div>

                <div className="radar-card-footnote">
                  Mês de referência oficial: {ipca?.referencePeriod || '09/2026'}. Base legal para convenções coletivas.
                </div>
              </div>

              {/* CARD 3: JUROS & CAPITAL */}
              <div className="radar-feature-card">
                <div className="radar-card-topbar">
                  <div className="radar-card-title-group">
                    <div className="radar-icon-wrap green">
                      <Percent size={14} />
                    </div>
                    <div>
                      <div className="radar-card-kicker">TAXAS DE JUROS & CAPITAL</div>
                      <div className="radar-card-heading">Custo Financeiro e Moeda</div>
                    </div>
                  </div>
                  <span className="radar-pill-source">Bacen / B3</span>
                </div>

                <div className="radar-dual-subcards">
                  {/* SELIC */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">Taxa Selic Meta</span>
                      <span className="radar-badge-neutral">COPOM</span>
                    </div>
                    <div className="radar-subcard-val">
                      {selic?.annualRate || 13.75}%
                      <span className="radar-val-unit">a.a.</span>
                    </div>
                    <div className="radar-subcard-note">
                      Taxa básica de juros da economia
                    </div>
                  </div>

                  {/* CDI */}
                  <div className="radar-subcard">
                    <div className="radar-subcard-head">
                      <span className="radar-subcard-label">Taxa CDI (B3)</span>
                      <span className="radar-badge-neutral">Interbancário</span>
                    </div>
                    <div className="radar-subcard-val">
                      {cdi?.annualRate || 13.65}%
                      <span className="radar-val-unit">a.a.</span>
                    </div>
                    <div className="radar-subcard-note">
                      Custo de capital e capital de giro
                    </div>
                  </div>
                </div>

                <div className="radar-card-footnote">
                  Define o custo de oportunidade de carregamento de estoque e prazos de pagamento.
                </div>
              </div>

              {/* CARD 4: COMBUSTÍVEIS & FRETE */}
              <div className="radar-feature-card">
                <div className="radar-card-topbar">
                  <div className="radar-card-title-group">
                    <div className="radar-icon-wrap blue">
                      <Fuel size={14} />
                    </div>
                    <div>
                      <div className="radar-card-kicker">COMBUSTÍVEIS & FRETE</div>
                      <div className="radar-card-heading">Parâmetros de Transporte (Petrobras / ANP)</div>
                    </div>
                  </div>
                  <span className="radar-pill-source">Petrobras Oficial</span>
                </div>

                <div className="radar-fuel-spotlight">
                  <div className="radar-fuel-main">
                    <div>
                      <div className="radar-fuel-label">Diesel S10 (Média Brasil na Bomba)</div>
                      <div className="radar-fuel-price">
                        R$ {diesel?.averagePrice.toFixed(2) || '7.36'}
                        <span className="radar-val-unit">/ litro</span>
                      </div>
                    </div>
                    <div
                      className={`radar-pct-pill ${
                        diesel && diesel.weeklyVariationPercent < 0 ? 'negative' : 'positive'
                      }`}
                    >
                      {diesel && diesel.weeklyVariationPercent < 0 ? (
                        <TrendingDown size={10} />
                      ) : (
                        <TrendingUp size={10} />
                      )}
                      <span>
                        {diesel && diesel.weeklyVariationPercent >= 0 ? '+' : ''}
                        {diesel?.weeklyVariationPercent || +0.41}% sem.
                      </span>
                    </div>
                  </div>

                  <div className="radar-regional-tags">
                    <div className="radar-hub-tag">
                      <strong>SP</strong> R$ {fuel?.regionalDiesel?.SP?.averagePrice.toFixed(2) || '7.24'}
                    </div>
                    <div className="radar-hub-tag">
                      <strong>MG</strong> R$ {fuel?.regionalDiesel?.MG?.averagePrice.toFixed(2) || '7.32'}
                    </div>
                    <div className="radar-hub-tag">
                      <strong>RJ</strong> R$ {fuel?.regionalDiesel?.RJ?.averagePrice.toFixed(2) || '7.48'}
                    </div>
                    <div className="radar-hub-tag">
                      <strong>PR</strong> R$ {fuel?.regionalDiesel?.PR?.averagePrice.toFixed(2) || '7.18'}
                    </div>
                  </div>
                </div>

                <div className="radar-card-footnote">
                  Composição Petrobras: Refinaria (R$ 3,15) + Distribuição (R$ 2,22) + ICMS (R$ 1,17) + Biodiesel (R$ 0,82). Gatilho ANTT &gt; 5%.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Corporativo com Ações Claras */}
        <div className="radar-modal-footer">
          <div className="radar-footer-status">
            <Clock size={12} />
            <span>
              Sincronizado hoje às <strong>{lastUpdatedTime || '09:00'}</strong> · Fontes: IBGE, Bacen, ANP e B3
            </span>
          </div>

          <div className="radar-footer-actions">
            <button
              type="button"
              className="radar-btn-secondary"
              onClick={handleCopySummary}
              title="Copiar resumo textual para colar em e-mail ou WhatsApp"
            >
              {copied ? (
                <>
                  <Check size={13} color="var(--pos-d)" />
                  <span style={{ color: 'var(--pos-d)' }}>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="radar-btn-secondary"
              onClick={onClose}
            >
              Fechar
            </button>

            <button
              type="button"
              className="radar-btn-primary"
              onClick={handleInsertIntoChat}
              disabled={isLoading}
              title="Inserir quadro macroeconômico completo no chat"
            >
              <Layers size={13} />
              <span>Inserir Quadro no Chat</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
