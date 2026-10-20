import { jsPDF } from 'jspdf';

interface GeneratePdfOptions {
  title?: string;
  topic?: string;
  markdownContent: string;
  sources?: { title: string; url: string }[];
}

/**
 * PALETA OFICIAL PLURIX DESIGN SYSTEM (100% Alinhada ao Plurix Hub)
 * Zero preto escuro (#0B1938) e zero laranja agressivo (#EA580C).
 */
const C = {
  // Cores Primárias da Marca Plurix
  plurixNavy: [0, 20, 125] as [number, number, number],      // #00147D - Cor Institucional Principal Plurix
  plurixRoyal: [0, 45, 156] as [number, number, number],     // #002D9C - Azul Royal Plurix
  plurixSky: [2, 132, 199] as [number, number, number],       // #0284C7 - Azul de Acento / Indicadores
  plurixCyan: [14, 165, 233] as [number, number, number],     // #0EA5E9 - Destaque Luminoso
  plurixIce: [244, 250, 254] as [number, number, number],     // #F4FAFE - Fundo de Cards Plurix
  plurixBorder: [216, 227, 233] as [number, number, number],  // #D8E3E9 - Borda Suave Plurix

  // Semânticas Corporativas Elegantes
  emerald: [16, 185, 129] as [number, number, number],       // #10B981 - Alívio / Favorável / Ganhos
  emeraldBg: [236, 253, 245] as [number, number, number],     // #ECFDF5
  amber: [217, 119, 6] as [number, number, number],           // #D97706 - Atenção / Gordura / Gap
  amberBg: [255, 251, 235] as [number, number, number],       // #FFFBEB
  coral: [220, 38, 38] as [number, number, number],           // #DC2626 - Risco / Pressão de Custo
  coralBg: [254, 242, 242] as [number, number, number],       // #FEF2F2

  // Tipografia e Superfícies Neutras
  textPrimary: [30, 41, 59] as [number, number, number],      // #1E293B - Texto Escuro Principal
  textSecondary: [71, 85, 105] as [number, number, number],   // #475569 - Texto Secundário
  textMuted: [100, 116, 139] as [number, number, number],     // #64748B - Muted / Legendas
  surfaceWhite: [255, 255, 255] as [number, number, number],  // #FFFFFF
  borderDivider: [226, 232, 240] as [number, number, number], // #E2E8F0
  rowAlt: [248, 250, 252] as [number, number, number],        // #F8FAFC
};

/**
 * Sanitiza textos removendo emojis e caracteres Unicode não suportados pela fonte nativa do PDF
 * para evitar quebras de codificação (como "%¸" ou caracteres corrompidos).
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[^\x00-\x7F\xC0-\xFF]/g, ' ') // Mantém apenas ASCII e caracteres latinos acentuados
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai o tópico limpo garantindo que saudações não virem o título.
 */
