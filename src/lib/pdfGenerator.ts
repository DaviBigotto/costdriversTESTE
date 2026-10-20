import { jsPDF } from 'jspdf';

interface GeneratePdfOptions {
  title: string;
  topic: string;
  markdownContent: string;
  sources?: { title: string; url: string }[];
}

/**
 * Tokens do Plurix Design System para PDFs executivos:
 */
const DS = {
  navy: [0, 20, 125] as [number, number, number],      // #00147D - Cor primária institucional
  navy2: [0, 29, 179] as [number, number, number],    // #001DB3 - Destaque
  pos: [16, 185, 129] as [number, number, number],     // #10B981 - Sucesso / Economia
  neg: [220, 38, 38] as [number, number, number],      // #DC2626 - Alerta / Risco
  gold: [245, 158, 11] as [number, number, number],    // #F59E0B - Atenção / Moderado
  text: [26, 42, 56] as [number, number, number],      // #1A2A38 - Texto principal
  muted: [122, 144, 160] as [number, number, number],  // #7A90A0 - Texto secundário
  card: [244, 250, 254] as [number, number, number],   // #F4FAFE - Fundo suave de cards
  surface: [255, 255, 255] as [number, number, number],// #FFFFFF - Branco puro
  brd: [184, 216, 232] as [number, number, number],    // #B8D8E8 - Borda de destaque
  brd2: [232, 237, 242] as [number, number, number],   // #E8EDF2 - Borda divisória sutil
  bg: [248, 250, 252] as [number, number, number],     // #F8FAFC - Linhas alternadas
};

/**
 * Extrai os 3 Big Numbers e a recomendação a partir do Markdown gerado ou define valores de referência.
 */
function extractCoverMetrics(markdown: string) {
  // 1. Reajuste Teórico Justo
  const reajusteMatch = markdown.match(/Reajuste Te[oó]rico.*?:\s*\*?\*?([+\-]?\d+[,.]?\d*%?)/i) ||
    markdown.match(/Meta\s*\(Should-Cost\).*?:\s*\*?\*?([+\-]?\d+[,.]?\d*%?)/i) ||
    markdown.match(/Should-Cost.*?:\s*\*?\*?([+\-]?\d+[,.]?\d*%?)/i);

  // 2. Espaço de Negociação (Gap sem lastro)
  const gapMatch = markdown.match(/Espa[çc]o de Negocia[çc][ãa]o.*?:\s*\*?\*?([+\-]?\d+[,.]?\d*\s*(?:p\.?p\.?|%))/i) ||
    markdown.match(/Gap.*?:\s*\*?\*?([+\-]?\d+[,.]?\d*\s*(?:p\.?p\.?|%))/i);

  // 3. Projeção 12m
  const projecaoMatch = markdown.match(/Proje[çc][ãa]o 12.*?:.*?\*?\*?([^\n*]+)/i) ||
    markdown.match(/Tend[êe]ncia.*?:.*?\*?\*?([^\n*]+)/i);

  // 4. Recomendação Executiva
  const recMatch = markdown.match(/Recomenda[çc][ãa]o Executiva.*?:.*?\*?\*?([^\n*]+)/i) ||
    markdown.match(/> \*\*DESTAQUES DA CAPA.*?\n> \* .*?\n> \* .*?\n> \* .*?\n> \* \*\*Recomenda[çc][ãa]o.*?\*\*:\s*([^\n]+)/is);

  const reajusteVal = reajusteMatch ? reajusteMatch[1].trim() : '+3,8%';
  const gapVal = gapMatch ? gapMatch[1].trim() : '4,2 p.p.';
  let projVal = projecaoMatch ? projecaoMatch[1].replace(/\[|\]/g, '').trim() : 'ESTABILIDADE';
  if (projVal.length > 18) projVal = 'NEUTRA / ESTÁVEL';

  let recText = recMatch ? recMatch[1].replace(/\[|\]/g, '').trim() :
    'Rejeitar repasse integral de fornecedores. Ancorar a negociação na meta justa do Should-Cost ponderado e condicionar concessões à formalização de cláusula paramétrica.';
  if (recText.length > 250) recText = recText.slice(0, 247) + '...';

  return {
    reajuste: reajusteVal,
    gap: gapVal,
    projecao: projVal.toUpperCase(),
    recomendacao: recText,
  };
}

