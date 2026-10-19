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
    syntax: '[item] [%]',
    label: 'Auditar Reajuste (Should-Cost)',
    description: 'Calcula variação teórica em p.p. e confronta a proposta do fornecedor',
    template: '/reajuste ',
    category: 'Cálculo',
    badge: 'Should-Cost',
    iconName: 'Calculator',
  },
  {
    command: '/analise',
    syntax: '[item]',
    label: 'Análise de Cost Drivers',
    description: 'Disseca matérias-primas, mão de obra e dependência cambial',
    template: '/analise ',
    category: 'Análise',
    iconName: 'TrendingUp',
  },
  {
    command: '/boletim',
    syntax: '[tema]',
    label: 'Boletim de Mercado (PDF)',
    description: 'Gera estudo em 9 seções executivas e prepara PDF timbrado',
    template: '/boletim ',
    category: 'Mercado',
    badge: 'PDF',
    iconName: 'FileText',
  },
  {
    command: '/indices',
    syntax: '',
    label: 'Painel Macroeconômico',
    description: 'Cotações em tempo real: Dólar, Euro, IPCA, Selic e Diesel ANP',
    template: '/indices',
    category: 'Mercado',
    badge: 'Ao vivo',
    iconName: 'Activity',
  },
  {
    command: '/estrategia',
    syntax: '[item]',
    label: 'Roteiro de Negociação',
    description: 'Perguntas-chave, BATNA e proposta de fórmula paramétrica',
    template: '/estrategia ',
    category: 'Análise',
    iconName: 'Briefcase',
  },
  {
    command: '/riscos',
    syntax: '[item]',
    label: 'Matriz de Riscos',
    description: 'Mapeia gargalos, volatilidade e pressões inflacionárias',
    template: '/riscos ',
    category: 'Análise',
    iconName: 'ShieldAlert',
  },
  {
    command: '/shouldcost',
    syntax: '',
    label: 'Calculadora Should-Cost',
    description: 'Abre a calculadora visual com pesos e drivers interativos',
    template: 'open_calculator',
    category: 'Cálculo',
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
        return <Calculator size={13} color="var(--navy)" />;
      case 'TrendingUp':
        return <TrendingUp size={13} color="var(--navy)" />;
      case 'FileText':
        return <FileText size={13} color="var(--navy)" />;
      case 'Activity':
        return <Activity size={13} color="var(--pos-d)" />;
      case 'Briefcase':
        return <Briefcase size={13} color="var(--navy)" />;
      case 'ShieldAlert':
        return <ShieldAlert size={13} color="#DC2626" />;
      case 'Sliders':
        return <Sliders size={13} color="var(--navy)" />;
      default:
        return <Calculator size={13} color="var(--navy)" />;
    }
  };

  return (
    <div className="slash-menu-container" role="listbox" aria-label="Comandos rápidos">
      <div className="slash-menu-header">
        <span className="slash-menu-title">
          Comandos {searchQuery ? `· "${searchQuery}"` : ''}
        </span>
        <span className="slash-menu-hint">↑ ↓ navegar · ↵ selecionar</span>
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
                  {cmd.syntax && <span className="slash-menu-syntax">{cmd.syntax}</span>}
                  <span className="slash-menu-label">{cmd.label}</span>
                </div>
                <div className="slash-menu-desc">{cmd.description}</div>
              </div>

              {cmd.badge && <span className="slash-menu-badge">{cmd.badge}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
