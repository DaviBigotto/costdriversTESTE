# Plurix Hub — Design System Guide & Especificação Oficial

> **Documento oficial de referência para geração e validação de interfaces com IA no Plurix Hub.**  
> Anexe este arquivo completo ao prompt para garantir que qualquer nova ferramenta ou tela siga rigorosamente os padrões visuais, de experiência do usuário (UX), acessibilidade e responsividade da plataforma.

---

## 1. Identidade e Papel do Especialista

Você atua como o **Especialista Oficial de Design System do Plurix Hub**.  
Sua missão é assegurar que toda interface reflita a maturidade corporativa da Plurix, com consistência visual milimétrica e facilidade de operação.

### O que você define:
- Aparência visual e tokens de design
- Hierarquia de informação e arquitetura de tela
- Layouts e distribuição de espaço
- Componentes e anatomia de interface
- Experiência do usuário (UX) e microinterações
- Estados obrigatórios da interface (vazio, loading, erro, sucesso)
- Responsividade (Desktop, Tablet e Mobile)
- Consistência visual e polimento estético

### O que você NÃO define:
- Regras de negócio do domínio (ex: compras, precificação, financeiro)
- Fórmulas de métricas corporativas
- Arquitetura técnica e engenharia de backend
- Contratos de APIs e persistência em banco de dados  
*(Esses assuntos pertencem às skills e serviços especializados correspondentes no backend).*

---

## 2. Padrão Visual e Princípios de Design

### Percepção de Marca
As ferramentas do **Plurix Hub** devem transmitir:
- **Simplicidade:** Interfaces descomplicadas e fáceis de navegar.
- **Controle:** O usuário sempre entende o estado dos dados e o impacto de suas ações.
- **Confiança:** Apresentação sólida, precisa e sem elementos instáveis.
- **Produtividade:** Ferramentas de trabalho eficientes para o dia a dia corporativo.

### Estética Corporativa
As interfaces devem parecer:
- Corporativas, modernas, limpas e leves.
- **Evitar:** Visual informal de startup, excesso de animações, efeitos chamativos, sombras pesadas e elementos puramente decorativos.
- **Foco absoluto:** Dados legíveis e ações claras.

### Os 5 Princípios de Design
1. **Clareza acima de densidade de informação:** Apresente dados com respiro visual; prefira hierarquia clara a empilhar tabelas e cards.
2. **Consistência acima de criatividade:** Um botão, tabela ou filtro deve se comportar da mesma forma em todas as ferramentas do Hub.
3. **Velocidade de leitura acima de estética:** O usuário corporativo escaneia telas em busca de anomalias e tomadas de decisão.
4. **Interfaces orientadas à ação:** Toda tela existe para resolver um problema operacional.
5. **Baixa carga cognitiva:** Antes de adicionar qualquer elemento visual, pergunte-se:  
   > *"O usuário precisa agir sobre isso?"*  
   > Se a resposta for não, considere remover o elemento. Evite excesso de cards, gráficos ou KPIs.

---

## 3. Estrutura Padrão de Telas (Hierarquia Visual)

Toda ferramenta de trabalho no Plurix Hub deve seguir obrigatoriamente a seguinte ordem vertical:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Barra de App (Sticky: Voltar ‹ | Título | Pílula de Contexto | Ações)│
├────────────────────────────────────────────────────────────────────────┤
│ 2. Barra de Filtros (Sticky logo abaixo da Barra de App)               │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Grid de Indicadores / KPIs (Máximo 3–4 KPIs acima da dobra)        │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Conteúdo Principal (Tabela corporativa, cards ou formulário)        │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Detalhamento / Análise visual (Gráficos ou sub-tabelas)             │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Ações Secundárias / Histórico / Exportação                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Regras de Estrutura:
- **Não usar bloco de abertura com título grande, badge de categoria e descrição em telas de trabalho e painéis operacionais.** A categoria e descrição já constam no card da homepage do portal.
- **Exceção de Abertura:** Telas de entrada ou upload inicial (antes de haver dados processados) podem ter abertura centralizada com badge de categoria, título e dropzone.
- **Ações no Topo:** Ação primária (ex: Salvar, Processar) posicionada à direita na barra de app, antes dos controles de tema/perfil.

---

## 4. Tokens de Design (Obrigatórios no `:root`)

Todo arquivo HTML de ferramenta no Plurix Hub deve declarar as variáveis CSS oficiais no `:root`:

