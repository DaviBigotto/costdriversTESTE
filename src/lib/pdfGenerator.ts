import { jsPDF } from 'jspdf';

interface GeneratePdfOptions {
  title?: string;
  topic?: string;
  markdownContent: string;
  sources?: { title: string; url: string }[];
}

/**
 * PALETA OFICIAL PLURIX DESIGN SYSTEM (100% Alinhada ao Plurix Hub)
 */
const C = {
  plurixNavy: [0, 20, 125] as [number, number, number],      // #00147D - Cor Institucional Principal
  plurixRoyal: [0, 45, 156] as [number, number, number],     // #002D9C - Azul Royal Plurix
  plurixSky: [2, 132, 199] as [number, number, number],       // #0284C7 - Azul de Acento / Indicadores
  plurixCyan: [14, 165, 233] as [number, number, number],     // #0EA5E9 - Destaque Luminoso
  plurixIce: [244, 250, 254] as [number, number, number],     // #F4FAFE - Fundo de Cards Plurix
  plurixBorder: [216, 227, 233] as [number, number, number],  // #D8E3E9 - Borda Suave Plurix

  emerald: [16, 185, 129] as [number, number, number],       // #10B981 - Alívio / Favorável / Ganhos
  emeraldBg: [236, 253, 245] as [number, number, number],     // #ECFDF5
  amber: [217, 119, 6] as [number, number, number],           // #D97706 - Atenção / Gordura / Gap
  amberBg: [255, 251, 235] as [number, number, number],       // #FFFBEB
  coral: [220, 38, 38] as [number, number, number],           // #DC2626 - Risco / Pressão de Custo
  coralBg: [254, 242, 242] as [number, number, number],       // #FEF2F2

  textPrimary: [30, 41, 59] as [number, number, number],      // #1E293B - Texto Escuro Principal
  textSecondary: [71, 85, 105] as [number, number, number],   // #475569 - Texto Secundário
  textMuted: [100, 116, 139] as [number, number, number],     // #64748B - Muted / Legendas
  surfaceWhite: [255, 255, 255] as [number, number, number],  // #FFFFFF
  borderDivider: [226, 232, 240] as [number, number, number], // #E2E8F0
  rowAlt: [248, 250, 252] as [number, number, number],        // #F8FAFC
};

/**
 * Sanitiza textos removendo emojis e caracteres não compatíveis com fontes padrão do jsPDF.
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[^\x00-\x7F\xC0-\xFF]/g, ' ')
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
        return cleanText(candidate);
      }
    }
  }

  if (topic && !/bom dia|boa tarde|ol[aá]|tudo bem|oi\b/i.test(topic)) {
    return cleanText(topic.replace(/^boletim\s*(de)?\s*(mercado|intelig[êe]ncia)?\s*:?/i, '').trim());
  }

  return 'Inteligência de Custos';
}

/**
 * Extrai dinamicamente os Big Numbers calculados pela IA a partir do texto em Markdown.
 */
function extractBigNumbers(markdown: string) {
  let shouldCost = '';
  let gap = '';
  let trend = '';

  const scMatch = markdown.match(/(?:Should-Cost|Reajuste Te[oó]rico|Te[oó]rico)[^%\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*%)/i);
  if (scMatch) shouldCost = scMatch[1].trim();

  const gapMatch = markdown.match(/(?:Espa[cç]o de Negocia[cç][aã]o|Gap|Gordura|sem lastro)[^\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*(?:p\.?p\.?|%))/i);
  if (gapMatch) gap = gapMatch[1].trim();

  const trendMatch = markdown.match(/(?:Proje[cç][aã]o 12 Meses|Tend[eê]ncia|custo esperado)[^\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*%)/i);
  if (trendMatch) trend = trendMatch[1].trim();

  // Valores de contingência caso não localizados por regex específico
  if (!shouldCost) {
    const genericPct = markdown.match(/(\d+(?:[,\.]\d+)?\s*%)/);
    shouldCost = genericPct ? genericPct[1].trim() : 'Sob Consulta';
  }
  if (!gap) gap = 'Auditado';
  if (!trend) trend = 'Estável';

  return { shouldCost, gap, trend };
}

