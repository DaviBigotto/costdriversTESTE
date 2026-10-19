# Economista de Compras — Plurix Hub

Aplicação web corporativa de inteligência econômica, decomposição de custos (*Cost Drivers*), cálculo de *Should-Cost* e preparação estratégica de negociações para a área de **Compras Indiretas**, inspirada na abordagem de plataformas como o GEP COSTDRIVERS e rigorosamente alinhada ao **Design System Oficial do Plurix Hub**.

---

## 1. Visão Geral e Objetivo

O **Economista de Compras** atua como um conselheiro consultivo do comprador. Em vez de relatórios periódicos rígidos gerados sem solicitação, o agente opera no modo **conversacional sob demanda**:
- Responde perguntas diretas sobre custos, índices econômicos, cotações e notícias;
- Decompõe o preço de itens indiretos em componentes e relaciona cada componente a um indexador mensurável (*Cost Driver*);
- Executa cálculos matemáticos determinísticos de *Should-Cost* com validação de soma de pesos (100%) e cálculo de impacto em pontos percentuais (p.p.);
- Pesquisa fontes oficiais brasileiras e globais em tempo real via **Google Search Grounding** na Gemini API;
- Disponibiliza uma ação contextual para **transformar qualquer análise em um Boletim Temático estruturado sob demanda**.

---

## 2. Tecnologias Utilizadas