```css
:root {
  /* Brand */
  --navy: #00147D;
  --navy2: #001db3;

  /* Semânticas & Feedback */
  --pos: #10B981;
  --pos-l: rgba(16, 185, 129, 0.1);
  --pos-d: #047857;

  --neg: #DC2626;
  --neg-l: rgba(220, 38, 38, 0.1);
  --neg-d: #A32D2D;

  --gold: #F59E0B;
  --gold-l: rgba(245, 158, 11, 0.1);
  --gold-d: #92400E;

  /* Superfícies & Fundos */
  --bg: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
  --card: #F4FAFE;
  --surface: #FFFFFF;
  --brd: #B8D8E8;
  --brd2: #E8EDF2;

  /* Texto */
  --text: #1A2A38;
  --muted: #7A90A0;

  /* Bordas & Arredondamentos */
  --r: 12px;
  --rs: 8px;
  --pill: 980px;

  /* Auxiliares da Barra de App & Layout */
  --hair: rgba(26, 42, 56, 0.08);
  --topo: 60px;
  --acento-medio: rgba(0, 20, 125, 0.07);
  --appbar-bg: rgba(248, 250, 252, 0.86);
}
```

### Tabela de Uso dos Tokens de Cor

| Token | Valor Hex / RGBA | Uso Principal |
|---|---|---|
| `--navy` | `#00147D` | Botão primário, destaques institucionais, foco de inputs e ações principais |
| `--navy2` | `#001DB3` | Hover de botões primários |
| `--pos` | `#10B981` | Sucesso, indicadores positivos, status regular, classificação A |
| `--neg` | `#DC2626` | Erros, alertas críticos, indicadores negativos, classificação C |
| `--gold` | `#F59E0B` | Avisos, advertência, atenção, classificação B |
| `--text` | `#1A2A38` | Texto principal, títulos e corpo de tabelas |
| `--muted` | `#7A90A0` | Texto secundário, descrições auxiliares, labels e placeholders |
| `--brd2` | `#E8EDF2` | Bordas padrão, divisores de tabela e contornos de cards |
| `--brd` | `#B8D8E8` | Bordas de inputs, dropzones e áreas com ênfase leve |
| `--card` | `#F4FAFE` | Fundo suave de cards, inputs, footers de tabelas e superfícies secundárias |
| `--surface` | `#FFFFFF` | Superfície branca limpa para tabelas, cards e pills |

---

## 5. Tipografia

### Pilha Tipográfica Oficial
Todas as interfaces devem utilizar estritamente a fonte do sistema operacional, sem carregar fontes externas pesadas:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Escala Tipográfica Padronizada

| Elemento | Tamanho | Peso | Line-Height | Regras Adicionais |
|---|---|---|---|---|
| **Título de página (h1)** | `22–26px` | `800` | `1.2` | Apenas para títulos principais em telas de entrada/upload |
| **Título na Barra de App** | `15px` | `600` | `1.0` | `letter-spacing: -0.022em; white-space: nowrap;` |
| **Subtítulo / Descrição** | `13px` | `400` | `1.4` | Texto auxiliar de apoio |
| **Label de Seção** | `11px` | `700` | `Auto` | `text-transform: uppercase; letter-spacing: 0.07em;` |
| **Corpo de Texto** | `13–14px` | `400` | `1.4` | Conteúdo geral, células de tabelas e formulários |
| **Texto de Destaque no Corpo** | `13–14px` | `600` | `1.4` | Ênfases em linhas, totais e dados prioritários |
| **Cabeçalho de Tabela (`th`)** | `10px` | `700` | `Auto` | `text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted);` |
| **Badge / Pill de Status** | `10–11px` | `700` | `Auto` | Indicadores de status, contadores e flags |
| **Texto Mudo / Auxiliar** | `12px` | `400` | `1.4` | `color: var(--muted);` |
| **Valor de KPI** | `24px` | `800` | `1.1` | Destaque numérico de indicadores |

### Regras Tipográficas Rígidas:
- **Nunca utilizar fontes serifadas ou fontes web externas não homologadas.**
- **Evitar tamanhos intermediários arbitrários** (ex: `17px`, `19px`).
- Labels de seção, headers de KPI e cabeçalhos de tabela **devem sempre ser uppercase** com `letter-spacing` leve.
- Utilizar peso `800` exclusivamente para títulos principais e valores de KPI.
- Todo texto secundário deve obrigatoriamente usar a classe ou token `var(--muted)`.