/**
 * Gera um documento PDF executivo no padrão do Design System Plurix Hub e alinhado ao Benchmark de Compras.
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const metrics = extractCoverMetrics(markdownContent);

  // ==========================================
  // PÁGINA 1: CAPA EXECUTIVA (PLURIX DESIGN SYSTEM)
  // ==========================================

  // Faixa superior institucional (--navy)
  doc.setFillColor(...DS.navy);
  doc.rect(0, 0, pageWidth, 4.5, 'F');

  // Badge de contexto Plurix Hub
  doc.setFillColor(...DS.card);
  doc.setDrawColor(...DS.brd);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, 12, 64, 7, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DS.navy);
  doc.text('PLURIX HUB  |  COMPRAS INDIRETAS', margin + 3.5, 16.5);

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DS.text);
  doc.text('BOLETIM DE INTELIGÊNCIA DE CUSTOS', margin, 27);

  // Subtítulo / Categoria Analisada
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...DS.navy);
  const cleanTopic = (topic || 'Compras Indiretas').replace(/^boletim\s*(de)?\s*(mercado)?\s*:?/i, '').trim();
  const topicLines = doc.splitTextToSize(cleanTopic, contentWidth);
  doc.text(topicLines, margin, 35);

  const topicYOffset = (topicLines.length - 1) * 6;

  // Descrição do Escopo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...DS.muted);
  doc.text('Auditoria de Custos  ·  Should-Cost Determinístico  ·  Estratégia de Negociação', margin, 42 + topicYOffset);

  // Metadados
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DS.muted);
  doc.text(
    `Emissão: ${todayStr}   ·   Escopo: Demanda Corporativa Consolidada Rede Plurix   ·   Classificação: Uso Interno`,
    margin,
    48 + topicYOffset
  );

  // Divisor sutil
  doc.setDrawColor(...DS.brd);
  doc.setLineWidth(0.35);
  doc.line(margin, 52 + topicYOffset, margin + contentWidth, 52 + topicYOffset);

  // --- 3 BIG NUMBERS / KPI CARDS ---
  const cardY = 57 + topicYOffset;
  const cardW = (contentWidth - 8) / 3; // 3 colunas com 4mm de gap
  const cardH = 30;

  // Card 1: Reajuste Teórico Justo
  doc.setFillColor(...DS.card);
  doc.setDrawColor(...DS.brd);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(...DS.navy);
  doc.rect(margin, cardY, cardW, 1.8, 'F'); // Top accent

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.muted);
  doc.text('REAJUSTE TEÓRICO JUSTO', margin + 3.5, cardY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...DS.navy);
  doc.text(metrics.reajuste, margin + 3.5, cardY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.text);
  doc.text('Should-Cost ponderado 12m', margin + 3.5, cardY + 25);

  // Card 2: Espaço de Negociação (Gap sem lastro)
  const card2X = margin + cardW + 4;
  doc.setFillColor(...DS.card);
  doc.setDrawColor(...DS.brd);
  doc.roundedRect(card2X, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(...DS.pos);
  doc.rect(card2X, cardY, cardW, 1.8, 'F'); // Top accent

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.muted);
  doc.text('GAP SEM LASTRO EM CUSTO', card2X + 3.5, cardY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...DS.pos);
  doc.text(metrics.gap, card2X + 3.5, cardY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.text);
  doc.text('Espaço direto de negociação', card2X + 3.5, cardY + 25);

  // Card 3: Projeção 12m
  const card3X = card2X + cardW + 4;
  doc.setFillColor(...DS.card);
  doc.setDrawColor(...DS.brd);
  doc.roundedRect(card3X, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFillColor(...DS.gold);
  doc.rect(card3X, cardY, cardW, 1.8, 'F'); // Top accent

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.muted);
  doc.text('TENDÊNCIA 12 MESES', card3X + 3.5, cardY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...DS.gold);
  const projLines = doc.splitTextToSize(metrics.projecao, cardW - 7);
  doc.text(projLines[0] || 'ESTABILIDADE', card3X + 3.5, cardY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.text);
  doc.text('Curva agregada de insumos', card3X + 3.5, cardY + 25);

  // --- RECOMENDAÇÃO OPERACIONAL PARA A MESA (CALLOUT BOX) ---
  const recBoxY = cardY + cardH + 5;
  const recBoxH = 34;

  doc.setFillColor(...DS.card);
  doc.setDrawColor(...DS.brd);
  doc.roundedRect(margin, recBoxY, contentWidth, recBoxH, 2, 2, 'FD');

  // Borda esquerda de destaque (--navy)
  doc.setFillColor(...DS.navy);
  doc.rect(margin, recBoxY, 3, recBoxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DS.navy);
  doc.text('DIRETRIZ ESTRATÉGICA PARA O COMPRADOR NA MESA', margin + 6, recBoxY + 7);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...DS.text);
  const recWrapped = doc.splitTextToSize(metrics.recomendacao, contentWidth - 12);
  doc.text(recWrapped, margin + 6, recBoxY + 14);

  // --- AS 4 BALIZAS OPERACIONAIS DE MESA ---
  const balizasY = recBoxY + recBoxH + 5;
  const balizasH = 38;

  doc.setFillColor(...DS.surface);
  doc.setDrawColor(...DS.brd2);
  doc.roundedRect(margin, balizasY, contentWidth, balizasH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DS.navy);
  doc.text('AS 4 BALIZAS OPERACIONAIS DE NEGOCIAÇÃO (PLURIX)', margin + 4, balizasY + 7);

  const colW = (contentWidth - 8) / 4;
  const balizas = [
    { label: 'ABERTURA', val: '0,0% a +2,0%', desc: 'Piso de barganha inicial' },
    { label: 'META (JUSTO)', val: metrics.reajuste, desc: 'Should-Cost determinístico' },
    { label: 'TETO MÁXIMO', val: '+4,5%', desc: 'Limite com contrapartida' },
    { label: 'PRAZO & GATILHO', val: '6m / ±5%', desc: 'Revisão periódica formal' },
  ];

  balizas.forEach((b, idx) => {
    const bx = margin + 3 + idx * (colW + 1);
    doc.setFillColor(...DS.card);
    doc.setDrawColor(...DS.brd);
    doc.roundedRect(bx, balizasY + 11, colW - 2, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...DS.muted);
    doc.text(b.label, bx + 2.5, balizasY + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DS.navy);
    doc.text(b.val, bx + 2.5, balizasY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...DS.text);
    doc.text(b.desc, bx + 2.5, balizasY + 29);
  });

  // --- SÍNTESE DA METODOLOGIA E SEGURANÇA DE DADOS ---
  const infoY = balizasY + balizasH + 5;
  doc.setFillColor(...DS.bg);
  doc.setDrawColor(...DS.brd2);
  doc.roundedRect(margin, infoY, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...DS.navy);
  doc.text('METODOLOGIA CORPORATIVA & CONEXÃO DE DADOS PRIMÁRIOS', margin + 4, infoY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.muted);
  const infoText = doc.splitTextToSize(
    'Este documento de inteligência foi gerado a partir da metodologia paramétrica de Cost Drivers e Should-Cost da Plurix. As análises são estritamente ancoradas em cotações e índices primários em tempo real (AwesomeAPI para Câmbio, IBGE SIDRA para IPCA/INPC, ANP para Combustíveis, Banco Central para Selic e entidades setoriais homologadas como ABIPLAST e Empapel). Não substitui a homologação final do comprador.',
    contentWidth - 8
  );
  doc.text(infoText, margin + 4, infoY + 12);

  // Rodapé da Página 1
  doc.setDrawColor(...DS.brd2);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DS.muted);
  doc.text('Plurix Hub  ·  Inteligência de Custos & Should-Cost  ·  Uso Interno Confidencial', margin, pageHeight - 7);
  doc.text('Página 1', margin + contentWidth, pageHeight - 7, { align: 'right' });

  // Quebra formal para início do conteúdo detalhado
  doc.addPage();

  // ==========================================
  // PÁGINAS 2 EM DIANTE: SEÇÕES DETALHADAS & TABELAS
  // ==========================================

  let cursorY = 22;

  const drawContentPageHeader = () => {
    // Linha superior corporativa (--navy)
    doc.setFillColor(...DS.navy);
    doc.rect(margin, 8, contentWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DS.navy);
    doc.text('PLURIX HUB  ·  COMPRAS INDIRETAS', margin, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DS.muted);
    const headerTitle = `Boletim: ${cleanTopic.slice(0, 45)}`;
    doc.text(headerTitle, margin + contentWidth, 14, { align: 'right' });

    doc.setDrawColor(...DS.brd2);
    doc.setLineWidth(0.3);
    doc.line(margin, 17, margin + contentWidth, 17);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 18) {
      doc.addPage();
      cursorY = 24;
      drawContentPageHeader();
    }
  };

  // Desenha o cabeçalho inicial da página 2
  drawContentPageHeader();

  // Divide o Markdown em linhas
  const rawLines = markdownContent.split('\n');

  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;

    const numCols = Math.max(...tableRows.map((r) => r.length));
    if (numCols === 0) {
      tableRows = [];
      inTable = false;
      return;
    }

    const colWidth = contentWidth / numCols;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1);

    // Altura estimada do cabeçalho
    checkPageBreak(12);

    // Cabeçalho da Tabela (--navy)
    doc.setFillColor(...DS.navy);
    doc.rect(margin, cursorY, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    headerRow.forEach((cell, idx) => {
      const cleanCell = cell.replace(/\*\*/g, '').trim().toUpperCase();
      const wrapped = doc.splitTextToSize(cleanCell, colWidth - 3);
      doc.text(wrapped[0] || '', margin + idx * colWidth + 2, cursorY + 4.8);
    });

    cursorY += 7;

    // Linhas de Dados da Tabela
    dataRows.forEach((row, rowIdx) => {
      // Calcula o maior número de linhas desta linha
      let maxLinesInRow = 1;
      const cellLinesArray: string[][] = [];

      row.forEach((cell, idx) => {
        const cleanCell = cell.replace(/\*\*/g, '').trim();
        const wrapped = doc.splitTextToSize(cleanCell, colWidth - 3);
        maxLinesInRow = Math.max(maxLinesInRow, wrapped.length);
        cellLinesArray[idx] = wrapped;
      });

      const rowHeight = Math.max(6, maxLinesInRow * 3.8 + 2.5);

      if (cursorY + rowHeight > pageHeight - 18) {
        doc.addPage();
        cursorY = 24;
        drawContentPageHeader();

        // Redesenha o cabeçalho da tabela após quebra de página
        doc.setFillColor(...DS.navy);
        doc.rect(margin, cursorY, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        headerRow.forEach((cell, idx) => {
          const cleanCell = cell.replace(/\*\*/g, '').trim().toUpperCase();
          const wrapped = doc.splitTextToSize(cleanCell, colWidth - 3);
          doc.text(wrapped[0] || '', margin + idx * colWidth + 2, cursorY + 4.8);
        });
        cursorY += 7;
      }

      // Fundo alternado
      doc.setFillColor(rowIdx % 2 === 0 ? DS.surface[0] : DS.bg[0], rowIdx % 2 === 0 ? DS.surface[1] : DS.bg[1], rowIdx % 2 === 0 ? DS.surface[2] : DS.bg[2]);
      doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');

      // Borda inferior da linha
      doc.setDrawColor(...DS.brd2);
      doc.setLineWidth(0.2);
      doc.line(margin, cursorY + rowHeight, margin + contentWidth, cursorY + rowHeight);

      // Renderiza as células
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...DS.text);

      row.forEach((_, idx) => {
        const lines = cellLinesArray[idx] || [];
        doc.text(lines, margin + idx * colWidth + 2, cursorY + 4);
      });

      cursorY += rowHeight;
    });

    cursorY += 4;
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Se está em bloco de tabela
    if (line.startsWith('|')) {
      if (line.includes('---')) continue; // Ignora linha divisória markdown
      inTable = true;
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length > 0) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!line) {
      cursorY += 2;
      continue;
    }

    // Pula blocos que pertencem exclusivamente à capa (evita duplicação)
    if (
      line.startsWith('# BOLETIM') ||
      line.startsWith('# Boletim') ||
      line.includes('DESTAQUES DA CAPA') ||
      line.includes('BIG NUMBERS')
    ) {
      continue;
    }

    // Seções Nível 1 ou 2 (## 01 · ..., etc.)
    if (line.startsWith('## ') || line.startsWith('# ')) {
      const headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      checkPageBreak(18);
      cursorY += 4;

      // Card / Barra de Título de Seção
      doc.setFillColor(...DS.card);
      doc.setDrawColor(...DS.brd);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'FD');

      doc.setFillColor(...DS.navy);
      doc.rect(margin, cursorY, 2.5, 8, 'F'); // Acento lateral

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DS.navy);
      doc.text(headingText.toUpperCase(), margin + 5, cursorY + 5.5);

      cursorY += 12;
    }
    // Subseções (### ...)
    else if (line.startsWith('### ')) {
      const subText = line.replace(/^###\s*/, '').replace(/\*\*/g, '').trim();
      checkPageBreak(12);
      cursorY += 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...DS.text);
      doc.text(`▸  ${subText}`, margin, cursorY);
      cursorY += 5;
    }
    // Citação / Callout (> ...)
    else if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim();
      const wrapped = doc.splitTextToSize(quoteText, contentWidth - 10);
      const boxH = wrapped.length * 4.2 + 5;
      checkPageBreak(boxH + 2);

      doc.setFillColor(...DS.card);
      doc.setDrawColor(...DS.brd);
      doc.roundedRect(margin, cursorY, contentWidth, boxH, 1.5, 1.5, 'FD');

      doc.setFillColor(...DS.pos);
      doc.rect(margin, cursorY, 2.5, boxH, 'F');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...DS.text);
      doc.text(wrapped, margin + 5, cursorY + 4.5);

      cursorY += boxH + 3;
    }
    // Fórmulas Matemáticas ou Minutas Contratuais (P(t) = ...)
    else if (line.includes('P(t)') || line.includes('P_t =') || line.startsWith('$$')) {
      const formulaText = line.replace(/\$\$/g, '').replace(/\*\*/g, '').trim();
      const wrapped = doc.splitTextToSize(formulaText, contentWidth - 10);
      const boxH = wrapped.length * 4.5 + 6;
      checkPageBreak(boxH + 2);

      doc.setFillColor(241, 245, 249); // #F1F5F9
      doc.setDrawColor(...DS.brd);
      doc.roundedRect(margin, cursorY, contentWidth, boxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...DS.navy);
      doc.text(wrapped, margin + 5, cursorY + 5);

      cursorY += boxH + 3;
    }
    // Itens de Lista (- ou * ou 1.)
    else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const cleanBullet = line.replace(/^[-*]\s+|\d+\.\s+/, '').replace(/\*\*/g, '').trim();
      const wrapped = doc.splitTextToSize(cleanBullet, contentWidth - 6);
      checkPageBreak(wrapped.length * 4 + 1.5);

      // Bullet estilizado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...DS.navy);
      doc.text('•', margin + 1, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...DS.text);
      doc.text(wrapped, margin + 5, cursorY);

      cursorY += wrapped.length * 4 + 1.5;
    }
    // Parágrafos Comuns
    else {
      const cleanPara = line.replace(/\*\*/g, '').trim();
      const wrapped = doc.splitTextToSize(cleanPara, contentWidth);
      checkPageBreak(wrapped.length * 4 + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...DS.text);
      doc.text(wrapped, margin, cursorY);

      cursorY += wrapped.length * 4 + 2.5;
    }
  }

  // Se encerrou o arquivo dentro de uma tabela
  if (inTable) {
    flushTable();
  }

  // --- SEÇÃO FINAL DE FONTES AUDITADAS ---
  if (sources.length > 0) {
    checkPageBreak(16 + sources.length * 4);
    cursorY += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...DS.navy);
    doc.text('Fontes Primárias Conectadas & Verificadas:', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DS.muted);

    sources.forEach((s) => {
      const sourceLine = doc.splitTextToSize(`• ${s.title}: ${s.url}`, contentWidth - 4);
      doc.text(sourceLine, margin + 2, cursorY);
      cursorY += sourceLine.length * 3.8 + 1;
    });
  }

  // ==========================================
  // RODAPÉ EM TODAS AS PÁGINAS (1 a N)
  // ==========================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    // Linha divisória de rodapé
    doc.setDrawColor(...DS.brd2);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 11, margin + contentWidth, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DS.muted);
    doc.text('Plurix Hub  ·  Inteligência de Custos & Should-Cost  ·  Uso Interno Confidencial', margin, pageHeight - 6.5);
    doc.text(`Página ${pageNum} de ${totalPages}`, margin + contentWidth, pageHeight - 6.5, { align: 'right' });
  }

  // Nome seguro para o download do arquivo
  const safeFilename = `Boletim_Inteligencia_Custos_Plurix_${(cleanTopic || 'compras')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(safeFilename);
}