- **Framework Web**: [Next.js 15 (App Router)](https://nextjs.org/) com React 19 e TypeScript em modo estrito.
- **SDK de IA**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) v2.30.0 (SDK oficial e unificado mais recente do Google Gemini).
- **Pesquisa e Grounding**: Google Search Grounding integrado via Gemini API, fornecendo citações e URLs reais verificáveis.
- **Estilização**: CSS Vanilla consolidado e fiel aos tokens `:root` do **Plurix Hub Design System** (sem frameworks invasivos como Tailwind ou Bootstrap).
- **Tipografia**: Sistema operacional nativo (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`), sem fontes externas pesadas.
- **Ícones**: [`lucide-react`](https://lucide.dev/) (vetores SVG corporativos limpos, sem emojis na interface).
- **Motor de Cálculo Determinístico**: Camada TypeScript dedicada (`src/lib/calculator.ts`) desacoplada da IA.
- **Renderização Rica**: `react-markdown` e `remark-gfm` com encapsulamento obrigatório de tabelas em `.tbl-wrap`.
- **Testes Automatizados**: [Vitest](https://vitest.dev/) para validação unitária e de rotas de API.

---

## 3. Conformidade com o Design System Plurix

A interface foi desenhada seguindo à risca as especificações de [design-system-plurix.md](file:///c:/Users/DaviBigottoLouren%C3%A7o/OneDrive%20-%20PLX%20-%20Plurix/%C3%81rea%20de%20Trabalho/AgenteCOASTDRIVERS/design-system-plurix.md):
- **Cores Oficiais**:
  - Marca: `--navy: #00147D`, `--navy2: #001DB3`
  - Feedback: `--pos: #10B981`, `--neg: #DC2626`, `--gold: #F59E0B`
  - Fundo & Superfícies: `--bg: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)`, `--card: #F4FAFE`, `--surface: #FFFFFF`
  - Contornos: `--brd: #B8D8E8`, `--brd2: #E8EDF2`
  - Texto: `--text: #1A2A38`, `--muted: #7A90A0`
- **Logo Vetorial Oficial Plurix**: Integrado em SVG com a cor oficial `#00147E` no cabeçalho sticky `.appbar`.
- **Hierarquia Visual**:
  1. Barra de App Fixa com botão voltar com glifo `‹`, título `15px` e pílula de contexto `.fonte`;
  2. Grid de 4 KPIs limpos acima da dobra;
  3. Área central de conversa de largura total (`.wrap` sem `max-width` restritivo);
  4. Tabelas com cabeçalho `thead` uppercase `10px`, fundo `#F7F9FC` e scroll horizontal preservado em `.tbl-wrap`.
- **Quatro Estados de Interface**: Vazio (com sugestões práticas de início), Carregamento (`.spinner`), Sucesso e Erro transparente.

---

## 4. Estrutura do Projeto

```
AgenteCOASTDRIVERS/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bulletin/route.ts      # Rota para elaboração de boletins sob demanda
│   │   │   ├── calculate/route.ts     # Rota para cálculo determinístico de Should-Cost
│   │   │   ├── calculate/route.test.ts # Testes da rota /api/calculate
│   │   │   ├── chat/route.ts          # Rota conversacional do Economista de Compras
│   │   │   └── chat/route.test.ts     # Testes da rota /api/chat
│   │   ├── globals.css                # Tokens :root e componentes do Design System Plurix
│   │   ├── layout.tsx                 # Metadados corporativos e estrutura base
│   │   └── page.tsx                   # Interface conversacional completa e interativa
│   ├── components/
│   │   ├── CalculatorModal.tsx        # Modal do motor de cálculo determinístico
│   │   ├── MarkdownRenderer.tsx       # Renderizador com tabelas em .tbl-wrap
│   │   └── PlurixLogo.tsx             # Logo SVG oficial Plurix (#00147E)
│   └── lib/
│       ├── calculator.ts              # Motor matemático determinístico (Should-Cost)
│       ├── calculator.test.ts         # Testes unitários do motor matemático
│       ├── gemini.ts                  # Integração com @google/genai e Search Grounding
│       └── knowledge.ts               # Base de conhecimento (12 categorias e instruções)
├── .env.example                       # Modelo de variáveis de ambiente sem segredos
├── .env                               # Arquivo local para inserção da GEMINI_API_KEY
├── design-system-plurix.md            # Guia oficial do Design System Plurix Hub
├── Economista_de_Compras_Conversacional_v3_com_boletim.md # Metodologia econômica oficial
├── package.json                       # Dependências e scripts do projeto
├── tsconfig.json                      # Configuração TypeScript
└── vitest.config.ts                   # Configuração da suíte de testes
```

---

## 5. Como Configurar e Executar Localmente

### Pré-requisitos
- **Node.js**: v18+ (recomendado v20 ou v24)
- **NPM**: v9+

### Passo 1: Obter a Chave da Gemini API
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Crie uma chave de API gratuita ou corporativa (`GEMINI_API_KEY`).

### Passo 2: Configurar o arquivo `.env`
Abra o arquivo `.env` na raiz do projeto e insira sua chave:
```env
GEMINI_API_KEY=AIzaSy...sua_chave_aqui...
GEMINI_MODEL=gemini-2.5-flash
```

> **Aviso de Segurança**: A chave de API permanece **exclusivamente no servidor backend**. O front-end nunca tem acesso à credencial privada.

### Passo 3: Executar a Aplicação
```bash
# Rodar os testes unitários do motor de cálculo e rotas
npm test

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: **`http://localhost:4000`**

---

## 6. Funcionalidades Detalhadas

### 6.1. Assistente Conversacional Econômico
O comprador pode enviar perguntas livres ou usar os comandos rápidos da metodologia:
- `/analise [item]`: Produz um estudo aprofundado com premissas, drivers e cenários.
- `/reajuste [item] [% pedido]`: Avalia o pleito do fornecedor comparando com a variação teórica ponderada.
- `/indices`: Consulta os principais indicadores macroeconômicos (IPCA, IGP-M, INPC, Selic, Focus).
- `/estrategia [item]`: Sugere cláusulas paramétricas, perguntas ao fornecedor e alternativas (BATNA).
- `/riscos [item]`: Mapeia fatores de risco de curto e médio prazo.

### 6.2. Motor de Cálculo Determinístico (Should-Cost)
A matemática nunca é delegada à aleatoriedade do modelo de linguagem:
- **Fórmula de Referência**:
  $$\Delta P_{item} = \sum_{i=1}^{n} (peso_i \times \Delta driver_i)$$
- **Validação de Pesos**: Garante que a soma totalize 100% (com tolerância máxima de 0,5% para arredondamentos).
- **Cálculo de Contribuição**: Converte a oscilação do indexador na contribuição exata em pontos percentuais (p.p.).
- **Diferença para o Pedido**: Diferencia com precisão pontos percentuais de variação relativa.
- **Biblioteca Integrada**: 12 setores pré-cadastrados (Sacolas PEAD, Filmes plásticos, Embalagens de papelão, Bobinas térmicas, Limpeza terceirizada, Vigilância, Manutenção predial, Energia elétrica, Uniformes, Frete rodoviário, TI e Gráfica).
- **Acesso na Interface**: Clique no botão **"Calculadora Should-Cost"** no topo da tela para simular qualquer composição e transferir a tabela calculada diretamente para a conversa.

### 6.3. Pesquisa na Web em Tempo Real (Google Search Grounding)
- Consultas a fatos recentes, notícias e cotações ativam automaticamente o Grounding da Gemini API.
- Fontes confiáveis exibidas como **tags clicáveis** no rodapé de cada resposta com o título e URL da matéria original.

### 6.4. Geração de Boletins Temáticos Sob Demanda
- Após qualquer resposta analítica relevante, a interface exibe o botão **"Gerar boletim deste tema"**.
- Ao ser clicado, a rota `/api/bulletin` estrutura um relatório corporativo nos 9 pontos oficiais:
  1. Resumo executivo (até 5 pontos);
  2. O que está acontecendo (fatos com datas);
  3. Indicadores acompanhados (tabela formatada);
  4. Principais Cost Drivers;
  5. Impacto para Compras Indiretas;
  6. Riscos e oportunidades;
  7. Implicações para negociação;
  8. O que monitorar a seguir;
  9. Fontes consultadas com links.

### 6.5. Histórico e Privacidade Local
- As conversas são armazenadas temporariamente no navegador via `LocalStorage` para conveniência durante o teste.
- É possível criar novas conversas limpas, alternar entre tópicos, excluir conversas antigas e **exportar o histórico completo em formato Markdown** clicando no botão "Exportar".
- **Nota de Governança**: O armazenamento local atende à fase de validação e não substitui a governança, controle de acessos e auditoria de um banco corporativo de produção.

---

## 7. Registro de Inspeção Inicial dos Arquivos

Conforme solicitado nas instruções iniciais:
1. **`design-system-plurix.md`**: Encontrado na pasta e lido integralmente (tokens, tipografia, regras CSS, logos vetoriais e boas práticas).
2. **`Economista_de_Compras_Conversacional_v3_com_boletim.md`**: Encontrado na pasta e lido integralmente (metodologia de cost drivers, prompt do sistema da Seção 7, biblioteca da Seção 9, exemplo da Seção 10, modelo de boletim da Seção 14).
3. **`Instrucoes_Copilot_Economista_de_Compras_com_boletim.md`**: **Arquivo ausente no diretório**. A metodologia, as instruções centrais do agente e as regras de governança foram integralmente preservadas a partir da Seção 7 e Seção 14 do documento de criação conversacional v3 presente no projeto.
