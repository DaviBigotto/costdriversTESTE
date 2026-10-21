'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlurixLogo } from '@/components/PlurixLogo';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { CalculatorModal } from '@/components/CalculatorModal';
import { RadarModal } from '@/components/RadarModal';
import { GroundingSource } from '@/lib/gemini';
import {
  ArrowUp,
  Plus,
  Trash2,
  Copy,
  Check,
  FileText,
  Calculator,
  ExternalLink,
  Search,
  Download,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  SquarePen,
  DollarSign,
  Users,
  Truck,
  FileDown,
  Activity,
  Pencil,
  X,
} from 'lucide-react';
import { generateBulletinPdf } from '@/lib/pdfGenerator';
import {
  SlashCommandMenu,
  SLASH_COMMANDS,
  SlashCommandItem,
} from '@/components/SlashCommandMenu';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: GroundingSource[];
  suggestedAction?: {
    type: string;
    label: string;
    topic?: string;
  };
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  isCustomTitle?: boolean;
}

const STORAGE_KEY = 'plurix_economista_conversations_v2';
const ACTIVE_CONV_KEY = 'plurix_economista_active_id_v2';

export default function EconomistaDeComprasPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<number>(0);
  const [isCommandMenuDismissed, setIsCommandMenuDismissed] = useState<boolean>(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete de comandos com '/'
  const isSlashCommandActive =
    inputMessage.startsWith('/') && !inputMessage.includes(' ') && !isCommandMenuDismissed;
  const slashQuery = inputMessage.slice(1).trim().toLowerCase();
  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.command.slice(1).includes(slashQuery) ||
      cmd.label.toLowerCase().includes(slashQuery) ||
      cmd.description.toLowerCase().includes(slashQuery)
  );

  useEffect(() => {
    setSelectedCommandIndex(0);
  }, [slashQuery]);

  // Carrega histórico local
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        setConversations(parsed);
        const lastActive = localStorage.getItem(ACTIVE_CONV_KEY);
        if (lastActive && parsed.some((c) => c.id === lastActive)) {
          setActiveConversationId(lastActive);
        } else if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        } else {
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
    } catch (e) {
      console.error('Falha ao carregar histórico local:', e);
      createNewConversation();
    }
  }, []);

  // Salva no LocalStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (e) {
        console.error('Falha ao salvar conversas:', e);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId);
      scrollToBottom();
    }
  }, [activeConversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Ajusta altura do textarea dinamicamente e gerencia exibição do menu de comandos
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    if (isCommandMenuDismissed && val.startsWith('/')) {
      setIsCommandMenuDismissed(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSelectCommand = (cmd: SlashCommandItem) => {
    setIsCommandMenuDismissed(true);
    if (cmd.template === 'open_calculator') {
      setInputMessage('');
      setIsCalculatorOpen(true);
      return;
    }
    if (cmd.command === '/indices') {
      setInputMessage('');
      handleSendMessage('/indices');
      return;
    }

    setInputMessage(cmd.template);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 50);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const createNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'Nova Análise',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const startEditingConversation = (id: string, currentTitle: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingConvId(id);
    setEditingTitle(currentTitle || '');
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  const saveConversationTitle = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: trimmed, isCustomTitle: true } : c
        )
      );
    }
    setEditingConvId(null);
    setEditingTitle('');
  };

  const cancelEditingConversation = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setEditingConvId(null);
    setEditingTitle('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    // Limpa a caixa de texto imediatamente e reseta o tamanho do textarea
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Intercepta comando /boletim se digitado diretamente
    if (text.trim().toLowerCase().startsWith('/boletim')) {
      const match = text.trim().match(/^\/boletim\s*(.*)$/i);
      const extractedTopic = match && match[1] ? match[1].trim() : (activeConversation?.title || 'Categorias Indiretas');
      return handleGenerateBulletin(extractedTopic);
    }

    const currentMessages = activeConversation ? [...activeConversation.messages, userMsg] : [userMsg];
    const isFirstMessage = currentMessages.length === 1;
    const conversationTitle = activeConversation?.isCustomTitle
      ? activeConversation.title
      : isFirstMessage
        ? text.trim().slice(0, 28)
        : (activeConversation?.title || 'Consulta');

    const modelMsgId = `msg_${Date.now() + 1}`;
    const initialModelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      sources: [],
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              title: conversationTitle,
              messages: [...currentMessages, initialModelMsg],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha na resposta do servidor');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evt of events) {
          const trimmed = evt.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'token') {
              streamedText += data.content;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === activeConversationId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === modelMsgId ? { ...m, content: streamedText } : m
                        ),
                      }
                    : c
                )
              );
              scrollToBottom();
            } else if (data.type === 'done') {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === activeConversationId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === modelMsgId
                            ? {
                                ...m,
                                content: data.text || streamedText,
                                sources: data.sources || [],
                                suggestedAction: data.suggestedAction,
                              }
                            : m
                        ),
                      }
                    : c
                )
              );
            }
          } catch (e) {
            console.error('Erro ao decodificar evento SSE:', e);
          }
        }
      }
    } catch (error) {
      console.error('Falha ao obter resposta da API:', error);
      const errorMsgText = '> ⚠️ **Erro de Conexão:** Não foi possível contactar o servidor local do Economista de Compras.';
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMsgId ? { ...m, content: errorMsgText } : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleGenerateBulletin = async (topic?: string) => {
    if (isLoading) return;
    const bulletinTopic = topic || activeConversation?.title || 'Categorias Indiretas';

    const userPrompt = `/boletim ${bulletinTopic}`;
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    const currentMessages = activeConversation ? [...activeConversation.messages, userMsg] : [userMsg];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: currentMessages,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await fetch('/api/bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: bulletinTopic,
          contextHistory: currentMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n'),
        }),
      });

      const data = await response.json();

      const modelMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        content: data.text,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                messages: [...currentMessages, modelMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      // Dispara o download automático do PDF corporativo oficial
      try {
        generateBulletinPdf({
          title: `Boletim de Mercado — ${bulletinTopic}`,
          topic: bulletinTopic,
          markdownContent: data.text,
          sources: data.sources || [],
        });
      } catch (pdfErr) {
        console.error('Falha ao gerar PDF automático:', pdfErr);
      }
    } catch (error) {
      console.error('Falha na geração do boletim:', error);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportConversation = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const markdownContent = `# Análise Econômica — ${activeConversation.title}
Plurix Hub · Compras Indiretas
Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

${activeConversation.messages
  .map(
    (m) =>
      `### [${m.timestamp}] ${m.role === 'user' ? 'Comprador' : 'Economista de Compras'}\n\n${m.content}\n`
  )
  .join('\n---\n\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analise-${activeConversation.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Navegação no menu de comandos / com teclado
    if (isSlashCommandActive && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectCommand(filteredCommands[selectedCommandIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsCommandMenuDismissed(true);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Retrátil Estilo ChatGPT / Claude */}
      <aside className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-group">
            <PlurixLogo height={18} />
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-plurix">Plurix</span>
              <span className="sidebar-brand-title">Economista de Compras</span>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section-label">Histórico de Análises</div>
          {conversations.map((conv) => {
            const isEditing = editingConvId === conv.id;
            return (
              <div
                key={conv.id}
                className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
                onClick={() => {
                  if (!isEditing) setActiveConversationId(conv.id);
                }}
              >
                {isEditing ? (
                  <form
                    className="conversation-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveConversationTitle(conv.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      className="conversation-title-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEditingConversation();
                        }
                      }}
                      onBlur={() => saveConversationTitle(conv.id)}
                      maxLength={60}
                    />
                    <div className="conversation-edit-actions">
                      <button
                        type="button"
                        className="conversation-action-btn confirm"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveConversationTitle(conv.id);
                        }}
                        title="Salvar"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        className="conversation-action-btn cancel"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          cancelEditingConversation();
                        }}
                        title="Cancelar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div
                      className="conversation-title-wrap"
                      onDoubleClick={(e) => startEditingConversation(conv.id, conv.title, e)}
                      title="Clique duas vezes para renomear"
                    >
                      <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                      <span className="conversation-title">{conv.title || 'Consulta'}</span>
                    </div>
                    <div className="conversation-actions">
                      <button
                        type="button"
                        className="conversation-action-btn"
                        onClick={(e) => startEditingConversation(conv.id, conv.title, e)}
                        title="Renomear conversa"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        className="conversation-action-btn delete"
                        onClick={(e) => deleteConversation(conv.id, e)}
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-new-chat-btn"
            onClick={createNewConversation}
            title="Iniciar novo chat"
          >
            <SquarePen size={15} />
            <span>Novo chat</span>
          </button>
        </div>
      </aside>

      {/* Área Principal de Conversa */}
      <main className="main-area">
        {/* Topbar Minimalista com Identidade Plurix */}
        <header className="chat-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
            >
              {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </button>

            <div className="topbar-title-wrap">
              {!isSidebarOpen && (
                <>
                  <div className="topbar-logo">
                    <PlurixLogo height={18} />
                  </div>
                  <div className="topbar-divider"></div>
                </>
              )}
              {activeConversation && (
                <div className="topbar-title-container">
                  {editingConvId === activeConversation.id ? (
                    <form
                      className="topbar-title-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveConversationTitle(activeConversation.id);
                      }}
                    >
                      <input
                        ref={editInputRef}
                        type="text"
                        className="topbar-title-input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEditingConversation();
                          }
                        }}
                        onBlur={() => saveConversationTitle(activeConversation.id)}
                        maxLength={60}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="topbar-title-btn"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveConversationTitle(activeConversation.id);
                        }}
                        title="Salvar"
                      >
                        <Check size={12} />
                      </button>
                    </form>
                  ) : (
                    <div
                      className="topbar-title-clickable"
                      onClick={(e) => startEditingConversation(activeConversation.id, activeConversation.title, e)}
                      title="Clique para renomear este chat"
                    >
                      <span className="topbar-title">
                        {activeConversation.messages.length ? (activeConversation.title || 'Economista de Compras') : 'Economista de Compras'}
                      </span>
                      <Pencil size={12} className="topbar-title-edit-icon" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => setIsRadarOpen(true)}
              title="Abrir Radar Econômico de Mercado (Câmbio, Inflação, Selic, Combustíveis)"
            >
              <Activity size={13} color="var(--pos-d)" />
              <span>Radar de Mercado</span>
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setIsCalculatorOpen(true)}
              title="Abrir calculadora determinística Should-Cost"
            >
              <Calculator size={13} color="var(--navy)" />
              <span>Should-Cost</span>
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={handleExportConversation}
              disabled={!activeConversation || activeConversation.messages.length === 0}
              title="Exportar conversa"
            >
              <Download size={13} />
              <span>Exportar</span>
            </button>
          </div>
        </header>

        {/* Scroll Container das Mensagens */}
        <div className="chat-scroll-container">
          <div className="chat-center-wrapper">
            {(!activeConversation || activeConversation.messages.length === 0) ? (
              /* Hero State Moderno (Estilo Claude / ChatGPT / Gemini) */
              <div className="hero-empty-state">
                <div className="hero-logo-badge">
                  <PlurixLogo height={24} />
                </div>
                <h1 className="hero-title">Qual análise vamos conduzir hoje?</h1>
                <p className="hero-subtitle">
                  Assistente conversacional de inteligência econômica para Compras Indiretas.
                  Consulte fatores de custo, avalie pedidos de reajuste e prepare estratégias de negociação.
                </p>

                <div className="prompt-cards-grid">
                  <div
                    className="prompt-card"
                    onClick={() =>
                      handleSendMessage(
                        'Como a oscilação recente do dólar afeta os custos dos itens importados e das matérias-primas de compras indiretas?'
                      )
                    }
                  >
                    <div className="prompt-card-header">
                      <span>Impacto do Dólar & Câmbio</span>
                      <DollarSign size={15} />
                    </div>
                    <div className="prompt-card-desc">
                      Pressão da taxa PTAX sobre resinas, TI/cloud, papel térmico e itens importados.
                    </div>
                  </div>

                  <div
                    className="prompt-card"
                    onClick={() =>
                      handleSendMessage(
                        'O fornecedor pediu reajuste de 9%. Como decompor os cost drivers e calcular o Should-Cost para contrapropor na negociação?'
                      )
                    }
                  >
                    <div className="prompt-card-header">
                      <span>Avaliação de Reajuste (Should-Cost)</span>
                      <Calculator size={15} />
                    </div>
                    <div className="prompt-card-desc">
                      Audite o percentual solicitado com variação ponderada em pontos percentuais.
                    </div>
                  </div>

                  <div
                    className="prompt-card"
                    onClick={() =>
                      handleSendMessage(
                        'Quais cost drivers e regras de dissídio sindical (CCT) devo analisar para reajustes de limpeza e vigilância terceirizada?'
                      )
                    }
                  >
                    <div className="prompt-card-header">
                      <span>Serviços Terceirizados & Mão de Obra</span>
                      <Users size={15} />
                    </div>
                    <div className="prompt-card-desc">
                      Convenções coletivas (CCT), data-base regional, encargos e insumos de facilities.
                    </div>
                  </div>

                  <div
                    className="prompt-card"
                    onClick={() =>
                      handleSendMessage(
                        'Como a variação do preço do diesel e os custos logísticos impactam os contratos de frete rodoviário e distribuição?'
                      )
                    }
                  >
                    <div className="prompt-card-header">
                      <span>Frete, Logística & Diesel</span>
                      <Truck size={15} />
                    </div>
                    <div className="prompt-card-desc">
                      Oscilações do óleo diesel S10 (ANP), manutenção de frotas e transferências para CDs.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Turnos de Conversa Estilo Claude/ChatGPT */
              activeConversation.messages.map((msg) =>
                msg.role === 'user' ? (
                  <div key={msg.id} className="message-turn user-turn">
                    <div className="user-bubble-modern">{msg.content}</div>
                  </div>
                ) : (
                  <div key={msg.id} className="message-turn model-turn">
                    <div className="model-header-row">
                      <div className="model-avatar">
                        <Sparkles size={12} />
                      </div>
                      <span className="model-name">Economista de Compras</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>• {msg.timestamp}</span>
                    </div>

                    <div className="model-content-markdown">
                      {msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px', padding: '4px 0' }}>
                          <span>Analisando cost drivers e dados de mercado</span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </div>
                      )}
                    </div>

                    {/* Fontes Oficiais Retornadas pelo Grounding */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="sources-chips-row">
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
                          Fontes:
                        </span>
                        {msg.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-chip"
                            title={s.title}
                          >
                            <span>{s.title.length > 32 ? `${s.title.slice(0, 32)}...` : s.title}</span>
                            <ExternalLink size={9} />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Barra de Ações Sutil no Rodapé da Mensagem */}
                    {msg.content && (
                      <div className="response-footer-toolbar">
                      <button
                        type="button"
                        className="toolbar-action-btn"
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        title="Copiar resposta"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} color="var(--pos-d)" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copiar
                          </>
                        )}
                      </button>

                      {/* Se for um boletim, oferece o botão para baixar ou rebaixar o PDF oficial */}
                      {(msg.content.includes('Boletim de Mercado') ||
                        msg.content.includes('BOLETIM DE INTELIGÊNCIA') ||
                        msg.content.includes('Boletim de Inteligência') ||
                        msg.content.includes('# BOLETIM') ||
                        msg.content.includes('# Boletim')) && (
                        <button
                          type="button"
                          className="toolbar-action-btn primary"
                          onClick={() => {
                            const extracted =
                              msg.content.match(/#\s*(?:BOLETIM|Boletim)[^—\n]*[—\-:]\s*([^\n]+)/i)?.[1]?.trim() ||
                              activeConversation?.title ||
                              'Sacolinha de supermercado';
                            generateBulletinPdf({
                              title: 'Boletim de Inteligência de Custos — Plurix',
                              topic: extracted,
                              markdownContent: msg.content,
                              sources: msg.sources || [],
                            });
                          }}
                          title="Baixar cópia em PDF oficial timbrado no padrão Plurix"
                        >
                          <FileDown size={12} /> Baixar PDF Oficial
                        </button>
                      )}

                      {msg.suggestedAction && msg.suggestedAction.type === 'generate_bulletin' && (
                        <button
                          type="button"
                          className="toolbar-action-btn primary"
                          onClick={() => handleGenerateBulletin(msg.suggestedAction?.topic)}
                          title="Elaborar um boletim temático estruturado deste assunto"
                        >
                          <FileText size={12} /> {msg.suggestedAction.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            )
          )}

          {/* Indicador de Carregamento Estilo Claude */}
          {isLoading && !activeConversation?.messages.some((m) => m.role === 'model' && !m.content) && (
            <div className="typing-indicator">
                <div className="model-avatar">
                  <Sparkles size={12} />
                </div>
                <span>Analisando cost drivers e dados de mercado</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Cápsula de Entrada Flutuante (Estilo ChatGPT / Claude / Gemini) */}
        <div className="dock-container">
          <div className="dock-content">
            {/* Menu Popover de Autocomplete de Comandos '/' */}
            <SlashCommandMenu
              isOpen={isSlashCommandActive}
              commands={filteredCommands}
              selectedIndex={selectedCommandIndex}
              onSelectCommand={handleSelectCommand}
              searchQuery={slashQuery}
            />

            {/* Input Capsule */}
            <div className={`input-capsule ${inputMessage.trim() ? 'has-content' : ''}`}>
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Pergunte sobre custos, reajustes, drivers, índices ou envie /analise, /boletim..."
                value={inputMessage}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <div className="input-capsule-actions">
                {inputMessage.trim().length > 0 && (
                  <span className="input-kbd-badge">Enter ↵</span>
                )}
                <button
                  type="button"
                  className={`send-round-btn ${inputMessage.trim() ? 'active' : ''}`}
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  title="Enviar mensagem (Enter)"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="dock-disclaimer">
              O Economista de Compras utiliza inteligência econômica e dados públicos. Valide sempre os números antes de negociar.
            </div>
          </div>
        </div>
      </main>

      {/* Modal da Calculadora Should-Cost */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onInsertIntoChat={(text) => handleSendMessage(text)}
      />

      {/* Modal do Radar de Mercado */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        onInsertIntoChat={(text) => handleSendMessage(text)}
      />
    </div>
  );
}