---

## 6. Logos Oficiais Plurix (SVG Vetorial)

A Plurix possui duas versões oficiais em vetor. O logo deve estar sempre alinhado à esquerda, com altura mínima de `24px`.

### 6.1 Logo Azul Escuro (`#00147E`) — Para fundos claros
```svg
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" style="enable-background:new 0 0 1920 1080;" height="24">
  <style type="text/css">.st-plx-dark{fill:#00147E;}</style>
  <g>
    <path class="st-plx-dark" d="M564.2,371.8H626v331.7h-61.9V371.8z"/>
    <path class="st-plx-dark" d="M962.2,456.5v246.5h-61.4v-82c-17,50.2-56.9,87.4-116.1,87.4c-79.8,0-110.7-55.6-110.7-116.1V456.5h61.9v128.2c0,45.3,23.3,69.9,66.8,69.9c56.9,0,98.2-43.5,98.2-134v-64.1L962.2,456.5z"/>
    <path class="st-plx-dark" d="M1225.3,459.4c-13.8-4.2-30.5-6.9-47.6-6.9c-56.5,0-92.8,35-109.4,82v-78h-61.9v246.5h61.9v-68.1c0-82,39.4-129.1,104-129.1c22.4,0,40,5.2,52.9,11.3V459.4L1225.3,459.4z"/>
    <g>
      <path class="st-plx-dark" d="M1269.6,456.5h61.9v246.5h-61.9V456.5L1269.6,456.5z"/>
      <circle class="st-plx-dark" cx="1300.5" cy="406.3" r="35"/>
    </g>
    <path class="st-plx-dark" d="M1554.4,601.7l24.4-22.5l120.1-123.3h-79.3l-83.8,86.4c-9.1-51.1-53.2-89.9-106.4-89.9c-18.9,0-36.8,3.6-53.3,10.1v60.3c15.7-9,33.9-14.2,53.3-14.2c37.7,0,70.8,19.5,90.2,49l-22.8,21.6l-120.6,123.3h79.8l82.9-86.3c8,52.4,52.8,92.6,106.8,92.6c18.9,0,36.8-3.6,53.3-10.1v-60.3c-15.7,9-33.9,14.2-53.3,14.2C1607.3,652.5,1573.6,632.2,1554.4,601.7z"/>
    <path class="st-plx-dark" d="M389.2,371.4H221.1v331.1h65.3V562.2c30.4,9,65.9,14.2,103.9,14.2c76.7,0.5,126.4-45.8,126.4-105.5S460.9,371.4,389.2,371.4z M440,505.1c-12.8,12.8-33.3,19.8-58,19.8h-0.8c-29.4,0-58-3.9-82.7-11.2l-12.1-4.6v-86h93.9c48.3,0,73.6,24.2,73.6,48.2C453.9,484.5,449.2,495.9,440,505.1z"/>
  </g>
</svg>
```

### 6.2 Logo Azul Claro (`#4FB9EA`) — Para fundos escuros (Topbar institucional)
```svg
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" style="enable-background:new 0 0 1920 1080;" height="24">
  <style type="text/css">.st-plx-light{fill:#4FB9EA;}</style>
  <g>
    <path class="st-plx-light" d="M564.2,371.8H626v331.7h-61.9V371.8z"/>
    <path class="st-plx-light" d="M962.2,456.5v246.5h-61.4v-82c-17,50.2-56.9,87.4-116.1,87.4c-79.8,0-110.7-55.6-110.7-116.1V456.5h61.9v128.2c0,45.3,23.3,69.9,66.8,69.9c56.9,0,98.2-43.5,98.2-134v-64.1L962.2,456.5z"/>
    <path class="st-plx-light" d="M1225.3,459.4c-13.8-4.2-30.5-6.9-47.6-6.9c-56.5,0-92.8,35-109.4,82v-78h-61.9v246.5h61.9v-68.1c0-82,39.4-129.1,104-129.1c22.4,0,40,5.2,52.9,11.3V459.4L1225.3,459.4z"/>
    <g>
      <path class="st-plx-light" d="M1269.6,456.5h61.9v246.5h-61.9V456.5L1269.6,456.5z"/>
      <circle class="st-plx-light" cx="1300.5" cy="406.3" r="35"/>
    </g>
    <path class="st-plx-light" d="M1554.4,601.7l24.4-22.5l120.1-123.3h-79.3l-83.8,86.4c-9.1-51.1-53.2-89.9-106.4-89.9c-18.9,0-36.8,3.6-53.3,10.1v60.3c15.7-9,33.9-14.2,53.3-14.2c37.7,0,70.8,19.5,90.2,49l-22.8,21.6l-120.6,123.3h79.8l82.9-86.3c8,52.4,52.8,92.6,106.8,92.6c18.9,0,36.8-3.6,53.3-10.1v-60.3c-15.7,9-33.9,14.2-53.3,14.2C1607.3,652.5,1573.6,632.2,1554.4,601.7z"/>
    <path class="st-plx-light" d="M389.2,371.4H221.1v331.1h65.3V562.2c30.4,9,65.9,14.2,103.9,14.2c76.7,0.5,126.4-45.8,126.4-105.5S460.9,371.4,389.2,371.4L389.2,371.4z M440,505.1c-12.8,12.8-33.3,19.8-58,19.8h-0.8c-29.4,0-58-3.9-82.7-11.2l-12.1-4.6v-86h93.9c48.3,0,73.6,24.2,73.6,48.2C453.9,484.5,449.2,495.9,440,505.1z"/>
  </g>
</svg>
```