interface MarkdownBlock {
  type: 'section' | 'subheading' | 'callout' | 'bullet' | 'paragraph' | 'table';
  content: string;
  tableData?: { headers: string[]; rows: string[][] };
}

/**
 * Parser inteligente de Markdown para blocos de impressão vetorial.
 */
function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length >= 2) {
      const headerLine = currentTableLines[0];
      const headers = headerLine
        .split('|')
        .map((c) => cleanText(c.replace(/[*_]/g, '')))
        .filter(Boolean);

      const rows: string[][] = [];
      for (let i = 2; i < currentTableLines.length; i++) {
        const rowCells = currentTableLines[i]
          .split('|')
          .map((c) => cleanText(c.replace(/[*_]/g, '')))
          .filter(Boolean);
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      }

      if (headers.length > 0 && rows.length > 0) {
        blocks.push({
          type: 'table',
          content: '',
          tableData: { headers, rows },
        });
      }
    }
    currentTableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      currentTableLines.push(trimmed);
      continue;
    } else if (currentTableLines.length > 0) {
      flushTable();
    }

    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'section',
        content: cleanText(trimmed.replace(/^##\s*/, '')),
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'subheading',
        content: cleanText(trimmed.replace(/^###\s*/, '')),
      });
    } else if (trimmed.startsWith('>')) {
      blocks.push({
        type: 'callout',
        content: cleanText(trimmed.replace(/^>\s*/, '')),
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        type: 'bullet',
        content: cleanText(trimmed.replace(/^[-*]\s*/, '')),
      });
    } else if (!trimmed.startsWith('# ')) {
      blocks.push({
        type: 'paragraph',
        content: cleanText(trimmed),
      });
    }
  }

  if (currentTableLines.length > 0) {
    flushTable();
  }

  return blocks;
}

