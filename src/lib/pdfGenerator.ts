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
 * Sanitiza textos removendo emojis, formatações de markdown inline (**, _, `)
 * e caracteres não compatíveis com fontes padrão do jsPDF.
 */
function cleanText(text: string): string {
  if (!text) return '';
  let cleaned = text;
  // Remove marcações de negrito e itálico preservando o conteúdo
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  // Se ainda sobraram asteriscos ou underscores soltos nas pontas
  cleaned = cleaned.replace(/^\*+|\*+$/g, '').replace(/^_+|_+$/g, '');
  return cleaned
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

  // 1. Prioriza a extração do bloco oficial DESTAQUES DA CAPA
  const coverMatch = markdown.match(/(?:DESTAQUES DA CAPA|BIG NUMBERS)[\s\S]*?(?=##|\n\n#|$)/i);
  const searchBlock = coverMatch ? coverMatch[0] : markdown;

  // Should-Cost
  const scMatch = searchBlock.match(/(?:Should-Cost|Reajuste Te[oó]rico|Te[oó]rico)[^%\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*%)/i) ||
                  markdown.match(/(?:Should-Cost|Reajuste Te[oó]rico|Te[oó]rico)[^%\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*%)/i);
  if (scMatch) shouldCost = scMatch[1].trim();

  // Gap / Espaço de Negociação (busca especificamente padrão de gap em p.p. ou intervalo)
  const gapDirectMatch = searchBlock.match(/(?:Espa[cç]o de Negocia[cç][aã]o|Gap|Gordura|sem lastro)[^:\n]*:\s*[*_]*([+\-]?\d+(?:[,\.]\d+)?(?:\s*a\s*\d+(?:[,\.]\d+)?)?\s*(?:p\.?p\.?|%))/i) ||
                         markdown.match(/(?:Espa[cç]o de Negocia[cç][aã]o|Gap|Gordura|sem lastro)[^:\n]*:\s*[*_]*([+\-]?\d+(?:[,\.]\d+)?(?:\s*a\s*\d+(?:[,\.]\d+)?)?\s*(?:p\.?p\.?|%))/i);
  if (gapDirectMatch) {
    gap = gapDirectMatch[1].trim();
  }

  // Se não localizou ou pegou uma porcentagem isolada do pedido do fornecedor, busca explicitamente p.p. de gap
  if (!gap || (!gap.includes('p.p.') && markdown.includes('p.p.'))) {
    const ppMatch = markdown.match(/([+\-]?\d+(?:[,\.]\d+)?(?:\s*a\s*\d+(?:[,\.]\d+)?)?\s*p\.?p\.?)(?:\s*(?:de|do)?\s*(?:espa[cç]o|gap|sem lastro|pedido)?)/i);
    if (ppMatch) gap = ppMatch[1].trim();
  }

  // Trend / Tendência
  const trendTextMatch = searchBlock.match(/(?:Proje[cç][aã]o 12 Meses|Tend[eê]ncia|custo esperado)[^:\n]*:\s*[*_]*([A-Za-zÀ-ÿ\s]+)/i);
  if (trendTextMatch) {
    const rawTrend = trendTextMatch[1].trim().split(/[\n\(\.]/)[0].trim();
    if (rawTrend && rawTrend.length < 35) {
      const up = rawTrend.toUpperCase();
      trend = up.includes('ALÍVIO') || up.includes('BAIXA') || up.includes('QUEDA')
        ? 'Alívio / Baixa'
        : up.includes('PRESSÃO') || up.includes('ALTA')
        ? 'Pressão / Alta'
        : 'Estável';
    }
  }

  if (!trend) {
    const trendPct = markdown.match(/(?:Proje[cç][aã]o 12 Meses|Tend[eê]ncia)[^\d\n]*([+\-]?\d+(?:[,\.]\d+)?\s*%)/i);
    if (trendPct) trend = trendPct[1].trim();
  }

  // Valores de contingência caso não localizados
  if (!shouldCost) {
    const genericPct = markdown.match(/(\d+(?:[,\.]\d+)?\s*%)/);
    shouldCost = genericPct ? genericPct[1].trim() : 'Sob Consulta';
  }
  if (!gap) gap = 'Auditado';
  if (!trend) trend = 'Estável';

  return { shouldCost, gap, trend };
}

/**
 * Calcula larguras inteligentes e balanceadas para colunas de tabelas executivas.
 */
function calculateColumnWidths(headers: string[], totalWidth: number): number[] {
  const numCols = headers.length;
  if (numCols <= 1) return [totalWidth];

  const hJoined = headers.join(' ').toLowerCase();

  // 1. Roleplay de Objeções (2 colunas: Objeção, Resposta Técnica)
  if (numCols === 2 && (hJoined.includes('obje') || hJoined.includes('resposta') || hJoined.includes('fornecedor'))) {
    return [totalWidth * 0.40, totalWidth * 0.60];
  }

  // 2. Balizas de Mesa (3 colunas: Baliza, Percentual, Justificativa Técnica)
  if (numCols === 3 && (hJoined.includes('baliza') || hJoined.includes('meta'))) {
    return [totalWidth * 0.18, totalWidth * 0.16, totalWidth * 0.66];
  }

  // 3. Elo da Cadeia (3 colunas: Elo, Situação, Efeito)
  if (numCols === 3 && (hJoined.includes('elo') || hJoined.includes('cadeia'))) {
    return [totalWidth * 0.24, totalWidth * 0.38, totalWidth * 0.38];
  }

  // 4. Fontes Oficiais (3 colunas: Fonte, Dado Utilizado, Período)
  if (numCols === 3 && (hJoined.includes('fonte') || hJoined.includes('dado') || hJoined.includes('oficial'))) {
    return [totalWidth * 0.26, totalWidth * 0.48, totalWidth * 0.26];
  }

  // 5. Matriz de Drivers & Waterfall (6 colunas: Componente, Peso, Driver, Variação, Contribuição, Fonte)
  if (numCols === 6 && (hJoined.includes('peso') || hJoined.includes('contribui') || hJoined.includes('driver'))) {
    return [
      totalWidth * 0.18, // Componente
      totalWidth * 0.10, // Peso (%)
      totalWidth * 0.28, // Driver de Mercado
      totalWidth * 0.14, // Variação 12m (%)
      totalWidth * 0.14, // Contribuição (p.p.)
      totalWidth * 0.16, // Fonte Oficial
    ];
  }

  // 6. Matriz de Drivers (5 colunas: Componente, Peso, Driver, Variação, Contribuição)
  if (numCols === 5 && (hJoined.includes('peso') || hJoined.includes('contribui'))) {
    return [
      totalWidth * 0.22, // Componente
      totalWidth * 0.12, // Peso (%)
      totalWidth * 0.34, // Driver de Mercado
      totalWidth * 0.16, // Variação (%)
      totalWidth * 0.16, // Contribuição (p.p.)
    ];
  }

  // 7. Indicadores / Cenários / Projeções (4 colunas: Indicador, Valor, Tendência/Data, Leitura)
  if (numCols === 4 && (hJoined.includes('indicador') || hJoined.includes('leitura') || hJoined.includes('tendência') || hJoined.includes('tendencia'))) {
    return [totalWidth * 0.28, totalWidth * 0.22, totalWidth * 0.26, totalWidth * 0.24];
  }

  // Fallback: Distribuição uniforme
  return Array(numCols).fill(totalWidth / numCols);
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
          .map((c) => cleanText(c))
          .filter(Boolean);
        if (rowCells.length > 0) {
          // Garante que não é uma linha divisória repetida |:---|:---|
          if (!rowCells.every((c) => /^[-:\s]+$/.test(c))) {
            rows.push(rowCells);
          }
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

  // Identifica onde começa o conteúdo real do boletim (a primeira seção ## )
  // Tudo antes do primeiro '## ' é metadado de capa (título, subtítulo, big numbers)
  // que já foi desenhado com perfeição visual na Capa (Página 1).
  let startIndex = 0;
  const firstSectionIdx = lines.findIndex((l) => l.trim().startsWith('## '));
  if (firstSectionIdx !== -1) {
    startIndex = firstSectionIdx;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Ignora linhas divisórias horizontais do markdown (---, ***, ___)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___' || /^[-*_]{3,}$/.test(trimmed)) {
      continue;
    }

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
  doc.setFontSize(shouldCost.length > 8 ? 17 : 22);
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
  doc.setFontSize(gap.length > 10 ? 15 : gap.length > 6 ? 18 : 22);
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
  doc.setFontSize(trend.length > 10 ? 15 : trend.length > 6 ? 18 : 22);
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
  doc.setFontSize(cleanTopic.length > 30 ? 7 : 8);
  doc.setTextColor(255, 255, 255);
  const catLines = doc.splitTextToSize(cleanTopic, tileW - 8);
  if (catLines.length > 1) {
    doc.text(catLines[0], margin + 12, metaY + 23.5);
    doc.text(catLines[1], margin + 12, metaY + 27);
  } else {
    doc.text(catLines[0] || cleanTopic, margin + 12, metaY + 25);
  }

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
      // Renderização dinâmica de tabelas em vetorial limpo com multi-linha e larguras inteligentes
      const { headers, rows } = block.tableData;
      const numCols = headers.length;
      if (numCols === 0) continue;

      const colWidths = calculateColumnWidths(headers, contentWidth);
      const headerLines = headers.map((h, cIdx) =>
        doc.splitTextToSize(h, (colWidths[cIdx] || contentWidth / numCols) - 4)
      );
      const maxHeaderLines = Math.max(...headerLines.map((l) => l.length), 1);
      const headerH = Math.max(7.5, maxHeaderLines * 3.8 + 3.5);

      checkPageBreak(headerH + Math.min(rows.length, 2) * 8 + 8);

      // Cabeçalho da Tabela
      doc.setFillColor(...C.plurixRoyal);
      doc.rect(margin, y, contentWidth, headerH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      let curHeadX = margin;
      headers.forEach((_, cIdx) => {
        const w = colWidths[cIdx] || contentWidth / numCols;
        const linesH = headerLines[cIdx];
        doc.text(linesH, curHeadX + 2.5, y + 4.5);
        curHeadX += w;
      });
      y += headerH;

      // Linhas de dados da Tabela
      rows.forEach((r, rIdx) => {
        const rowCellsLines = r.map((cell, cIdx) => {
          const w = colWidths[cIdx] || contentWidth / numCols;
          return doc.splitTextToSize(cell || '', w - 4);
        });
        const maxCellLines = Math.max(...rowCellsLines.map((l) => l.length), 1);
        const lineHeight = 3.5;
        const currentRowH = Math.max(6.8, maxCellLines * lineHeight + 3.2);

        checkPageBreak(currentRowH + 2);

        doc.setFillColor(...(rIdx % 2 === 1 ? C.rowAlt : C.surfaceWhite));
        doc.rect(margin, y, contentWidth, currentRowH, 'F');

        doc.setDrawColor(...C.borderDivider);
        doc.setLineWidth(0.2);
        doc.line(margin, y + currentRowH, margin + contentWidth, y + currentRowH);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...C.textPrimary);

        let curRowX = margin;
        r.forEach((_, cIdx) => {
          const w = colWidths[cIdx] || contentWidth / numCols;
          if (cIdx < numCols) {
            const cellLines = rowCellsLines[cIdx];
            doc.text(cellLines, curRowX + 2.5, y + 4.2);
          }
          curRowX += w;
        });
        y += currentRowH;
      });

      y += 5;
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
