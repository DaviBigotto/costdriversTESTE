'use client';

import React from 'react';
import {
  Calculator,
  TrendingUp,
  FileText,
  Activity,
  ShieldAlert,
  Briefcase,
  Sliders,
  CornerDownLeft,
} from 'lucide-react';

export interface SlashCommandItem {
  command: string;
  syntax: string;
  label: string;
  description: string;
  template: string;
  category: 'Cálculo' | 'Análise' | 'Mercado';
  badge?: string;
  iconName: string;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    command: '/reajuste',
    syntax: '/reajuste [item] [% pedido]',
    label: 'Auditar Reajuste (Should-Cost)',
    description: 'Calcula a variação teórica em p.p. com fórmula paramétrica e confronta a solicitação do fornecedor',
    template: '/reajuste ',
    category: 'Cálculo',
    badge: 'Should-Cost',
    iconName: 'Calculator',
  },
  {
    command: '/analise',
    syntax: '/analise [item ou categoria]',
    label: 'Análise de Cost Drivers',
    description: 'Disseca a estrutura de custos, matérias-primas, mão de obra e sensibilidade cambial do insumo',
    template: '/analise ',
    category: 'Análise',
    iconName: 'TrendingUp',
  },
  {
    command: '/boletim',
    syntax: '/boletim [tema]',
    label: 'Gerar Boletim de Mercado (PDF)',
    description: 'Elabora estudo econômico em 9 seções executivas e disponibiliza o PDF oficial timbrado para download',
    template: '/boletim ',
    category: 'Mercado',
    badge: 'PDF Oficial',
    iconName: 'FileText',
  },
  {
    command: '/indices',
    syntax: '/indices',
    label: 'Painel Macroeconômico Oficial',
    description: 'Consulta cotações e taxas oficiais ao vivo (Dólar, Euro, IPCA, INPC, Selic e Diesel ANP)',
    template: '/indices',
    category: 'Mercado',
    badge: 'Tempo Real',
    iconName: 'Activity',
  },
  {
    command: '/estrategia',
    syntax: '/estrategia [item]',
    label: 'Estratégia & Argumentos de Negociação',
    description: 'Prepara perguntas para fornecedor, BATNA e proposta de fórmula paramétrica de reajuste',
    template: '/estrategia ',
    category: 'Análise',
    iconName: 'Briefcase',
  },
  {
    command: '/riscos',
    syntax: '/riscos [item]',
    label: 'Matriz de Riscos da Categoria',
    description: 'Mapeia pressões de curto prazo, escassez de oferta, tarifas e volatilidade de matérias-primas',
    template: '/riscos ',
    category: 'Análise',
    iconName: 'ShieldAlert',
  },
  {
    command: '/shouldcost',
    syntax: '/shouldcost',
    label: 'Abrir Calculadora Should-Cost',
    description: 'Abre a calculadora visual interativa com biblioteca setorial da Plurix e simulação de pesos',
    template: 'open_calculator',
    category: 'Cálculo',
    badge: 'Interativo',
    iconName: 'Sliders',
  },
];

interface SlashCommandMenuProps {
  isOpen: boolean;
  commands: SlashCommandItem[];
  selectedIndex: number;
  onSelectCommand: (cmd: SlashCommandItem) => void;
  searchQuery: string;
}

export function SlashCommandMenu({
  isOpen,
  commands,
  selectedIndex,
  onSelectCommand,
  searchQuery,
}: SlashCommandMenuProps) {
  if (!isOpen || commands.length === 0) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator size={15} color="var(--navy)" />;
      case 'TrendingUp':
        return <TrendingUp size={15} color="var(--navy)" />;
      case 'FileText':
        return <FileText size={15} color="var(--navy)" />;
      case 'Activity':
        return <Activity size={15} color="var(--pos-d)" />;
      case 'Briefcase':
        return <Briefcase size={15} color="var(--navy)" />;
      case 'ShieldAlert':
        return <ShieldAlert size={15} color="#DC2626" />;
      case 'Sliders':
        return <Sliders size={15} color="var(--navy)" />;
      default:
        return <Calculator size={15} color="var(--navy)" />;
    }
  };

  return (
    <div className="slash-menu-container" role="listbox" aria-label="Comandos rápidos">
      <div className="slash-menu-header">
        <span className="slash-menu-title">
          Comandos Rápidos do Economista {searchQuery ? `· Filtrando por "${searchQuery}"` : ''}
        </span>
        <span className="slash-menu-hint">Use ↑ ↓ para navegar · Enter ou Tab para selecionar</span>
      </div>

      <div className="slash-menu-list">
        {commands.map((cmd, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={cmd.command}
              role="option"
              aria-selected={isSelected}
              className={`slash-menu-item ${isSelected ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectCommand(cmd);
              }}
            >
              <div className="slash-menu-item-icon">{renderIcon(cmd.iconName)}</div>

              <div className="slash-menu-item-content">
                <div className="slash-menu-item-top">
                  <span className="slash-menu-cmd">{cmd.command}</span>
                  <span className="slash-menu-syntax">{cmd.syntax.replace(cmd.command, '')}</span>
                  <span className="slash-menu-label">— {cmd.label}</span>
                  {cmd.badge && <span className="slash-menu-badge">{cmd.badge}</span>}
                </div>
                <div className="slash-menu-desc">{cmd.description}</div>
              </div>

              <div className="slash-menu-action-hint">
                <span className="slash-menu-enter-badge">
                  <CornerDownLeft size={10} /> Enter
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