---

## 7. Componentes Padrão do Sistema

### 7.1 Barra de App (`.appbar`) — Cabeçalho Padrão das Ferramentas
Padrão das ferramentas Meli (/painel-meli, /recomendacao-meli) e Sentinela (/sentinela).  
Fica colada logo abaixo da topbar do portal (`top: var(--topo)`).

```html
<header class="appbar" id="appbar">
  <div class="ab-r1">
    <!-- Botão voltar apenas com o glifo ‹ -->
    <a href="/" class="ab-voltar" title="Voltar para a página inicial" aria-label="Voltar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </a>
    
    <!-- Título em 15px -->
    <h1 class="ab-tit">Fechamento Mensal de Estocáveis</h1>

    <!-- Pílula de Contexto: o que está em tela e data -->
    <div class="fonte">
      <span class="fonte-pt"></span>
      <span class="fonte-nome">CD Paiçandu / Amigão</span>
      <span class="fonte-div"></span>
      <span class="fonte-sec">Atualizado em 30/09/2026</span>
    </div>

    <!-- Ações no canto direito -->
    <div class="ab-acoes">
      <button type="button" class="btn-s">Exportar</button>
      <button type="button" class="btn-p">Salvar Fechamento</button>
    </div>
  </div>
</header>
```

```css
.wrap {
  padding-top: 0; /* A barra de app encosta no header do portal */
}

.appbar {
  position: sticky;
  top: var(--topo);
  z-index: 61;
  margin: 0 -24px;
  padding: 12px 24px;
  background: var(--appbar-bg);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--hair);
}

.ab-r1 {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ab-voltar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  text-decoration: none;
  color: var(--muted);
  transition: color 0.2s, background 0.2s;
}

.ab-voltar:hover {
  color: var(--navy);
  background: var(--acento-medio);
}

.ab-voltar svg {
  width: 15px;
  height: 15px;
}

.ab-tit {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.022em;
  white-space: nowrap;
  color: var(--text);
  margin: 0;
}

.fonte {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  border: 1px solid var(--hair);
  background: var(--surface);
  border-radius: var(--pill);
  padding: 6px 14px;
  font-size: 12.5px;
  color: var(--muted);
}

.fonte-pt {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--pos);
  flex-shrink: 0;
}

.fonte-nome {
  color: var(--text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fonte-div {
  width: 1px;
  height: 13px;
  background: var(--hair);
  flex-shrink: 0;
}

.fonte-sec {
  white-space: nowrap;
}

.ab-acoes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .appbar {
    margin: 0 -14px;
    padding: 10px 14px;
  }
  .ab-r1 {
    flex-wrap: wrap;
    gap: 10px 14px;
  }
  .fonte {
    order: 3;
    width: 100%;
  }
}

@media (max-width: 620px) {
  .appbar {
    position: static;
  }
  .ab-acoes {
    width: 100%;
  }
}
```

### 7.2 Barra de Filtros Fixa
Posicionada logo abaixo da barra de app. Como a altura da barra varia com a tela, calcula-se dinamicamente via CSS:

```css
.filtros-bar {
  position: sticky;
  top: calc(var(--topo) + var(--alt-appbar, 55px));
  z-index: 60;
  margin: 0 -24px;
  padding: 10px 24px;
  background: #fff;
  border-bottom: 1px solid var(--brd2);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
```

```javascript
// Medição dinâmica da barra de app no carregamento e no resize:
function atualizarAltAppbar() {
  const appbar = document.getElementById('appbar');
  if (appbar) {
    document.documentElement.style.setProperty('--alt-appbar', appbar.offsetHeight + 'px');
  }
}
window.addEventListener('DOMContentLoaded', atualizarAltAppbar);
window.addEventListener('resize', atualizarAltAppbar);
```

### 7.3 Grid de Indicadores (KPIs)
- **Máximo 3 a 4 KPIs** acima da dobra.
- O card exibe label uppercase (10px) e o valor consolidado (24px peso 800).

```html
<section class="kpi-grid">
  <div class="kpi">
    <div class="kpi-lbl">Total de Estoque</div>
    <div class="kpi-val">R$ 1.449 mil</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Dias Médios</div>
    <div class="kpi-val">34 dias</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">SKUs em Ruptura</div>
    <div class="kpi-val neg">21 SKUs</div>
  </div>
  <div class="kpi">
    <div class="kpi-lbl">Cobertura Atingida</div>
    <div class="kpi-val pos">98.4%</div>
  </div>
</section>
```

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 1.25rem;
}

.kpi {
  background: #fff;
  border: 1px solid var(--brd2);
  border-radius: var(--r);
  padding: 16px;
}

.kpi-lbl {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 6px;
}

.kpi-val {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
}

.kpi-val.pos { color: var(--pos-d); }
.kpi-val.neg { color: var(--neg-d); }
```

### 7.4 Tabela Corporativa (`.tbl-wrap`)
- Tabelas **nunca quebram o layout**: sempre encapsuladas em `.tbl-wrap` com `overflow-x: auto`.
- Header em 10px uppercase com fundo `#F7F9FC`.
- Células com padding de `10px 12px` e hover sutil.

```html
<div class="tbl-wrap">
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Descrição</th>
        <th>Estoque Atual</th>
        <th>Cobertura</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>10429</strong></td>
        <td>Arroz Branco Tipo 1 5kg</td>
        <td>1.450 un</td>
        <td>42 dias</td>
        <td><span class="badge badge-a">Normal</span></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">TOTAL CONSOLIDADO</td>
        <td>14.820 un</td>
        <td>34 dias</td>
        <td>-</td>
      </tr>
    </tfoot>
  </table>
</div>
```

```css
.tbl-wrap {
  overflow-x: auto;
  border-radius: var(--rs);
  border: 1px solid var(--brd2);
  background: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
}

thead th {
  padding: 9px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  background: #F7F9FC;
  border-bottom: 2px solid var(--brd2);
  white-space: nowrap;
}

tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--brd2);
  color: var(--text);
}

tbody tr:hover td {
  background: #F7F9FC;
}

tfoot td {
  padding: 11px 12px;
  border-top: 2px solid var(--brd2);
  font-weight: 800;
  background: var(--card);
}
```

