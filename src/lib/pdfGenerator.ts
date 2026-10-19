import { jsPDF } from 'jspdf';

interface GeneratePdfOptions {
  title: string;
  topic: string;
  markdownContent: string;
  sources?: { title: string; url: string }[];
}

/**
 * Gera um documento PDF executivo timbrado no padrão corporativo Plurix Hub.
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
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 22;
      drawHeader();
    }
  };

  const drawHeader = () => {
    // Linha superior fina em azul institucional
    doc.setFillColor(0, 20, 125); // #00147D
    doc.rect(margin, 12, contentWidth, 1.2, 'F');
  };

  // --- Capa / Cabeçalho Timbrado Oficial ---
  drawHeader();

  // Badge da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 20, 125);
  doc.text('PLURIX HUB  |  COMPRAS INDIRETAS', margin, cursorY);
  cursorY += 6;

  // Título Principal do Boletim
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(26, 42, 56); // #1A2A38
  const titleLines = doc.splitTextToSize(`Boletim de Mercado: ${topic || 'Análise Econômica'}`, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 2;

  // Bloco de Metadados
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // muted
  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Data de Emissão: ${todayStr}  ·  Metodologia: Cost Drivers v3.0  ·  Classificação: Uso Interno`, margin, cursorY);
  cursorY += 6;

  // Linha divisória suave
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 8;

  // --- Processamento do Conteúdo Markdown ---
  // Normaliza o texto removendo hashes repetidos e ajustando parágrafos
  const rawLines = markdownContent.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      cursorY += 3;
      continue;
    }

    // Títulos Nível 1 ou 2 (# ou ##)
    if (line.startsWith('# ') || line.startsWith('## ')) {
      const headingText = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      checkPageBreak(16);
      cursorY += 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 20, 125); // #00147D
      doc.text(headingText, margin, cursorY);
      cursorY += 5;

      // Linha de seção
      doc.setDrawColor(184, 216, 232); // #B8D8E8
      doc.setLineWidth(0.3);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 5;
    }
    // Subtítulos (###)
    else if (line.startsWith('### ')) {
      const subText = line.replace(/^###\s*/, '').replace(/\*\*/g, '');
      checkPageBreak(12);
      cursorY += 3;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 42, 56);
      doc.text(subText, margin, cursorY);
      cursorY += 5;
    }
    // Linha de tabela Markdown (| col | col |)
    else if (line.startsWith('|')) {
      // Ignora linha de separação (|---|---|)
      if (line.includes('---')) continue;

      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c !== '');

      if (cells.length > 0) {
        checkPageBreak(8);
        const colWidth = contentWidth / cells.length;

        // Fundo sutil para linha
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);

        cells.forEach((cell, colIndex) => {
          const cleanCell = cell.replace(/\*\*/g, '');
          const cellLines = doc.splitTextToSize(cleanCell, colWidth - 4);
          doc.text(cellLines, margin + colIndex * colWidth + 2, cursorY);
        });

        cursorY += 6;
      }
    }
    // Itens de Lista (- ou * ou 1.)
    else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const cleanBullet = line.replace(/^[-*]\s+|\d+\.\s+/, '').replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(`•  ${cleanBullet}`, contentWidth - 4);
      checkPageBreak(wrapped.length * 4.5 + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(wrapped, margin + 2, cursorY);
      cursorY += wrapped.length * 4.5 + 2;
    }
    // Citações ou Blockquotes (> ...)
    else if (line.startsWith('>')) {
      const cleanQuote = line.replace(/^>\s*/, '').replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(cleanQuote, contentWidth - 10);
      checkPageBreak(wrapped.length * 4.5 + 6);

      // Caixa de destaque lateral
      doc.setFillColor(244, 250, 254); // #F4FAFE
      doc.rect(margin, cursorY - 3, contentWidth, wrapped.length * 4.5 + 4, 'F');
      doc.setFillColor(0, 20, 125);
      doc.rect(margin, cursorY - 3, 1.5, wrapped.length * 4.5 + 4, 'F');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(26, 42, 56);
      doc.text(wrapped, margin + 6, cursorY + 1);
      cursorY += wrapped.length * 4.5 + 6;
    }
    // Parágrafo Normal
    else {
      const cleanParagraph = line.replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(cleanParagraph, contentWidth);
      checkPageBreak(wrapped.length * 4.5 + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 4.5 + 3;
    }
  }

  // Seção de Fontes no Final
  if (sources.length > 0) {
    checkPageBreak(18 + sources.length * 4);
    cursorY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 20, 125);
    doc.text('Fontes Consultadas & Verificadas:', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    sources.forEach((s) => {
      const sourceLine = doc.splitTextToSize(`- ${s.title}: ${s.url}`, contentWidth);
      doc.text(sourceLine, margin + 2, cursorY);
      cursorY += sourceLine.length * 4 + 1;
    });
  }

  // --- Rodapés em todas as páginas ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    // Linha divisória de rodapé
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // #94A3B8
    doc.text('Plurix Hub  ·  Economista de Compras  ·  Documento Confidencial Interno', margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de ${totalPages}`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  }

  // Dispara o download automático do PDF
  const safeFilename = `Boletim_Mercado_Plurix_${(topic || 'analise')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 25)}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(safeFilename);
}