function extractCleanTopic(topic?: string, markdown?: string): string {
  if (markdown) {
    const headerMatch = markdown.match(/#\s*(?:BOLETIM|Boletim)[^—\n]*[—\-:]\s*([^\n]+)/i);
    if (headerMatch && headerMatch[1]) {
      const candidate = headerMatch[1].replace(/[*#]/g, '').trim();
      if (!/bom dia|boa tarde|ol[aá]|tudo bem|oi\b/i.test(candidate)) {
        return candidate;
      }
    }
  }

  if (topic && !/bom dia|boa tarde|ol[aá]|tudo bem|oi\b/i.test(topic)) {
    return topic.replace(/^boletim\s*(de)?\s*(mercado|intelig[êe]ncia)?\s*:?/i, '').trim();
  }

  return 'Sacolinha de supermercado';
}

/**
 * Gerador Oficial do Boletim Executivo de Inteligência de Custos (9 Páginas com Gráficos Vetoriais).
 * 100% no Design System Plurix e preenchimento vertical balanceado sem espaços vazios.
 */
export function generateBulletinPdf({
  title,
  topic,
  markdownContent,
  sources = [],
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm

  const cleanTopic = extractCleanTopic(topic, markdownContent);

  // Helper para desenhar o cabeçalho padrão das páginas 2 a 9
  const drawPageHeader = (pageNum: number) => {
    // Logo / Nome Plurix
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.plurixNavy);
    doc.text('PLURIX  ·  COMPRAS INDIRETAS', margin, 12);

    // Tópico e Período
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${cleanTopic} · Outubro 2026`, margin + contentWidth, 12, { align: 'right' });

    // Linha divisória suave
    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.35);
    doc.line(margin, 15, margin + contentWidth, 15);
  };

  // Helper para desenhar o rodapé padrão das páginas 2 a 9
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(...C.borderDivider);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.textMuted);
    doc.text('Uso interno e confidencial · Rede Plurix · Inteligência Econômica', margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de 9`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  };

  // =========================================================================
  // PÁGINA 1: CAPA EXECUTIVA 100% PLURIX (Preenchimento Total da Página A4)
  // =========================================================================

  // Fundo Total em Azul Plurix (#00147D) - Cobre toda a altura (297mm)
  doc.setFillColor(...C.plurixNavy);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Grafismo sutil de fundo Plurix (Faixa superior ligeiramente mais clara)
  doc.setFillColor(...C.plurixRoyal);
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Identidade Superior Plurix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('P L U R I X   ·   C O M P R A S   I N D I R E T A S', margin, 24);

  // Pílula Oficial do Boletim
  doc.setFillColor(...C.plurixSky);
  doc.roundedRect(margin, 30, 80, 7.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BOLETIM DE INTELIGÊNCIA DE CUSTOS', margin + 5, 35.2);

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanTopic, margin, 78);

  // Subtítulo Executivo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240); // #E2E8F0
  const coverSub = doc.splitTextToSize(
    'Auditoria de custos, Should-Cost determinístico, decomposição de drivers e estratégia de negociação para a demanda consolidada de todas as lojas e operações da rede Plurix.',
    contentWidth
  );
  doc.text(coverSub, margin, 90);

  // Linha de Acento Plurix Sky
  doc.setFillColor(...C.plurixSky);
  doc.rect(margin, 108, 45, 2, 'F');

  // -------------------------------------------------------------------------
  // 3 Big Stat Cards (Preenchimento y = 118 a 170)
  // -------------------------------------------------------------------------
  const statCardY = 118;
  const statCardW = (contentWidth - 12) / 3;
  const statCardH = 48;

  // Stat Card 1: Reajuste Teórico (21,1%)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.plurixSky);
  doc.rect(margin, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...C.plurixNavy);
  doc.text('21,1%', margin + 5, statCardY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Reajuste Teórico', margin + 5, statCardY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Should-Cost ponderado', margin + 5, statCardY + 33);
  doc.text('acumulado em 12 meses', margin + 5, statCardY + 39);

  // Stat Card 2: Gordura / Gap (6,9 p.p.)
  const stat2X = margin + statCardW + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(stat2X, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.amber);
  doc.rect(stat2X, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...C.amber);
  doc.text('6,9 p.p.', stat2X + 5, statCardY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Espaço de Negociação', stat2X + 5, statCardY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Gordura do pleito inicial', stat2X + 5, statCardY + 33);
  doc.text('(28,0% - 21,1% auditado)', stat2X + 5, statCardY + 39);

  // Stat Card 3: Projeção 12m (-2,0%)
  const stat3X = margin + (statCardW + 6) * 2;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(stat3X, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.emerald);
  doc.rect(stat3X, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...C.emerald);
  doc.text('-2,0%', stat3X + 5, statCardY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Tendência a 12 Meses', stat3X + 5, statCardY + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Expectativa de alívio', stat3X + 5, statCardY + 33);
  doc.text('após normalização do ciclo', stat3X + 5, statCardY + 39);

  // -------------------------------------------------------------------------
  // Painel de Metadados Executivos da Categoria (Preenchimento y = 178 a 245)
  // -------------------------------------------------------------------------
  const metaY = 178;
  const metaH = 68;

  // Box translúcido com borda suave
  doc.setFillColor(...C.plurixRoyal);
  doc.roundedRect(margin, metaY, contentWidth, metaH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('PARÂMETROS DA OPERAÇÃO · REDE PLURIX', margin + 8, metaY + 9);

  // 4 Quadrantes de Metadados
  const tileW = (contentWidth - 24) / 2;
  const tileH = 22;

  // Tile 1: Escopo e Categoria
  const t1X = margin + 8;
  const t1Y = metaY + 14;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(t1X, t1Y, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('CATEGORIA & ITEM', t1X + 4, t1Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Sacola Camiseta PEAD 30x40 cm (1 cor)', t1X + 4, t1Y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Uso geral em caixas e atendimento de loja', t1X + 4, t1Y + 17);

  // Tile 2: Demanda e Fornecimento
  const t2X = margin + 8 + tileW + 8;
  const t2Y = metaY + 14;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(t2X, t2Y, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('ESCOPO & HOMOLOGAÇÃO', t2X + 4, t2Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Volume Consolidado Rede Plurix', t2X + 4, t2Y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Fornecedores transformadores homologados PR/SP', t2X + 4, t2Y + 17);

  // Tile 3: Metodologia Econômica
  const t3Y = metaY + 40;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(t1X, t3Y, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('METODOLOGIA APLICADA', t1X + 4, t3Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Should-Cost Determinístico (6 Drivers)', t1X + 4, t3Y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Base auditada: Petróleo, PEAD, Copel, Diesel, INPC', t1X + 4, t3Y + 17);

  // Tile 4: Vigência Contratual
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(t2X, t3Y, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('RECOMENDAÇÃO CONTRATUAL', t2X + 4, t3Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Contrato de 6 meses c/ Fórmula', t2X + 4, t3Y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Revisão trimestral indexada à variação da resina', t2X + 4, t3Y + 17);

  // -------------------------------------------------------------------------
  // Rodapé da Capa (Preenchimento y = 255 a 285)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'Nota de Governança: Este documento consolida inteligência econômica para apoio exclusivo à mesa de negociação de Compras Indiretas da Plurix.',
    margin,
    260
  );
  doc.text(
    'A decisão final e aprovação segue rigorosamente a política corporativa de alçadas da rede Plurix.',
    margin,
    264
  );

  doc.setDrawColor(...C.plurixSky);
  doc.setLineWidth(0.4);
  doc.line(margin, 272, margin + contentWidth, 272);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Edição Executiva · Outubro de 2026', margin, 278);
  doc.text('Fontes Primárias Auditadas · v2.0 Plurix', margin + contentWidth, 278, { align: 'right' });

  // =========================================================================
  // PÁGINA 2: 01 · RESUMO EXECUTIVO (Preenchimento Balanceado da Página)
  // =========================================================================
  doc.addPage();
  drawPageHeader(2);

  let y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('01 · RESUMO EXECUTIVO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  const headline = 'O custo da sacolinha subiu 21,1% em 12 meses; o pleito de 28% fixo embute 6,9 p.p. de margem';
  const headlineLines = doc.splitTextToSize(headline, contentWidth);
  doc.text(headlineLines, margin, y);
  y += headlineLines.length * 5 + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.textSecondary);
  const introP = doc.splitTextToSize(
    'A alta do custo decorre da disparada da resina PEAD (+30% em R$) e da tarifa industrial de energia Copel (+21,9%), não da inflação geral (IPCA em 4,2%). Para os próximos 12 meses, as projeções do Banco Mundial apontam alívio no petróleo (Brent a US$ 90/bbl). Portanto, o preço deve acompanhar o custo por fórmula paramétrica com revisão trimestral, e jamais ficar travado no pico.',
    contentWidth
  );
  doc.text(introP, margin, y);
  y += introP.length * 3.8 + 5;

  // Banner de RECOMENDAÇÃO em Azul Plurix
  const recH = 34;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin, y, contentWidth, recH, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('DIRETRIZ ESTRATÉGICA PARA O COMPRADOR', margin + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Conceder no máximo o reajuste teórico de 21,1%, atrelado a fórmula paramétrica com', margin + 6, y + 12);
  doc.text('revisão trimestral e vigência de 6 meses — recusando peremptoriamente o reajuste fixo de 28%.', margin + 6, y + 16.5);

  // 3 Mini-boxes de recomendação
  const miniW = (contentWidth - 20) / 3;
  const miniY = y + 20;

  // Mini 1: Timing
  doc.setFillColor(...C.plurixRoyal);
  doc.roundedRect(margin + 4, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('Timing de Fechamento', margin + 7, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Fechar após janela de volatilidade (fim de out)', margin + 7, miniY + 7.5);

  // Mini 2: Formato
  doc.setFillColor(...C.plurixRoyal);
  doc.roundedRect(margin + 4 + miniW + 4, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('Estrutura Contratual', margin + 4 + miniW + 7, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('6 meses, gatilho de reajuste ±5%', margin + 4 + miniW + 7, miniY + 7.5);

  // Mini 3: Tendência
  doc.setFillColor(...C.plurixRoyal);
  doc.roundedRect(margin + 4 + (miniW + 4) * 2, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('Tendência de Médio Prazo', margin + 4 + (miniW + 4) * 2 + 3, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Alta já precificada; alívio de -2,0% à frente', margin + 4 + (miniW + 4) * 2 + 3, miniY + 7.5);

  y += recH + 6;

  // 4 Cards de KPIs em Linha (altura 28mm)
  const kpiW = (contentWidth - 9) / 4;
  const kpiH = 28;

  const kpis = [
    { label: 'RESINA PEAD (12M)', val: '+30,0%', desc: 'Estimativa em R$; choque Oriente Médio', valColor: C.coral },
    { label: 'SHOULD-COST REAL', val: '21,1%', desc: 'Variação teórica auditada do custo', valColor: C.plurixNavy },
    { label: 'PEDIDO FORNECEDOR', val: '28,0%', desc: 'Pleito inicial com margem inflada', valColor: C.textPrimary },
    { label: 'GAP DE NEGOCIAÇÃO', val: '6,9 p.p.', desc: 'Gordura a expurgar da mesa', valColor: C.amber },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = margin + idx * (kpiW + 3);
    doc.setFillColor(...C.plurixIce);
    doc.setDrawColor(...C.plurixBorder);
    doc.roundedRect(kx, y, kpiW, kpiH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(kpi.label, kx + 3.5, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(...kpi.valColor);
    doc.text(kpi.val, kx + 3.5, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...C.textSecondary);
    const descLines = doc.splitTextToSize(kpi.desc, kpiW - 7);
    doc.text(descLines, kx + 3.5, y + 21.5);
  });

  y += kpiH + 6;

  // 3 Colunas: "Três argumentos chave para levar à mesa" (altura 38mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('Três argumentos com dados na ponta da língua para a mesa', margin, y);
  y += 4.5;

  const mesaColW = (contentWidth - 8) / 3;
  const mesaH = 38;
  const mesaCards = [
    {
      title: '1. Resina explica 18 dos 21 p.p.',
      text: 'A resina representa 60% do custo e subiu 30%. Energia, frete, mão de obra e aditivos somam apenas 3,1 p.p. de impacto. Os outros 40% da estrutura não justificam repasse de 28%.',
      borderC: C.plurixSky,
    },
    {
      title: '2. O pico da resina é temporário',
      text: 'A resina subiu forte no choque inicial e depois estabilizou. Travar contrato por 12 meses no patamar atual significa que a Plurix pagará o topo histórico enquanto o mercado arrefece.',
      borderC: C.amber,
    },
    {
      title: '3. Volume consolidado Plurix',
      text: 'A demanda unificada de toda a rede Plurix oferece ao transformador escala, previsibilidade e ocupação de fábrica em troca do reajuste justo indexado à fórmula.',
      borderC: C.plurixNavy,
    },
  ];

  mesaCards.forEach((mc, idx) => {
    const mx = margin + idx * (mesaColW + 4);
    doc.setFillColor(...C.surfaceWhite);
    doc.setDrawColor(...C.plurixBorder);
    doc.roundedRect(mx, y, mesaColW, mesaH, 2, 2, 'FD');

    // Acento lateral no Design System Plurix
    doc.setFillColor(...mc.borderC);
    doc.rect(mx, y, 2.5, mesaH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.plurixNavy);
    doc.text(mc.title, mx + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textSecondary);
    const bodyLines = doc.splitTextToSize(mc.text, mesaColW - 8);
    doc.text(bodyLines, mx + 5, y + 13);
  });

  y += mesaH + 6;

  // Box de Mandato & Balizas de Negociação Plurix (Preenchimento y = 185 a 275)
  const mandateH = 46;
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, mandateH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('MANDATO E BALIZAS DE NEGOCIAÇÃO · COMPRAS INDIRETAS PLURIX', margin + 6, y + 6.5);

  // Tabela interna do mandato
  const manCols = [36, 26, 110];
  const manY = y + 10;
  const manRows = [
    { b: 'Meta Should-Cost', v: '21,1%', desc: 'Alvo principal do comprador. Reflete exatamente os custos reais auditados.' },
    { b: 'Piso Aceitável', v: '18,0%', desc: 'Abertura agressiva na mesa, expurgando integralmente margem e overhead.' },
    { b: 'Teto Máximo Autorizado', v: '23,0%', desc: 'Limite estrito de fechamento, condicionado a prazo estendido (120 dias) e volume.' },
    { b: 'Estrutura do Acordo', v: '6 meses', desc: 'Contrato curto com fórmula paramétrica e gatilho de revisão de ±5%.' },
  ];

  manRows.forEach((mr, rIdx) => {
    const ry = manY + rIdx * 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.plurixNavy);
    doc.text(mr.b, margin + 6, ry + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...(rIdx === 0 ? C.plurixSky : rIdx === 1 ? C.emerald : C.textPrimary));
    doc.text(mr.v, margin + 6 + manCols[0], ry + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textSecondary);
    doc.text(mr.desc, margin + 6 + manCols[0] + manCols[1], ry + 4.5);

    if (rIdx < 3) {
      doc.setDrawColor(...C.borderDivider);
      doc.setLineWidth(0.2);
      doc.line(margin + 6, ry + 7.5, margin + contentWidth - 6, ry + 7.5);
    }
  });

  drawPageFooter(2);

  // =========================================================================
  // PÁGINA 3: 02 · MERCADO E CADEIA DE VALOR (Preenchimento Balanceado)
  // =========================================================================
  doc.addPage();
  drawPageHeader(3);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('02 · MERCADO E CADEIA DE VALOR', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  const mktHeadline = 'A resina deriva de mercado concentrado e protegido; o transformador repassa e tenta inflar';
  doc.text(doc.splitTextToSize(mktHeadline, contentWidth), margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.textSecondary);
  const mktText = doc.splitTextToSize(
    'A sacolinha plástica é filme soprado de PEAD, processado por transformadores regionais homologados. Como a resina representa de 55% a 65% do custo do fabricante, o transformador busca repassar a alta integral sobre o preço final em vez de sobre a matéria-prima, inflando sua margem em reais.',
    contentWidth
  );
  doc.text(mktText, margin, y);
  y += mktText.length * 3.8 + 6;

  // Tabela da Cadeia de Valor (5 Elos)
  const chainCols = [32, 86, 60];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('ELO DA CADEIA', margin + 3, y + 5);
  doc.text('SITUAÇÃO DO MERCADO EM 2026', margin + 35, y + 5);
  doc.text('IMPACTO PARA A REDE PLURIX', margin + 121, y + 5);
  y += 7.5;

  const chainRows = [
    {
      elo: 'Petróleo e Nafta',
      sit: 'Brent saiu de US$ 72 para picos de US$ 120 e estabilizou em US$ 104,13/bbl; nafta latino-americana subiu ~48%.',
      efeito: 'Custo de base da matéria-prima disparou globalmente.',
    },
    {
      elo: 'Resina PEAD (Braskem)',
      sit: 'Principal produtora nacional aplicou +R$ 8.000/t em duas parcelas, restringindo cotas a 35% do pedido.',
      efeito: 'Repasse quase imediato para os transformadores regionais.',
    },
    {
      elo: 'Importação / Tarifa',
      sit: 'Antidumping definitivo de US$ 199/t (EUA) e US$ 238/t (Canadá) em vigor por 5 anos (Camex).',
      efeito: 'Resina importada chega mais cara; menor pressão concorrencial.',
    },
    {
      elo: 'Transformador Plástico',
      sit: 'Margens operacionais comprimidas pelo aumento do giro de capital de giro e insumos.',
      efeito: 'Tenta aplicar 28% no preço cheio para recompor margens antigas.',
    },
    {
      elo: 'Varejo (Rede Plurix)',
      sit: 'Consumo massivo e previsível de sacolas; item de alta criticidade operacional nos caixas.',
      efeito: 'Poder de barganha expressivo ao unificar a demanda da rede.',
    },
  ];

  chainRows.forEach((row, rIdx) => {
    const sitLines = doc.splitTextToSize(row.sit, chainCols[1] - 5);
    const efeitoLines = doc.splitTextToSize(row.efeito, chainCols[2] - 5);
    const maxL = Math.max(sitLines.length, efeitoLines.length, 1);
    const rowH = Math.max(13, maxL * 3.8 + 4);

    doc.setFillColor(...(rIdx % 2 === 0 ? C.surfaceWhite : C.plurixIce));
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.plurixNavy);
    doc.text(row.elo, margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textSecondary);
    doc.text(sitLines, margin + 35, y + 4.5);
    doc.text(efeitoLines, margin + 121, y + 4.5);

    y += rowH;
  });

  y += 7;

  // 2 Cards Estratégicos de Apoio à Análise (y = 155 a 210)
  const cardW2 = (contentWidth - 6) / 2;
  const cardH2 = 42;

  // Card 1: Risco Braskem & Antidumping
  doc.setFillColor(...C.surfaceWhite);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, cardW2, cardH2, 2, 2, 'FD');
  doc.setFillColor(...C.coral);
  doc.rect(margin, y, 2.5, cardH2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.coral);
  doc.text('ALERTA: REESTRUTURAÇÃO BRASKEM', margin + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textSecondary);
  const braskemDetail = doc.splitTextToSize(
    'A Braskem reestruturou US$ 3,7 bi em dívidas e protocolou recuperação extrajudicial. Esse cenário congela expansões de capacidade no curto prazo e sustenta postura de preços defensiva no Brasil. Além disso, as alíquotas antidumping da Camex restringem importações baratas dos EUA e Canadá.',
    cardW2 - 9
  );
  doc.text(braskemDetail, margin + 5, y + 12.5);

  // Card 2: Alavanca de Escala Plurix
  const c2X = margin + cardW2 + 6;
  doc.setFillColor(...C.surfaceWhite);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(c2X, y, cardW2, cardH2, 2, 2, 'FD');
  doc.setFillColor(...C.plurixNavy);
  doc.rect(c2X, y, 2.5, cardH2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('ALAVANCA: ESCALA DA REDE PLURIX', c2X + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textSecondary);
  const escalaDetail = doc.splitTextToSize(
    'O transformador opera com margem estreita e depende de volume constante para diluir custo fixo de extrusão. A demanda centralizada de toda a rede Plurix garante ocupação de máquina previsível. Se o fornecedor recusar a fórmula paramétrica de 21,1%, a transferência para outro homologado é rápida e viável.',
    cardW2 - 9
  );
  doc.text(escalaDetail, c2X + 5, y + 12.5);

  y += cardH2 + 7;

  // Painel de Indicadores de Mercado (Preenchimento y = 217 a 275)
  const mktIndH = 48;
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, mktIndH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('INDICADORES DE MERCADO E MATÉRIAS-PRIMAS · OUTUBRO 2026', margin + 6, y + 6.5);

  const mktIndCols = [45, 30, 30, 67];
  const mktIndRows = [
    { ind: 'Petróleo Brent Spot (ICE)', val: 'US$ 104,13/bbl', var: '+44,6% no ano', ref: 'Reuters / O Tempo · Pressão geopolítica' },
    { ind: 'Resina PEAD Filme (Braskem)', val: 'R$ 8.000/t aumento', var: '+30,0% em R$', ref: 'PlásticoNews / SIMPEP · Reajuste interno' },
    { ind: 'Tarifa Copel Alta Tensão', val: 'Homologada Aneel', var: '+21,9% 12m', ref: 'Aneel / Copel · Reajuste tarifário' },
    { ind: 'Diesel S10 Médio Brasil (ANP)', val: 'R$ 6,04/litro', var: '+20,5% acumulado', ref: 'ANP Painel Dinâmico · Custo de frete' },
  ];

  mktIndRows.forEach((mi, idx) => {
    const iy = y + 11 + idx * 8.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.textPrimary);
    doc.text(mi.ind, margin + 6, iy + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.plurixNavy);
    doc.text(mi.val, margin + 6 + mktIndCols[0], iy + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...(mi.var.includes('+') ? C.coral : C.emerald));
    doc.text(mi.var, margin + 6 + mktIndCols[0] + mktIndCols[1], iy + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(mi.ref, margin + 6 + mktIndCols[0] + mktIndCols[1] + mktIndCols[2], iy + 4.5);

    if (idx < 3) {
      doc.setDrawColor(...C.borderDivider);
      doc.setLineWidth(0.2);
      doc.line(margin + 6, iy + 7.5, margin + contentWidth - 6, iy + 7.5);
    }
  });

  drawPageFooter(3);

  // =========================================================================
  // PÁGINA 4: 03 · COMPOSIÇÃO DE CUSTO & 04 · DRIVERS (Gráficos 1 e 2)
  // =========================================================================
  doc.addPage();
  drawPageHeader(4);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('03 · COMPOSIÇÃO DE CUSTO & 04 · DRIVERS', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Resina e energia concentram 67% do peso e explicam 92% da alta total', margin, y);
  y += 9;

  // -------------------------------------------------------------------------
  // GRÁFICO 1: BARRAS HORIZONTAIS DE COMPOSIÇÃO (%)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('GRÁFICO 1: ESTRUTURA DE CUSTO DA SACOLA PLÁSTICA (%)', margin, y);
  y += 5;

  const compData = [
    { name: 'Resina PEAD (Matéria-prima)', desc: 'Braskem / ICIS / Petróleo', pct: 60, color: C.plurixNavy },
    { name: 'Overhead e Margem Fornecedor', desc: 'Custos fixos e depreciação', pct: 14, color: C.textMuted },
    { name: 'Mão de Obra Industrial', desc: 'Dissídio e encargos setor plástico', pct: 9, color: C.plurixSky },
    { name: 'Energia Elétrica (Extrusão)', desc: 'Copel Alta Tensão industrial', pct: 7, color: C.plurixRoyal },
    { name: 'Aditivos e Masterbatch', desc: 'Pigmentos e estabilizantes', pct: 5, color: C.plurixCyan },
    { name: 'Frete e Logística de Entrega', desc: 'Diesel S10 ANP e pedágios', pct: 5, color: [148, 163, 184] as [number, number, number] },
  ];

  const maxBarW = 105;
  compData.forEach((cd) => {
    const barW = (cd.pct / 60) * maxBarW;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.textPrimary);
    doc.text(cd.name, margin, y + 4.5);

    // Barra vetorial Plurix
    doc.setFillColor(...cd.color);
    doc.roundedRect(margin + 58, y, barW, 6.5, 1, 1, 'F');

    // Valor percentual
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.plurixNavy);
    doc.text(`${cd.pct}%`, margin + 62 + barW, y + 4.8);

    y += 8.5;
  });

  y += 4;

  // -------------------------------------------------------------------------
  // GRÁFICO 2: BARRAS HORIZONTAIS DE VARIAÇÃO DOS DRIVERS EM 12 MESES (%)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('GRÁFICO 2: VARIAÇÃO DOS DRIVERS EM 12 MESES VS. IPCA (4,2%)', margin, y);
  y += 5;

  const driverData = [
    { name: 'Resina PEAD em R$', val: '+30,0%', num: 30.0, color: C.coral },
    { name: 'Energia Elétrica Copel', val: '+21,9%', num: 21.9, color: C.coral },
    { name: 'Diesel S10 ANP (Frete)', val: '+20,5%', num: 20.5, color: C.coral },
    { name: 'IPCA 12m (Referência)', val: '+4,2%', num: 4.2, color: C.amber },
    { name: 'Aditivos & Pigmentos', val: '+4,2%', num: 4.2, color: C.plurixSky },
    { name: 'Mão de Obra (INPC)', val: '+4,0%', num: 4.0, color: C.plurixSky },
    { name: 'Overhead / Margem', val: '0,0%', num: 0.0, color: C.textMuted },
  ];

  const maxVarW = 100;
  const maxVarVal = 35;
  const varStartX = margin + 58;

  // Linha vertical do IPCA (4,2%) como benchmark
  const ipcaX = varStartX + (4.2 / maxVarVal) * maxVarW;
  doc.setDrawColor(...C.amber);
  doc.setLineWidth(0.4);
  doc.line(ipcaX, y, ipcaX, y + driverData.length * 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...C.amber);
  doc.text('Linha IPCA (4,2%)', ipcaX + 2, y + 2.5);

  driverData.forEach((dd) => {
    const barW = (dd.num / maxVarVal) * maxVarW;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.textPrimary);
    doc.text(dd.name, margin, y + 4.5);

    if (barW > 0) {
      doc.setFillColor(...dd.color);
      doc.roundedRect(varStartX, y, barW, 6, 1, 1, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...dd.color);
    doc.text(dd.val, varStartX + barW + 3, y + 4.5);

    y += 8.5;
  });

  y += 6;

  // Painel de Conclusão Analítica de Drivers (Preenchimento y = 205 a 275)
  const conclH = 56;
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, conclH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('ANÁLISE DE DISPERSÃO E CONCLUSÃO DOS DRIVERS', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.textSecondary);
  const driverInsight = doc.splitTextToSize(
    '1. Descolamento Estrutural: A resina (+30%) e a energia elétrica (+21,9%) descolaram expressivamente dos índices gerais de inflação (IPCA de 4,2%), legitimando um reajuste de dois dígitos no Should-Cost.\n\n' +
    '2. Onde o Fornecedor Infla: Para alcançar os 28% pedidos, o fornecedor está aplicando os +30% da resina sobre o preço de venda integral da sacolinha, gerando ganho indevido em reais sobre overhead e margem operacional.\n\n' +
    '3. Proteção Contratual: A fórmula paramétrica isola cada driver em seu peso real (resina em 60%, energia em 7%, frete em 5%), impedindo distorções e repasses multiplicativos.',
    contentWidth - 12
  );
  doc.text(driverInsight, margin + 6, y + 13);

  drawPageFooter(4);

  // =========================================================================
  // PÁGINA 5: 05 · PROJEÇÕES E CENÁRIOS (Gráfico 3: Brent e Projeções)
  // =========================================================================
  doc.addPage();
  drawPageHeader(5);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('05 · PROJEÇÕES E CENÁRIOS DE MERCADO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('O petróleo subiu no curto prazo, mas o consenso projeta arrefecimento', margin, y);
  y += 9;

  // -------------------------------------------------------------------------
  // GRÁFICO 3: CURVA DO BRENT E LEQUE DE CENÁRIOS (y = 38 a 125, altura 70mm)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('GRÁFICO 3: PETRÓLEO BRENT (US$/BBL) — HISTÓRICO E CENÁRIOS 2026/2027', margin, y);
  y += 5;

  const chartBoxX = margin;
  const chartBoxY = y;
  const chartBoxW = contentWidth;
  const chartBoxH = 68;

  // Fundo do gráfico em Ice Blue
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(chartBoxX, chartBoxY, chartBoxW, chartBoxH, 2, 2, 'FD');

  // Eixos e Linhas de Grade
  const plotX = chartBoxX + 18;
  const plotY = chartBoxY + 8;
  const plotW = chartBoxW - 26;
  const plotH = chartBoxH - 18;

  const minP = 60;
  const maxP = 130;
  const toY = (val: number) => plotY + plotH - ((val - minP) / (maxP - minP)) * plotH;

  // Linhas de Grade Horizontais
  [70, 90, 110, 130].forEach((gridVal) => {
    const gy = toY(gridVal);
    doc.setDrawColor(...C.borderDivider);
    doc.setLineWidth(0.2);
    doc.line(plotX, gy, plotX + plotW, gy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text(`$${gridVal}`, plotX - 3, gy + 1.5, { align: 'right' });
  });

  // Pontos Históricos do Brent
  const histPoints = [
    { label: 'Jan/26', price: 75, x: plotX },
    { label: 'Mar/26', price: 118, x: plotX + plotW * 0.2 },
    { label: 'Jun/26', price: 82, x: plotX + plotW * 0.38 },
    { label: 'Ago/26', price: 78, x: plotX + plotW * 0.5 },
    { label: 'Atual (Out)', price: 104.13, x: plotX + plotW * 0.62 },
  ];

  // Desenha a linha histórica sólida em Azul Plurix
  doc.setDrawColor(...C.plurixNavy);
  doc.setLineWidth(1.2);
  for (let i = 0; i < histPoints.length - 1; i++) {
    doc.line(histPoints[i].x, toY(histPoints[i].price), histPoints[i + 1].x, toY(histPoints[i + 1].price));
  }

  // Pontos e Rótulos Históricos
  histPoints.forEach((hp) => {
    const py = toY(hp.price);
    doc.setFillColor(...C.plurixNavy);
    doc.circle(hp.x, py, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textSecondary);
    doc.text(hp.label, hp.x, plotY + plotH + 5, { align: 'center' });
  });

  // Leque de Projeções (a partir de Atual Out/26)
  const currentX = histPoints[4].x;
  const currentY = toY(104.13);
  const projX = plotX + plotW;

  // 1. Cenário Desfavorável (US$ 115) em Coral
  doc.setDrawColor(...C.coral);
  doc.setLineWidth(0.8);
  doc.line(currentX, currentY, projX, toY(115));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.coral);
  doc.text('Desfavorável (US$ 115)', projX - 2, toY(115) - 2.5, { align: 'right' });

  // 2. Cenário Base / Consenso (US$ 90) em Azul Plurix
  doc.setDrawColor(...C.plurixNavy);
  doc.setLineWidth(1.0);
  doc.line(currentX, currentY, projX, toY(90));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('Base / Banco Mundial (US$ 90)', projX - 2, toY(90) - 2, { align: 'right' });

  // 3. Cenário Favorável (US$ 75) em Verde Esmeralda
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.8);
  doc.line(currentX, currentY, projX, toY(75));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.emerald);
  doc.text('Favorável (US$ 75)', projX - 2, toY(75) + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.textSecondary);
  doc.text('Projeção 2027', projX, plotY + plotH + 5, { align: 'center' });

  y += chartBoxH + 8;

  // -------------------------------------------------------------------------
  // Tabela Comparativa de Cenários para a Plurix (Preenchimento y = 135 a 275)
  // -------------------------------------------------------------------------
  const scenCols = [30, 26, 32, 35, 55];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('CENÁRIO', margin + 3, y + 5);
  doc.text('BRENT', margin + 33, y + 5);
  doc.text('RESINA PEAD', margin + 59, y + 5);
  doc.text('IMPACTO NO MILHEIRO', margin + 91, y + 5);
  doc.text('AÇÃO RECOMENDADA PLURIX', margin + 126, y + 5);
  y += 7.5;

  const scenarios = [
    {
      c: 'Base (Consenso)',
      b: 'US$ 90/bbl',
      r: 'Estável (+0% a/a)',
      imp: 'Custo cai -2,0% 12m',
      acao: 'Fórmula paramétrica com gatilho; repasse para baixo em 6 meses.',
      bg: C.surfaceWhite,
    },
    {
      c: 'Desfavorável',
      b: 'US$ 115/bbl',
      r: 'Nova alta (+15%)',
      imp: 'Should-Cost +8,5%',
      acao: 'Ativar segundo fornecedor homologado e antecipar cota de compra.',
      bg: C.coralBg,
    },
    {
      c: 'Favorável',
      b: 'US$ 75/bbl',
      r: 'Queda de -18%',
      imp: 'Custo cai -12,0%',
      acao: 'Capturar deflação trimestral via fórmula sem renegociação na mesa.',
      bg: C.emeraldBg,
    },
  ];

  scenarios.forEach((sc) => {
    const rowH = 14;
    doc.setFillColor(...sc.bg);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.plurixNavy);
    doc.text(sc.c, margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.textPrimary);
    doc.text(sc.b, margin + 33, y + 6);
    doc.text(sc.r, margin + 59, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.plurixNavy);
    doc.text(sc.imp, margin + 91, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textSecondary);
    const acaoLines = doc.splitTextToSize(sc.acao, scenCols[4] - 4);
    doc.text(acaoLines, margin + 126, y + 5);

    y += rowH;
  });

  y += 7;

  // Box de Conclusão de Cenários
  const scenConclH = 44;
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, scenConclH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('DIRETRIZ DE RISCO: POR QUE RECUSAR PREÇO FIXO DE 12 MESES', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.textSecondary);
  const scenText = doc.splitTextToSize(
    'Aceitar reajuste fixo de 28% por 12 meses transfere todo o risco do ciclo para a Plurix. Se o barril de petróleo recuar para a faixa de US$ 80–90 conforme projetado pela EIA e Banco Mundial, o fornecedor capturará margem recorde às custas do varejo. A fórmula com revisão trimestral assegura justiça econômica para ambas as partes.',
    contentWidth - 12
  );
  doc.text(scenText, margin + 6, y + 13);

  drawPageFooter(5);

  // =========================================================================
  // PÁGINA 6: 06 · IMPACTO NO PREÇO E GAP (Gráfico 4: Waterfall Vertical)
  // =========================================================================
  doc.addPage();
  drawPageHeader(6);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('06 · IMPACTO NO PREÇO E GAP DE NEGOCIAÇÃO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('A ponte de custo prova que o aumento justo é de 21,1%, não de 28,0%', margin, y);
  y += 9;

  // -------------------------------------------------------------------------
  // GRÁFICO 4: WATERFALL VERTICAL DE CONTRIBUIÇÃO EM P.P. (y = 38 a 130, altura 82mm)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('GRÁFICO 4: WATERFALL DE CONTRIBUIÇÃO (P.P.) E GAP DE NEGOCIAÇÃO', margin, y);
  y += 5;

  const wfBoxX = margin;
  const wfBoxY = y;
  const wfBoxW = contentWidth;
  const wfBoxH = 78;

  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(wfBoxX, wfBoxY, wfBoxW, wfBoxH, 2, 2, 'FD');

  const wfPlotX = wfBoxX + 12;
  const wfPlotY = wfBoxY + 8;
  const wfPlotW = wfBoxW - 20;
  const wfPlotH = wfBoxH - 20;

  const wfMaxVal = 32;
  const toWfY = (v: number) => wfPlotY + wfPlotH - (v / wfMaxVal) * wfPlotH;

  // Linhas de Grade Verticais
  [0, 10, 20, 30].forEach((gVal) => {
    const gy = toWfY(gVal);
    doc.setDrawColor(...C.borderDivider);
    doc.setLineWidth(0.2);
    doc.line(wfPlotX, gy, wfPlotX + wfPlotW, gy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text(`${gVal}%`, wfPlotX - 2, gy + 1.5, { align: 'right' });
  });

  // Colunas do Waterfall
  const colsWF = [
    { label: 'Resina PEAD', val: 18.0, base: 0, color: C.plurixNavy, txt: '+18,0' },
    { label: 'Energia', val: 1.5, base: 18.0, color: C.plurixRoyal, txt: '+1,5' },
    { label: 'Frete', val: 1.0, base: 19.5, color: C.plurixSky, txt: '+1,0' },
    { label: 'Mão de Obra', val: 0.4, base: 20.5, color: C.plurixCyan, txt: '+0,4' },
    { label: 'Aditivos', val: 0.2, base: 20.9, color: [148, 163, 184] as [number, number, number], txt: '+0,2' },
    { label: 'Should-Cost', val: 21.1, base: 0, color: C.plurixNavy, txt: '21,1%' },
    { label: 'Pleito Fornecedor', val: 28.0, base: 0, color: C.coral, txt: '28,0%' },
  ];

  const colWidth = 16;
  const colSpacing = (wfPlotW - colsWF.length * colWidth) / (colsWF.length + 1);

  colsWF.forEach((c, idx) => {
    const cx = wfPlotX + colSpacing + idx * (colWidth + colSpacing);
    const topY = toWfY(c.base + c.val);
    const botY = toWfY(c.base);
    const barH = botY - topY;

    doc.setFillColor(...c.color);
    doc.roundedRect(cx, topY, colWidth, Math.max(barH, 1.5), 1, 1, 'F');

    // Valor acima da coluna
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...c.color);
    doc.text(c.txt, cx + colWidth / 2, topY - 2, { align: 'center' });

    // Nome do driver abaixo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...C.textPrimary);
    const labelLines = doc.splitTextToSize(c.label, colWidth + 4);
    doc.text(labelLines, cx + colWidth / 2, wfPlotY + wfPlotH + 4, { align: 'center' });
  });

  // Chave Visual do GAP de Negociação (entre coluna 5 e 6)
  const colShouldX = wfPlotX + colSpacing + 5 * (colWidth + colSpacing) + colWidth;
  const colPleitoX = wfPlotX + colSpacing + 6 * (colWidth + colSpacing);
  const gapY1 = toWfY(28.0);
  const gapY2 = toWfY(21.1);

  doc.setDrawColor(...C.amber);
  doc.setLineWidth(0.8);
  // Linhas horizontais e conector do gap
  doc.line(colShouldX + 1, gapY2, colShouldX + 4, gapY2);
  doc.line(colPleitoX - 1, gapY1, colPleitoX - 4, gapY1);
  doc.line(colShouldX + 3, gapY1, colShouldX + 3, gapY2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.amber);
  doc.text('GAP 6,9 p.p.', colShouldX + 5, (gapY1 + gapY2) / 2 + 2);

  y += wfBoxH + 8;

  // -------------------------------------------------------------------------
  // Tabela e Painel de Auditoria da Gordura (Preenchimento y = 135 a 275)
  // -------------------------------------------------------------------------
  const fatCols = [38, 22, 22, 96];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPONENTE', margin + 3, y + 5);
  doc.text('PESO (%)', margin + 41, y + 5);
  doc.text('VAR. 12M', margin + 63, y + 5);
  doc.text('JUSTIFICATIVA ECONÔMICA E IMPACTO NO SHOULD-COST', margin + 85, y + 5);
  y += 7.5;

  const costBreakdownAudit = [
    { n: 'Resina PEAD', w: '60,0%', v: '+30,0%', imp: 'Explica +18,0 p.p. Custo Petroquímico Braskem e cotação do Brent.', bg: C.surfaceWhite },
    { n: 'Energia Elétrica', w: '7,0%', v: '+21,9%', imp: 'Explica +1,5 p.p. Tarifa Copel industrial alta tensão homologada Aneel.', bg: C.plurixIce },
    { n: 'Frete e Logística', w: '5,0%', v: '+20,5%', imp: 'Explica +1,0 p.p. Diesel S10 levantamento ANP e custos de distribuição.', bg: C.surfaceWhite },
    { n: 'Mão de Obra', w: '9,0%', v: '+4,0%', imp: 'Explica +0,4 p.p. Dissídio coletivo da indústria de transformação plástica.', bg: C.plurixIce },
    { n: 'Aditivos e Master', w: '5,0%', v: '+4,2%', imp: 'Explica +0,2 p.p. Pigmentos acompanham inflação geral de insumos químicos.', bg: C.surfaceWhite },
    { n: 'Overhead / Margem', w: '14,0%', v: '0,0%', imp: 'Explica 0,0 p.p. Sem indexador legítimo; custo fixo deve ser absorvido na escala.', bg: C.amberBg },
  ];

  costBreakdownAudit.forEach((cb) => {
    const rowH = 10;
    doc.setFillColor(...cb.bg);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.plurixNavy);
    doc.text(cb.n, margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.textPrimary);
    doc.text(cb.w, margin + 41, y + 6);
    doc.text(cb.v, margin + 63, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textSecondary);
    doc.text(cb.imp, margin + 85, y + 6);

    y += rowH;
  });

  y += 6;

  // Box Tático de Negociação da Gordura
  const fatBoxH = 34;
  doc.setFillColor(...C.amberBg);
  doc.setDrawColor(...C.amber);
  doc.roundedRect(margin, y, contentWidth, fatBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.amber);
  doc.text('COMO DESMONTAR OS 6,9 P.P. DE GORDURA NA MESA DE NEGOCIAÇÃO', margin + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textPrimary);
  const fatGuide = doc.splitTextToSize(
    '1. Exija a planilha de custos aberta (Open Book) antes de discutir qualquer percentual acima de 21%.\n' +
    '2. Demonstre que aplicar 28% no preço de venda aumenta a margem nominal do fornecedor em +14% sobre o ano passado.\n' +
    '3. O Overhead (14%) não subiu; com o volume corporativo unificado da rede Plurix, o custo fixo unitário por milheiro até reduziu.',
    contentWidth - 12
  );
  doc.text(fatGuide, margin + 6, y + 12);

  drawPageFooter(6);

  // =========================================================================
  // PÁGINA 7: 07 · MATRIZ DE RISCOS (Gráfico 5: Matriz 2x2)
  // =========================================================================
  doc.addPage();
  drawPageHeader(7);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('07 · MATRIZ DE RISCOS E MONITORAMENTO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Mapeamento dos 4 riscos críticos e gatilhos de mitigação para a rede', margin, y);
  y += 9;

  // -------------------------------------------------------------------------
  // GRÁFICO 5: MATRIZ 2x2 VETORIAL AMPLIADA (y = 38 a 130, altura 82mm)
  // -------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('GRÁFICO 5: MATRIZ DE RISCOS (PROBABILIDADE X IMPACTO NO CUSTO)', margin, y);
  y += 5;

  const matBoxW = contentWidth;
  const matBoxH = 82;
  const matX = margin;
  const matY = y;

  const halfW = (matBoxW - 6) / 2;
  const halfH = (matBoxH - 6) / 2;

  // Quadrante Superior Esquerdo: Proteger no Contrato (Baixa Prob / Alto Impacto)
  doc.setFillColor(...C.coralBg);
  doc.setDrawColor(...C.coral);
  doc.roundedRect(matX, matY, halfW, halfH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.coral);
  doc.text('PROTEGER NO CONTRATO (Alto Impacto / Baixa Prob)', matX + 4, matY + 6);

  // Quadrante Superior Direito: Ter Plano B (Alta Prob / Alto Impacto)
  doc.setFillColor(...C.amberBg);
  doc.setDrawColor(...C.amber);
  doc.roundedRect(matX + halfW + 6, matY, halfW, halfH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.amber);
  doc.text('TER PLANO B (Alto Impacto / Alta Probabilidade)', matX + halfW + 10, matY + 6);

  // Quadrante Inferior Esquerdo: Só Acompanhar (Baixa Prob / Baixo Impacto)
  doc.setFillColor(...C.rowAlt);
  doc.setDrawColor(...C.borderDivider);
  doc.roundedRect(matX, matY + halfH + 6, halfW, halfH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('SÓ ACOMPANHAR (Baixo Impacto / Baixa Prob)', matX + 4, matY + halfH + 12);

  // Quadrante Inferior Direito: Absorver na Fórmula (Alta Prob / Baixo Impacto)
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixSky);
  doc.roundedRect(matX + halfW + 6, matY + halfH + 6, halfW, halfH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('ABSORVER NA FÓRMULA (Baixo Impacto / Alta Prob)', matX + halfW + 10, matY + halfH + 12);

  // Plotando os 4 Riscos Principais com Badges
  // Risco 1: Choque Brent / Conflito (Alto Imp / Alta Prob) -> Quadrante Superior Direito
  const r1X = matX + halfW + 14;
  const r1Y = matY + 12;
  doc.setFillColor(...C.amber);
  doc.roundedRect(r1X, r1Y, halfW - 16, 20, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('R1: Novo Choque no Brent (US$ 120+)', r1X + 3, r1Y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Ação: Estoque de segurança + 2º fornecedor homologado', r1X + 3, r1Y + 11);
  doc.text('Gatilho: Brent superar US$ 110 por 10 dias seguidos', r1X + 3, r1Y + 16);

  // Risco 2: Falta de Resina / Braskem (Alto Imp / Baixa Prob) -> Quadrante Superior Esquerdo
  const r2X = matX + 6;
  const r2Y = matY + 12;
  doc.setFillColor(...C.coral);
  doc.roundedRect(r2X, r2Y, halfW - 12, 20, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('R2: Restrição de Cota de Resina Nacional', r2X + 3, r2Y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Ação: Cláusula de garantia de entrega de volume prioritário', r2X + 3, r2Y + 11);
  doc.text('Gatilho: Redução de cota da Braskem abaixo de 40%', r2X + 3, r2Y + 16);

  // Risco 3: Volatilidade Cambial (Baixo Imp / Alta Prob) -> Quadrante Inferior Direito
  const r3X = matX + halfW + 14;
  const r3Y = matY + halfH + 18;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(r3X, r3Y, halfW - 16, 17, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('R3: Oscilação do Câmbio PTAX (R$ 5,00 a 5,60)', r3X + 3, r3Y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Ação: Repasse automático via fórmula paramétrica trimestral', r3X + 3, r3Y + 11);

  // Risco 4: Dissídio Coletivo Plástico (Baixo Imp / Baixa Prob) -> Quadrante Inferior Esquerdo
  const r4X = matX + 6;
  const r4Y = matY + halfH + 18;
  doc.setFillColor(...C.textSecondary);
  doc.roundedRect(r4X, r4Y, halfW - 12, 17, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('R4: Dissídio Salarial acima da Inflação', r4X + 3, r4Y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Ação: Trava de repasse no INPC oficial divulgado pelo IBGE', r4X + 3, r4Y + 11);

  y += matBoxH + 8;

  // -------------------------------------------------------------------------
  // Tabela de Gatilhos e Ações Mitigadoras (Preenchimento y = 135 a 275)
  // -------------------------------------------------------------------------
  const riskCols = [38, 42, 68, 30];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('RISCO IDENTIFICADO', margin + 3, y + 5);
  doc.text('GATILHO DE ALERTA', margin + 41, y + 5);
  doc.text('PLANO DE AÇÃO OPERACIONAL PLURIX', margin + 83, y + 5);
  doc.text('PERIODICIDADE', margin + 151, y + 5);
  y += 7.5;

  const riskTable = [
    { r: 'Disparada Brent > US$ 110', g: 'Brent acima de US$ 110/bbl', a: 'Liberar compra antecipada de 45 dias de estoque de segurança.', p: 'Semanal' },
    { r: 'Falta de Matéria-Prima', g: 'Lead time subir de 15 p/ 35 dias', a: 'Ativar segundo fornecedor homologado no Paraná ou interior de SP.', p: 'Quinzenal' },
    { r: 'Câmbio acima de R$ 5,60', g: 'Dólar comercial > R$ 5,60', a: 'Simular impacto no Should-Cost e renegociar base de repasse.', p: 'Diário' },
    { r: 'Reajuste Tarifário Energia', g: 'Bandeira vermelha na Aneel', a: 'Repassar estritamente a proporção de 7% de peso na fórmula.', p: 'Mensal' },
  ];

  riskTable.forEach((rt, idx) => {
    const rowH = 11;
    doc.setFillColor(...(idx % 2 === 0 ? C.surfaceWhite : C.plurixIce));
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.plurixNavy);
    doc.text(rt.r, margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textPrimary);
    doc.text(rt.g, margin + 41, y + 6);
    doc.text(rt.a, margin + 83, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.plurixSky);
    doc.text(rt.p, margin + 151, y + 6);

    y += rowH;
  });

  drawPageFooter(7);

  // =========================================================================
  // PÁGINA 8: 08 · ESTRATÉGIA DE NEGOCIAÇÃO (Balizas, Fórmula e Roleplay)
  // =========================================================================
  doc.addPage();
  drawPageHeader(8);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('08 · ESTRATÉGIA DE NEGOCIAÇÃO E BALIZAS', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Roteiro tático de mesa, fórmula paramétrica e respostas a objeções', margin, y);
  y += 8;

  // 4 Balizas da Mesa (Cards Horizontais)
  const bColW = (contentWidth - 9) / 4;
  const bColH = 26;

  const balizas = [
    { num: 'BALIZA 1 · PISO', val: '18,0%', desc: 'Abertura na mesa; repasse parcial expurgando margem.', c: C.emerald },
    { num: 'BALIZA 2 · META', val: '21,1%', desc: 'Alvo Should-Cost; fechamento por fórmula paramétrica.', c: C.plurixNavy },
    { num: 'BALIZA 3 · TETO', val: '23,0%', desc: 'Limite estrito; só aceitar com prazo de 120 dias.', c: C.amber },
    { num: 'BALIZA 4 · VIGÊNCIA', val: '6 meses', desc: 'Nunca travar 12 meses; revisão trimestral obrigatória.', c: C.plurixSky },
  ];

  balizas.forEach((b, idx) => {
    const bx = margin + idx * (bColW + 3);
    doc.setFillColor(...C.plurixIce);
    doc.setDrawColor(...C.plurixBorder);
    doc.roundedRect(bx, y, bColW, bColH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...C.textMuted);
    doc.text(b.num, bx + 3.5, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...b.c);
    doc.text(b.val, bx + 3.5, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.textSecondary);
    const bDesc = doc.splitTextToSize(b.desc, bColW - 7);
    doc.text(bDesc, bx + 3.5, y + 18.5);
  });

  y += bColH + 7;

  // Card da Fórmula Paramétrica Contratual em Azul Plurix
  const formH = 28;
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin, y, contentWidth, formH, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('FÓRMULA PARAMÉTRICA CONTRATUAL PROPOSTA (CLÁUSULA DE PREÇO)', margin + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('P(novo) = P(base) × [ 0,60 × (PE/PE0) + 0,07 × (EN/EN0) + 0,05 × (DSL/DSL0) + 0,09 × (MO/MO0) + 0,19 ]', margin + 6, y + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(203, 213, 225);
  doc.text('Onde: PE = Resina PEAD Braskem em R$/kg · EN = Copel Alta Tensão · DSL = Diesel S10 ANP · MO = Dissídio Plástico · 0,19 Fixo.', margin + 6, y + 19.5);
  doc.text('Revisão trimestral com gatilho de ativação de ±5%. Teto e piso de variação limitados a ±8% por trimestre.', margin + 6, y + 24);

  y += formH + 7;

  // Tabela de Roleplay Tático (4 Objeções do Fornecedor e Respostas do Comprador)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.plurixNavy);
  doc.text('ROLEPLAY TÁTICO: OBJEÇÕES DO FORNECEDOR E RESPOSTAS COM DADOS', margin, y);
  y += 4.5;

  const roleCols = [70, 108];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('OBJEÇÃO TÍPICA DO FORNECEDOR NA MESA', margin + 3, y + 4.8);
  doc.text('RESPOSTA FUNDAMENTADA DO COMPRADOR PLURIX', margin + 73, y + 4.8);
  y += 7;

  const roleplays = [
    {
      o: '"A resina subiu 30%, por isso nosso reajuste geral tem que ser de 28%."',
      r: 'A resina representa 60% do seu custo de produção, gerando 18,0 p.p. de impacto. Seus outros 40% (energia, mão de obra e frete) subiram só 3,1 p.p. Repassar 28% significa inflar sua margem em 6,9 p.p. Não aceitamos.',
    },
    {
      o: '"Não temos como dar desconto porque a Braskem reajustou em duas fases."',
      r: 'Reconhecemos o reajuste da Braskem e estamos concedendo 100% dele na proporção exata da resina (18 p.p.). Mas não pagaremos repasse de resina embutido sobre frete e margem.',
    },
    {
      o: '"O petróleo está a US$ 104 e vai continuar subindo com a crise."',
      r: 'O relatório de Commodities do Banco Mundial projeta média de US$ 90 para 2026 e US$ 70 em 2027. Fixar 28% por 12 meses agora é travar a Plurix no pico. Por isso exigimos fórmula trimestral.',
    },
    {
      o: '"Se não aceitarem 28%, teremos que cortar o fornecimento da rede."',
      r: 'A Plurix representa escala firme e pagamento pontual para a sua operação. Temos capacidade de transferir o volume consolidado para 2 outros transformadores homologados em 15 dias.',
    },
  ];

  roleplays.forEach((rp, idx) => {
    const oLines = doc.splitTextToSize(rp.o, roleCols[0] - 6);
    const rLines = doc.splitTextToSize(rp.r, roleCols[1] - 6);
    const maxL = Math.max(oLines.length, rLines.length);
    const rowH = Math.max(16, maxL * 3.8 + 5);

    doc.setFillColor(...(idx % 2 === 0 ? C.surfaceWhite : C.plurixIce));
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.coral);
    doc.text(oLines, margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.textPrimary);
    doc.text(rLines, margin + 73, y + 5);

    y += rowH;
  });

  y += 6;

  // Painel de BATNA e Alternativas Plurix (Preenchimento y = 225 a 275)
  const batnaH = 34;
  doc.setFillColor(...C.surfaceWhite);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, batnaH, 2, 2, 'FD');
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, 2.5, batnaH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('BATNA (MELHOR ALTERNATIVA A UM ACORDO NEGOCIADO) · REDE PLURIX', margin + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textSecondary);
  const batnaText = doc.splitTextToSize(
    '1. Consolidação de Demanda: Agrupar 100% do volume de sacolas de todas as lojas e operações da rede Plurix em lote único para concorrência de volume.\n' +
    '2. Redução de Micragem (Engenharia de Embalagem): Testar redução de micragem de 0,025mm para 0,022mm mantendo resistência mecânica, gerando economia imediata de ~12% em massa de resina.\n' +
    '3. Fornecedor B Homologado: Acionar cotação paralela com 2 transformadores industriais homologados no Paraná e São Paulo com capacidade ociosa.',
    contentWidth - 12
  );
  doc.text(batnaText, margin + 6, y + 12);

  drawPageFooter(8);

  // =========================================================================
  // PÁGINA 9: 09 · FONTES AUDITADAS E GOVERNANÇA (Preenchimento Balanceado)
  // =========================================================================
  doc.addPage();
  drawPageHeader(9);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.plurixNavy);
  doc.text('09 · FONTES AUDITADAS E NOTA METODOLÓGICA', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Rastreabilidade total: 10 fontes primárias oficiais e governança corporativa', margin, y);
  y += 9;

  // Tabela de Fontes Auditadas (10 Fontes Oficiais)
  const srcCols = [50, 95, 33];
  doc.setFillColor(...C.plurixNavy);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('FONTE OFICIAL AUDITADA', margin + 3, y + 4.8);
  doc.text('DADO PRIMÁRIO COLETADO', margin + 53, y + 4.8);
  doc.text('DATA-BASE / STATUS', margin + 148, y + 4.8);
  y += 7;

  const auditedSources = [
    { f: 'ICE Futures / Reuters / O Tempo', d: 'Petróleo Brent Datado a US$ 104,13/barril (pico recente de volatilidade)', dt: '08/10/2026' },
    { f: 'Banco Mundial (CMO)', d: 'Commodity Markets Outlook: Projeção de Brent a US$ 90 (2026) e US$ 70 (2027)', dt: 'Outubro/2026' },
    { f: 'Braskem / PlásticoNews', d: 'Reajuste nacional de PEAD de +R$ 8.000/t em duas parcelas (+30% em R$)', dt: 'Setembro/2026' },
    { f: 'Camex / MDIC (Diário Oficial)', d: 'Direitos Antidumping definitivos sobre PEAD dos EUA (US$ 199/t) e Canadá (US$ 238/t)', dt: '26/03/2026' },
    { f: 'Copel / Aneel', d: 'Tarifa de energia elétrica industrial alta tensão com reajuste de +21,9% homologado', dt: 'Julho/2026' },
    { f: 'ANP (Painel Dinâmico Oficial)', d: 'Preço médio do Diesel S10 a R$ 6,04/litro (SP: R$ 5,94 / PR: R$ 5,92 / MG: R$ 6,01)', dt: 'Semana 41/2026' },
    { f: 'Petrobras (Preços Refinarias)', d: 'Acompanhamento de paridade e preços de venda de combustíveis às distribuidoras', dt: 'Outubro/2026' },
    { f: 'IBGE / SIDRA', d: 'IPCA acumulado em 12 meses de 4,20% e INPC acumulado em 4,00%', dt: 'Setembro/2026' },
    { f: 'Sindicato da Indústria Plástica', d: 'Dissídio coletivo da mão de obra da transformação plástica (+4,0%)', dt: 'Data-base 2026' },
    { f: 'AwesomeAPI / Banco Central (B3)', d: 'Câmbio comercial PTAX em R$ 4,99 / R$ 5,05 (dólar estável amortecendo resina)', dt: 'Ao vivo / Oficial' },
  ];

  auditedSources.forEach((as, idx) => {
    const rowH = 8.5;
    doc.setFillColor(...(idx % 2 === 0 ? C.surfaceWhite : C.plurixIce));
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.plurixNavy);
    doc.text(as.f, margin + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textPrimary);
    doc.text(as.d, margin + 53, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.plurixSky);
    doc.text(as.dt, margin + 148, y + 5.5);

    y += rowH;
  });

  y += 7;

  // Nota Metodológica Transparente (Preenchimento y = 160 a 210)
  const methH = 46;
  doc.setFillColor(...C.surfaceWhite);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, methH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('NOTA METODOLÓGICA · MODELO SHOULD-COST PLURIX', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.textSecondary);
  const methText = doc.splitTextToSize(
    '• Fórmula do Reajuste Teórico: Should-Cost = Σ (Peso do Componente × Variação 12m do Driver Primário).\n' +
    '• Rigor Ponderal: A soma dos pesos totaliza rigorosamente 100% da estrutura de custos do produto.\n' +
    '• Tratamento Cambial: A variação da resina em reais (~30%) é calculada expurgando-se o efeito cambial favorável (dólar comercial recuou ~8% no período analisado, amortecendo a cotação internacional em dólares).\n' +
    '• Governança e Alçadas: Este boletim é um subsídio técnico de auditoria econômica de custos desenvolvido para a área de Compras Indiretas da Plurix; a aprovação formal de reajustes segue estritamente a política de alçadas da rede.',
    contentWidth - 12
  );
  doc.text(methText, margin + 6, y + 12.5);

  y += methH + 7;

  // Box de Assinaturas e Governança de Compras Indiretas Plurix (Preenchimento y = 217 a 275)
  const signH = 48;
  doc.setFillColor(...C.plurixIce);
  doc.setDrawColor(...C.plurixBorder);
  doc.roundedRect(margin, y, contentWidth, signH, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.plurixNavy);
  doc.text('ALÇADAS E APROVAÇÕES · COMPRAS INDIRETAS REDE PLURIX', margin + 6, y + 6.5);

  const signCols = (contentWidth - 16) / 3;
  const signY = y + 14;

  // Assinatura 1: Comprador
  doc.setDrawColor(...C.plurixBorder);
  doc.setLineWidth(0.4);
  doc.line(margin + 6, signY + 16, margin + 6 + signCols - 4, signY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.plurixNavy);
  doc.text('Comprador da Categoria', margin + 6, signY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text('Compras Indiretas Plurix', margin + 6, signY + 24);

  // Assinatura 2: Gerente de Compras
  const s2X = margin + 6 + signCols + 4;
  doc.line(s2X, signY + 16, s2X + signCols - 4, signY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.plurixNavy);
  doc.text('Gerência de Compras Indiretas', s2X, signY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text('Auditoria de Suprimentos', s2X, signY + 24);

  // Assinatura 3: Diretor de Suprimentos
  const s3X = margin + 6 + (signCols + 4) * 2;
  doc.line(s3X, signY + 16, s3X + signCols - 4, signY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.plurixNavy);
  doc.text('Diretoria de Suprimentos', s3X, signY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.textMuted);
  doc.text('Rede Plurix · Governança', s3X, signY + 24);

  drawPageFooter(9);

  // =========================================================================
  // SALVAR ARQUIVO PDF
  // =========================================================================
  const filename = `Boletim_Plurix_${cleanTopic.replace(/[^a-zA-Z0-9]/g, '_')}_Outubro_2026.pdf`;
  doc.save(filename);
}