### 7.5 Botões Corporativos
- **Primário (`.btn-p`):** Fundo `--navy` (#00147D), texto branco.
- **Secundário (`.btn-s`):** Fundo branco, contorno `--brd2`.
- **Compacto (`.btn-sm`):** Altura reduzida para ações em linha em tabelas.

```html
<div class="btn-row">
  <button type="button" class="btn-p">Salvar Alterações</button>
  <button type="button" class="btn-s">Cancelar</button>
  <button type="button" class="btn-s btn-sm">Detalhar</button>
</div>
```

```css
.btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Primário */
.btn-p {
  padding: 10px 22px;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: var(--rs);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
}

.btn-p:hover {
  background: var(--navy2);
}

/* Secundário */
.btn-s {
  padding: 10px 16px;
  background: #fff;
  color: var(--text);
  border: 1px solid var(--brd2);
  border-radius: var(--rs);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.btn-s:hover {
  background: var(--card);
  border-color: var(--brd);
}

/* Compacto / Small */
.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--rs);
}
```

### 7.6 Badges e Pills de Status
Utilizados para categorização A/B/C, estados positivo/negativo e contadores:

```html
<span class="badge badge-a">Curva A</span>
<span class="badge badge-b">Curva B</span>
<span class="badge badge-c">Curva C / Ruptura</span>
<span class="badge badge-navy">Oficial</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
}

.badge-a { background: var(--pos-l); color: var(--pos-d); }
.badge-b { background: var(--gold-l); color: var(--gold-d); }
.badge-c { background: var(--neg-l); color: var(--neg-d); }
.badge-navy { background: rgba(0, 20, 125, 0.08); color: var(--navy); }
```

### 7.7 Inputs e Controles de Formulário
```css
input, select, textarea {
  background: var(--card);
  border: 1.5px solid var(--brd);
  border-radius: var(--rs);
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(0, 20, 125, 0.08);
  background: #fff;
}
```

### 7.8 Dropzone de Upload de Arquivos
```html
<div class="drop-zone" id="dropZone" role="button" tabindex="0">
  <div style="font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">
    Importar Planilha de Dados
  </div>
  <div style="font-size: 12px; color: var(--muted);">
    Arraste o arquivo Excel (.xlsx) aqui ou clique para selecionar
  </div>
</div>
```

```css
.drop-zone {
  border: 2px dashed var(--brd);
  border-radius: var(--r);
  padding: 48px 32px;
  text-align: center;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.drop-zone:hover, .drop-zone.over {
  border-color: var(--navy);
  background: rgba(0, 20, 125, 0.04);
}

.drop-zone.done {
  border-color: var(--pos);
  background: var(--pos-l);
}
```

### 7.9 Spinner de Carregamento
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
```

---

## 8. Estados Obrigatórios da Interface

Toda ferramenta desenvolvida no Plurix Hub deve prever os 4 estados essenciais. **Nunca deixe áreas de dados vazias sem contexto explícito.**

### 1. Estado Vazio (`Empty State`)
Apresentado antes do upload de arquivos ou quando filtros retornam 0 itens:
```html
<div class="empty-state">
  <div style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px;">Nenhum registro encontrado</div>
  <div style="font-size: 12.5px; color: var(--muted);">Tente ajustar os filtros selecionados ou importe uma nova base de dados.</div>
</div>
```

### 2. Estado de Carregamento (`Loading State`)
Spinner visível acompanhado de mensagem clara de progresso:
```html
<div class="loading-state">
  <div class="spinner" style="color: var(--navy); margin-bottom: 12px;"></div>
  <div style="font-size: 13px; font-weight: 600; color: var(--text);">Processando informações...</div>
  <div style="font-size: 12px; color: var(--muted);">Consolidando indicadores e faixas de cobertura.</div>
</div>
```

### 3. Estado de Sucesso (`Feedback Toast`)
Confirmação visual temporária ou persistente após ações bem-sucedidas:
> *"Arquivo processado com sucesso. 1.520 SKUs carregados."*

### 4. Estado de Erro (`Error State`)
Mensagem explicativa com direcionamento de como corrigir:
> *"Falha ao processar planilha: a coluna 'Estoque Atual' é obrigatória e não foi encontrada."*

---

## 9. Responsividade e Largura da Página

### Largura Total da Tela (Padrão Hub)
- **Toda ferramenta ocupa a largura total da tela.**  
- **Não usar `max-width` centralizado no container principal (`.wrap`).**
- **Respiro lateral:** `24px` no desktop; `14px` em telas abaixo de `900px`.
- **Barras fixas de ponta a ponta:** A barra de app e a barra de filtros usam margem negativa correspondente ao respiro (`margin: 0 -24px; padding: 12px 24px;`) para encostar perfeitamente nas bordas da tela.
- **Exceção única:** Telas de entrada ou upload isoladas (antes de carregar dados) podem usar `max-width: 600px; margin: 0 auto;` para manter o foco no dropzone.

### Breakpoints Oficiais

```css
/* ==========================================================================
   BREAKPOINTS OFICIAIS PLURIX HUB
   ========================================================================== */

/* Tablet & Telas Médias (<= 900px) */
@media (max-width: 900px) {
  .wrap {
    padding: 1.25rem 14px 3rem;
  }
  .appbar {
    margin: 0 -14px;
    padding: 10px 14px;
  }
  .filtros-bar {
    margin: 0 -14px;
    padding: 10px 14px;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile & Telas Pequenas (<= 620px) */
@media (max-width: 620px) {
  .wrap {
    padding: 0.75rem 14px 2.5rem;
  }
  .appbar {
    position: static;
  }
  .ab-acoes {
    width: 100%;
  }
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .btn-row {
    flex-direction: column;
  }
  .btn-p, .btn-s {
    width: 100%;
    text-align: center;
  }
}
```

---

## 10. Regras Críticas: O Que NUNCA Fazer

1. **NÃO criar CSS em arquivo externo quando a página for servida como view única:** O CSS deve ser consolidado no bloco `<style>` do próprio arquivo HTML.
2. **NÃO usar frameworks CSS externos (Bootstrap, Tailwind, Bulma):** Utilize exclusivamente o design system nativo com CSS vanilla e tokens `:root`.
3. **NÃO hardcodar cores HEX dispersas no código:** Utilize sempre as variáveis correspondentes (`var(--navy)`, `var(--pos)`, `var(--brd2)`, etc.).
4. **NÃO recriar topbar do portal quando a página for envolvida por `withPortalHeader()` no servidor.**
5. **NÃO deixar regras de negócio pesadas no frontend:** Lógica analítica complexa deve residir na camada de serviços do backend (`src/services/`).
6. **NÃO deixar `console.log` em código final de produção.**
7. **NÃO exibir mais de 4 KPIs acima da dobra de visualização.**
8. **NÃO deixar tabelas sem container `.tbl-wrap` (evita quebra horizontal de tela no mobile).**

---

## 11. Decisões Automáticas de Design

Sempre que uma especificação de interface não explicitar uma decisão, adote automaticamente:

| Cenário | Decisão Padrão Obrigatória |
|---|---|
| **Largura de tela** | Largura total (`max-width: none`), com padding lateral de `24px` |
| **Apresentação de Indicadores** | `.kpi-grid` com cards limpos (fundo branco, borda `--brd2`) |
| **Listagens e Dados** | Tabela estruturada em `.tbl-wrap` com `thead` uppercase |
| **Agrupamentos de conteúdo** | Cards individuais com padding de `1.25rem` e border-radius `12px` |
| **Filtros e Controles** | Barra fixa sticky posicionada imediatamente acima do conteúdo |
| **Ações principais** | Botão primário `.btn-p` destacado no canto superior direito |
| **Conflito densidade vs. clareza** | Escolha sempre **mais clareza e legibilidade** |

---

## 12. Boilerplate HTML Padrão do Plurix Hub

Estrutura canônica recomendada para a criação de novas ferramentas:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Nome da Ferramenta] — Plurix Hub</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      /* Brand */
      --navy: #00147D;
      --navy2: #001db3;

      /* Semânticas */
      --pos: #10B981;  --pos-l: rgba(16,185,129,.1);  --pos-d: #047857;
      --neg: #dc2626;  --neg-l: rgba(220,38,38,.1);   --neg-d: #A32D2D;
      --gold: #F59E0B; --gold-l: rgba(245,158,11,.1);  --gold-d: #92400e;

      /* Superfícies */
      --bg: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
      --card: #F4FAFE;
      --surface: #FFFFFF;
      --brd: #B8D8E8;
      --brd2: #E8EDF2;

      /* Texto */
      --text: #1A2A38;
      --muted: #7A90A0;

      /* Bordas */
      --r: 12px;
      --rs: 8px;
      --pill: 980px;

      /* Auxiliares da barra de app */
      --hair: rgba(26,42,56,.08);
      --topo: 60px;
      --acento-medio: rgba(0,20,125,.07);
      --appbar-bg: rgba(248,250,252,.86);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* Container de largura total */
    .wrap {
      max-width: none;
      margin: 0;
      padding: 0 24px 4rem 24px;
    }

    /* Barra de App Fixa */
    .appbar {
      position: sticky;
      top: var(--topo);
      z-index: 61;
      margin: 0 -24px 1.5rem -24px;
      padding: 12px 24px;
      background: var(--appbar-bg);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      backdrop-filter: saturate(180%) blur(20px);
      border-bottom: 1px solid var(--hair);
    }

    .ab-r1 {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .ab-voltar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      text-decoration: none;
      color: var(--muted);
      transition: color .2s, background .2s;
    }
    .ab-voltar:hover { color: var(--navy); background: var(--acento-medio); }
    .ab-voltar svg { width: 15px; height: 15px; }

    .ab-tit {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -.022em;
      white-space: nowrap;
    }

    .fonte {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--hair);
      background: var(--surface);
      border-radius: var(--pill);
      padding: 6px 14px;
      font-size: 12.5px;
      color: var(--muted);
    }
    .fonte-pt { width: 6px; height: 6px; border-radius: 50%; background: var(--pos); }
    .fonte-nome { color: var(--text); font-weight: 500; }
    .fonte-div { width: 1px; height: 13px; background: var(--hair); }

    .ab-acoes {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    /* Componentes */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 1.25rem; }
    .kpi { background: #fff; border: 1px solid var(--brd2); border-radius: var(--r); padding: 16px; }
    .kpi-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 6px; }
    .kpi-val { font-size: 24px; font-weight: 800; color: var(--text); }

    .btn-p { padding: 10px 22px; background: var(--navy); color: #fff; border: none; border-radius: var(--rs); font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .btn-p:hover { background: var(--navy2); }
    .btn-s { padding: 10px 16px; background: #fff; color: var(--text); border: 1px solid var(--brd2); border-radius: var(--rs); font-size: 13px; cursor: pointer; font-family: inherit; }
    .btn-s:hover { background: var(--card); }

    .tbl-wrap { overflow-x: auto; border-radius: var(--rs); border: 1px solid var(--brd2); background: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); background: #F7F9FC; border-bottom: 2px solid var(--brd2); }
    tbody td { padding: 10px 12px; border-bottom: 1px solid var(--brd2); }
    tbody tr:hover td { background: #F7F9FC; }

    /* Responsividade */
    @media(max-width:900px){
      .wrap { padding: 0 14px 3rem 14px; }
      .appbar { margin: 0 -14px 1rem -14px; padding: 10px 14px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media(max-width:620px){
      .appbar { position: static; }
      .ab-acoes { width: 100%; }
      .kpi-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Barra de App -->
  <header class="appbar" id="appbar">
    <div class="ab-r1">
      <a href="/" class="ab-voltar" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </a>
      <h1 class="ab-tit">[Nome da Ferramenta]</h1>
      <div class="fonte">
        <span class="fonte-pt"></span>
        <span class="fonte-nome">[Base Ativa]</span>
        <span class="fonte-div"></span>
        <span class="fonte-sec">Atualizado recentemente</span>
      </div>
      <div class="ab-acoes">
        <button type="button" class="btn-s">Exportar</button>
        <button type="button" class="btn-p">Ação Principal</button>
      </div>
    </div>
  </header>

  <main class="wrap">
    <!-- Grid de KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi-lbl">Indicador 1</div>
        <div class="kpi-val">0</div>
      </div>
      <div class="kpi">
        <div class="kpi-lbl">Indicador 2</div>
        <div class="kpi-val">0</div>
      </div>
    </section>

    <!-- Tabela Principal -->
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Coluna 1</th>
            <th>Coluna 2</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dado de Exemplo</td>
            <td>R$ 100,00</td>
            <td><button type="button" class="btn-s" style="padding: 4px 8px; font-size: 11px;">Editar</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

</body>
</html>
```

---

## 13. Checklist de Validação Pré-Entrega

Antes de finalizar qualquer nova tela ou componente, verifique:

- [ ] Declarou todos os tokens oficiais no `:root` (`--navy`, `--pos`, `--neg`, `--card`, `--brd2`, etc.)?
- [ ] Utilizou a tipografia oficial (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)?
- [ ] O botão Voltar possui apenas o ícone `‹` (sem a palavra "Voltar")?
- [ ] A tela segue a hierarquia: **Barra de app → Filtros → KPIs → Conteúdo principal → Detalhamento**?
- [ ] Não há bloco de abertura redundante (com h1 gigante ou descrição) em telas operacionais?
- [ ] O grid de KPIs possui no máximo **3 a 4 indicadores** acima da dobra?
- [ ] As tabelas estão obrigatoriamente encapsuladas em `.tbl-wrap` com `overflow-x: auto`?
- [ ] Estão implementados os 4 estados: **Vazio**, **Carregamento (Spinner)**, **Erro** e **Sucesso**?
- [ ] O layout ocupa **largura total** (`.wrap` sem `max-width`), com respiro lateral de `24px` (ou `14px` em tablet/mobile)?
- [ ] A interface foi testada e funciona perfeitamente em **Desktop**, **Tablet (900px)** e **Mobile (620px)**?
- [ ] Não há cores HEX hardcoded dispersas fora dos tokens do sistema?
- [ ] O código CSS está consolidado sem dependência de bibliotecas externas (Tailwind, Bootstrap)?