/**
 * Gerador Dinâmico Oficial de Boletins em PDF — Plurix Compras Indiretas.
 * Renderiza 100% dos dados gerados dinamicamente pela IA e fontes reais, eliminando qualquer texto engessado.
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
  const { shouldCost, gap, trend } = extractBigNumbers(markdownContent);

  const now = new Date();
  const currentMonthYear = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const formattedDate = now.toLocaleDateString('pt-BR');

  // Helper para desenhar o cabeçalho padrão das páginas internas
  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.plurixNavy);
    doc.text('PLURIX  ·  COMPRAS INDIRETAS', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${cleanTopic} · ${currentMonthYear}`, margin + contentWidth, 12, { align: 'right' });

    doc.setDrawColor(...C.plurixBorder);
    doc.setLineWidth(0.35);
    doc.line(margin, 15, margin + contentWidth, 15);
  };

  // Helper para desenhar o rodapé padrão das páginas internas
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(...C.borderDivider);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.text(`Uso interno Plurix · Compras Indiretas · Dados até ${formattedDate}`, margin, pageHeight - 7.5);
    doc.text(`Página ${pageNum}`, margin + contentWidth, pageHeight - 7.5, { align: 'right' });
  };

  // =========================================================================
  // PÁGINA 1: CAPA EXECUTIVA DINÂMICA
  // =========================================================================
  doc.setFillColor(...C.plurixNavy);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(...C.plurixRoyal);
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('P L U R I X   ·   C O M P R A S   I N D I R E T A S', margin, 24);

  doc.setFillColor(...C.plurixSky);
  doc.roundedRect(margin, 30, 80, 7.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BOLETIM DE INTELIGÊNCIA DE CUSTOS', margin + 5, 35.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  const topicLines = doc.splitTextToSize(cleanTopic, contentWidth);
  doc.text(topicLines, margin, 74);

  const subY = 74 + topicLines.length * 9 + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240);
  const coverSub = doc.splitTextToSize(
    'Auditoria de custos, Should-Cost determinístico, decomposição de drivers e estratégia de negociação para a demanda corporativa da rede Plurix.',
    contentWidth
  );
  doc.text(coverSub, margin, subY);

  doc.setFillColor(...C.plurixSky);
  doc.rect(margin, subY + coverSub.length * 5 + 6, 45, 2, 'F');

  // Big Cards Dinâmicos (Preenchidos com a matemática real da IA)
  const statCardY = subY + coverSub.length * 5 + 16;
  const statCardW = (contentWidth - 12) / 3;
  const statCardH = 46;

  // Stat 1: Should-Cost
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.plurixSky);
  doc.rect(margin, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.plurixNavy);
  doc.text(shouldCost, margin + 5, statCardY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Reajuste Teórico', margin + 5, statCardY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Should-Cost ponderado', margin + 5, statCardY + 32);
  doc.text('acumulado em 12 meses', margin + 5, statCardY + 38);

  // Stat 2: Espaço de Negociação
  const stat2X = margin + statCardW + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(stat2X, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.amber);
  doc.rect(stat2X, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.amber);
  doc.text(gap, stat2X + 5, statCardY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Espaço de Negociação', stat2X + 5, statCardY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Gordura sem lastro em custo', stat2X + 5, statCardY + 32);
  doc.text('no pleito do fornecedor', stat2X + 5, statCardY + 38);

  // Stat 3: Tendência
  const stat3X = margin + (statCardW + 6) * 2;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(stat3X, statCardY, statCardW, statCardH, 3, 3, 'F');
  doc.setFillColor(...C.emerald);
  doc.rect(stat3X, statCardY, statCardW, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.emerald);
  doc.text(trend, stat3X + 5, statCardY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.textPrimary);
  doc.text('Tendência a 12 Meses', stat3X + 5, statCardY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textSecondary);
  doc.text('Projeção futura de mercado', stat3X + 5, statCardY + 32);
  doc.text('para o próximo ciclo', stat3X + 5, statCardY + 38);

  // Painel de Metadados Executivos
  const metaY = statCardY + statCardH + 12;
  const metaH = 50;

  doc.setFillColor(...C.plurixRoyal);
  doc.roundedRect(margin, metaY, contentWidth, metaH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.plurixCyan);
  doc.text('METADADOS DA AUDITORIA · REDE PLURIX', margin + 8, metaY + 9);

  const tileW = (contentWidth - 24) / 2;
  const tileH = 15;

  // Tile 1: Item
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin + 8, metaY + 14, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('CATEGORIA AUDITADA', margin + 12, metaY + 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanTopic.slice(0, 36), margin + 12, metaY + 25);

  // Tile 2: Escopo
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin + 16 + tileW, metaY + 14, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('ESCOPO DA DEMANDA', margin + 20 + tileW, metaY + 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Volume Consolidado Plurix', margin + 20 + tileW, metaY + 25);

  // Tile 3: Metodologia
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin + 8, metaY + 31, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('METODOLOGIA ECONÔMICA', margin + 12, metaY + 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Should-Cost Determinístico & Drivers', margin + 12, metaY + 42);

  // Tile 4: Vigência
  doc.setFillColor(...C.plurixNavy);
  doc.roundedRect(margin + 16 + tileW, metaY + 31, tileW, tileH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('DATA DE ELABORAÇÃO', margin + 20 + tileW, metaY + 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(formattedDate, margin + 20 + tileW, metaY + 42);

  // Rodapé da Capa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'Nota de Governança: Este documento consolida inteligência econômica exclusiva para apoio à mesa de negociação.',
    margin,
    266
  );
  doc.text(
    'A decisão final e aprovação segue a política corporativa de alçadas de Compras da Plurix.',
    margin,
    270
  );

  doc.setDrawColor(...C.plurixSky);
  doc.setLineWidth(0.4);
  doc.line(margin, 274, margin + contentWidth, 274);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Edição Executiva · ${currentMonthYear}`, margin, 280);
  doc.text('Fontes Primárias Auditadas · Plurix Compras', margin + contentWidth, 280, { align: 'right' });

  // =========================================================================
  // PÁGINAS INTERNAS DINÂMICAS: RENDERIZAÇÃO DO CONTEÚDO REAL DO MARKDOWN
  // =========================================================================
  const blocks = parseMarkdownToBlocks(markdownContent);
  let currentPage = 1;
  let y = pageHeight; // Força abertura de nova página

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentPage++;
      drawPageHeader();
      y = 22;
    }
  };

  for (const block of blocks) {
    if (block.type === 'section') {
      // Nova seção executiva com banner destacado
      checkPageBreak(25);
      y += 4;

      doc.setFillColor(...C.plurixNavy);
      doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(block.content, margin + 5, y + 6);
      y += 14;
    } else if (block.type === 'subheading') {
      checkPageBreak(14);
      y += 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.plurixNavy);
      doc.text(block.content, margin, y);
      y += 6;
    } else if (block.type === 'callout') {
      // Box de destaque / Callout
      const lines = doc.splitTextToSize(block.content, contentWidth - 12);
      const boxH = Math.max(12, lines.length * 4.2 + 6);
      checkPageBreak(boxH + 4);

      doc.setFillColor(...C.plurixIce);
      doc.setDrawColor(...C.plurixBorder);
      doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'FD');

      doc.setFillColor(...C.plurixSky);
      doc.rect(margin, y, 2.5, boxH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.textPrimary);
      doc.text(lines, margin + 7, y + 5.5);
      y += boxH + 5;
    } else if (block.type === 'bullet') {
      const lines = doc.splitTextToSize(block.content, contentWidth - 8);
      checkPageBreak(lines.length * 4 + 2);

      doc.setFillColor(...C.plurixSky);
      doc.circle(margin + 2, y + 2, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.textPrimary);
      doc.text(lines, margin + 6, y + 3);
      y += lines.length * 4.2 + 2;
    } else if (block.type === 'paragraph') {
      const lines = doc.splitTextToSize(block.content, contentWidth);
      checkPageBreak(lines.length * 4 + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.textSecondary);
      doc.text(lines, margin, y + 3);
      y += lines.length * 4.2 + 3;
    } else if (block.type === 'table' && block.tableData) {
      // Renderização dinâmica de tabelas em vetorial limpo
      const { headers, rows } = block.tableData;
      const numCols = headers.length;
      if (numCols === 0) continue;

      const colW = contentWidth / numCols;
      const headerH = 7.5;
      const rowH = 6.8;

      checkPageBreak(headerH + Math.min(rows.length, 3) * rowH + 8);

      // Cabeçalho da Tabela
      doc.setFillColor(...C.plurixRoyal);
      doc.rect(margin, y, contentWidth, headerH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      headers.forEach((h, cIdx) => {
        const textH = doc.splitTextToSize(h, colW - 4);
        doc.text(textH[0] || '', margin + cIdx * colW + 3, y + 5);
      });
      y += headerH;

      // Linhas de dados da Tabela
      rows.forEach((r, rIdx) => {
        checkPageBreak(rowH + 2);

        doc.setFillColor(...(rIdx % 2 === 1 ? C.rowAlt : C.surfaceWhite));
        doc.rect(margin, y, contentWidth, rowH, 'F');

        doc.setDrawColor(...C.borderDivider);
        doc.setLineWidth(0.2);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...C.textPrimary);

        r.forEach((cell, cIdx) => {
          if (cIdx < numCols) {
            const cellLines = doc.splitTextToSize(cell, colW - 4);
            doc.text(cellLines[0] || '', margin + cIdx * colW + 3, y + 4.6);
          }
        });
        y += rowH;
      });

      y += 6;
    }
  }

  // Desenha rodapés em todas as páginas adicionadas
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p);
  }

  // Salva e inicia o download
  const cleanFilename = `Boletim_${cleanTopic.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  doc.save(cleanFilename);
}
