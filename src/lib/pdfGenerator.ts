import { jsPDF } from 'jspdf';

interface GeneratePdfOptions {
  title?: string;
  topic?: string;
  markdownContent: string;
  sources?: { title: string; url: string }[];
}

/**
 * Paleta corporativa Plurix Design System & Benchmark Executivo:
 */
const C = {
  darkNavy: [11, 25, 56] as [number, number, number],    // #0B1938 - Capa e destaques executivos
  navy: [0, 20, 125] as [number, number, number],        // #00147D - Cor primária Plurix
  orange: [234, 88, 12] as [number, number, number],      // #EA580C - Laranja institucional
  orangeLight: [249, 115, 22] as [number, number, number],// #F97316 - Destaque nos Big Numbers
  orangeSubtle: [253, 186, 116] as [number, number, number],
  pos: [16, 185, 129] as [number, number, number],       // #10B981 - Alívio / Sucesso
  neg: [220, 38, 38] as [number, number, number],        // #DC2626 - Risco / Alerta
  blueDriver: [59, 130, 246] as [number, number, number],// #3B82F6 - Drivers secundários
  text: [26, 42, 56] as [number, number, number],        // #1A2A38 - Texto principal
  muted: [100, 116, 139] as [number, number, number],    // #64748B - Texto secundário
  card: [244, 250, 254] as [number, number, number],     // #F4FAFE - Fundo suave de cards
  surface: [255, 255, 255] as [number, number, number],  // #FFFFFF - Branco puro
  brd: [184, 216, 232] as [number, number, number],      // #B8D8E8 - Borda suave
  brd2: [226, 232, 240] as [number, number, number],     // #E2E8F0 - Divisor
  bg: [248, 250, 252] as [number, number, number],       // #F8FAFC - Linhas alternadas
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.orange);
    doc.text('PLURIX  ·  INTELIGÊNCIA DE CUSTOS', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(`${cleanTopic} · Outubro 2026`, margin + contentWidth, 12, { align: 'right' });

    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.3);
    doc.line(margin, 15, margin + contentWidth, 15);
  };

  // Helper para desenhar o rodapé padrão das páginas 2 a 9
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text('Uso interno Plurix · Compras Indiretas · Dados até 08/10/2026', margin, pageHeight - 7);
    doc.text(`${pageNum} / 9`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  };

  // ==========================================
  // PÁGINA 1: CAPA EXECUTIVA (BENCHMARK DESIGN)
  // ==========================================

  // Bloco Superior em Dark Navy (#0B1938)
  doc.setFillColor(...C.darkNavy);
  doc.rect(0, 0, pageWidth, 210, 'F');

  // Badge da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('P L U R I X   ·   C O M P R A S   I N D I R E T A S', margin, 32);

  // Pílula com contorno laranja
  doc.setDrawColor(...C.orange);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, 38, 70, 7, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.orangeLight);
  doc.text('BOLETIM DE INTELIGÊNCIA DE CUSTOS', margin + 4, 42.8);

  // Título Principal da Capa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanTopic, margin, 74);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225); // #CBD5E1
  const subtitleLines = doc.splitTextToSize(
    'Análise de mercado, composição de custo e estratégia de negociação da sacola camiseta PEAD entregue nos caixas de todas as lojas e operações da rede Plurix.',
    contentWidth - 10
  );
  doc.text(subtitleLines, margin, 90);

  // Linhas de acento laranjas acima dos Big Numbers
  const cardY = 135;
  const colW = (contentWidth - 16) / 3;

  doc.setFillColor(...C.orange);
  doc.rect(margin, cardY - 8, colW, 1.2, 'F');
  doc.rect(margin + colW + 8, cardY - 8, colW, 1.2, 'F');
  doc.rect(margin + (colW + 8) * 2, cardY - 8, colW, 1.2, 'F');

  // Big Number 1: 21,1%
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...C.orangeLight);
  doc.text('21,1%', margin, cardY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('reajuste teórico', margin, cardY + 20);
  doc.text('em 12 meses', margin, cardY + 25);

  // Big Number 2: 6,9 p.p.
  const col2X = margin + colW + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('6,9 p.p.', col2X, cardY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('do pedido sem', col2X, cardY + 20);
  doc.text('lastro em custo', col2X, cardY + 25);

  // Big Number 3: -2,0%
  const col3X = margin + (colW + 8) * 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('-2,0%', col3X, cardY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('custo esperado nos', col3X, cardY + 20);
  doc.text('próximos 12 meses', col3X, cardY + 25);

  // Faixa inferior da Capa
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 210, pageWidth, pageHeight - 210, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Edição de outubro de 2026  ·  Dados primários até 08/10/2026', margin, pageHeight - 12);
  doc.text('Uso interno  ·  v1.0', margin + contentWidth, pageHeight - 12, { align: 'right' });

  // ==========================================
  // PÁGINA 2: 01 · RESUMO EXECUTIVO
  // ==========================================
  doc.addPage();
  drawPageHeader(2);

  let y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('01 · RESUMO EXECUTIVO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  const headline = 'O custo da sacolinha subiu cerca de 21% em 12 meses; um pedido de 28% fixo não se sustenta';
  const headlineLines = doc.splitTextToSize(headline, contentWidth);
  doc.text(headlineLines, margin, y);
  y += headlineLines.length * 5 + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  const introP = doc.splitTextToSize(
    'A alta veio da resina e da energia, não da inflação geral. Para frente, o consenso aponta leve alívio, mas o petróleo voltou a US$ 104 em 08/10. Por isso, o preço deve acompanhar o custo por fórmula, e não ficar travado no pico.',
    contentWidth
  );
  doc.text(introP, margin, y);
  y += introP.length * 4 + 4;

  // Card de RECOMENDAÇÃO (Dark Navy #0B1938)
  const recH = 34;
  doc.setFillColor(...C.darkNavy);
  doc.roundedRect(margin, y, contentWidth, recH, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.orange);
  doc.text('RECOMENDAÇÃO', margin + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Conceder no máximo o reajuste teórico (~21%), por fórmula paramétrica com', margin + 6, y + 12);
  doc.text('revisão trimestral — não como preço fixo de 12 meses.', margin + 6, y + 16.5);

  // 3 Mini-boxes de recomendação
  const miniW = (contentWidth - 20) / 3;
  const miniY = y + 20;

  // Mini 1: Timing
  doc.setFillColor(26, 42, 74);
  doc.roundedRect(margin + 4, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.orangeLight);
  doc.text('Timing', margin + 7, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Fechar após o 2º turno (25/10)', margin + 7, miniY + 7.5);

  // Mini 2: Contrato
  doc.setFillColor(26, 42, 74);
  doc.roundedRect(margin + 4 + miniW + 4, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.orangeLight);
  doc.text('Contrato', margin + 4 + miniW + 7, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('6 meses, gatilho de ±5%', margin + 4 + miniW + 7, miniY + 7.5);

  // Mini 3: Tendência
  doc.setFillColor(26, 42, 74);
  doc.roundedRect(margin + 4 + (miniW + 4) * 2, miniY, miniW, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.orangeLight);
  doc.text('Tendência', margin + 4 + (miniW + 4) * 2 + 3, miniY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Alta já ocorrida; estável à frente', margin + 4 + (miniW + 4) * 2 + 3, miniY + 7.5);

  y += recH + 6;

  // 4 Cards de KPIs em Linha
  const kpiW = (contentWidth - 9) / 4;
  const kpiH = 24;

  const kpis = [
    { label: 'RESINA PE · 12M', val: '^ ~30%', desc: 'estimativa em R$; choque Oriente Médio', valColor: C.orange },
    { label: 'REAJUSTE TEÓRICO', val: '21,1%', desc: 'faixa de 18,1% a 27,1%', valColor: C.text },
    { label: 'PEDIDO FORNECEDOR', val: '28,0%', desc: 'hipotético, para ilustrar', valColor: C.text },
    { label: 'ESPAÇO NEGOCIAÇÃO', val: '6,9 p.p.', desc: 'pedido menos teórico', valColor: C.orange },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = margin + idx * (kpiW + 3);
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.brd2);
    doc.roundedRect(kx, y, kpiW, kpiH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(kpi.label, kx + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...kpi.valColor);
    doc.text(kpi.val, kx + 3, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    const descLines = doc.splitTextToSize(kpi.desc, kpiW - 6);
    doc.text(descLines, kx + 3, y + 18.5);
  });

  y += kpiH + 6;

  // 3 Colunas: "Três coisas para levar à mesa"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.text);
  doc.text('Três coisas para levar à mesa', margin, y);
  y += 4.5;

  const mesaColW = (contentWidth - 8) / 3;
  const mesaCards = [
    {
      title: 'Resina explica 18 dos 21 p.p.',
      text: 'Energia, frete, mão de obra e aditivos somam só 3 p.p. A margem do fornecedor não tem driver para subir.',
    },
    {
      title: 'O pico já passou uma vez',
      text: 'A resina subiu até 80% em abril e corrigiu em maio-junho. Travar 12 meses agora é pagar o pico.',
    },
    {
      title: 'O real forte ajuda',
      text: 'O dólar caiu ~8% no ano, para R$ 4,99, e reduz o custo em reais da resina cotada em dólar.',
    },
  ];

  mesaCards.forEach((mc, idx) => {
    const mx = margin + idx * (mesaColW + 4);
    doc.setFillColor(...C.surface);
    doc.setDrawColor(...C.brd);
    doc.roundedRect(mx, y, mesaColW, 26, 1.5, 1.5, 'FD');

    // Acento lateral
    doc.setFillColor(...C.orange);
    doc.rect(mx, y, 1.5, 26, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.text);
    doc.text(mc.title, mx + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    const bodyLines = doc.splitTextToSize(mc.text, mesaColW - 7);
    doc.text(bodyLines, mx + 4, y + 12);
  });

  y += 32;

  // Box de Premissas
  doc.setFillColor(...C.bg);
  doc.setDrawColor(...C.brd2);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');
  doc.setFillColor(...C.orange);
  doc.rect(margin, y, 1.8, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.text);
  doc.text('Premissas do modelo:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  const premText = doc.splitTextToSize(
    'Sacola camiseta PEAD 30x40 cm, impressão 1 cor, fornecedor homologado no Paraná, compra consolidada de todas as lojas e operações da rede Plurix, último reajuste em out/2025. O pedido de 28% é hipotético para efeito de auditoria; substitua pelo pedido real para refazer a análise de mesa.',
    contentWidth - 8
  );
  doc.text(premText, margin + 4, y + 9.5);

  drawPageFooter(2);

  // ==========================================
  // PÁGINA 3: 02 · MERCADO E CADEIA DE VALOR
  // ==========================================
  doc.addPage();
  drawPageHeader(3);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('02 · MERCADO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  const mktHeadline = 'A resina vem de um quase-monopólio nacional, protegido por antidumping';
  doc.text(doc.splitTextToSize(mktHeadline, contentWidth), margin, y);
  y += 11;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  const mktText = doc.splitTextToSize(
    'A sacolinha é filme soprado de polietileno de alta densidade (PEAD), cortado e impresso por transformadores regionais. O transformador tem pouco poder sobre a matéria-prima — e isso define a mesa de negociação.',
    contentWidth
  );
  doc.text(mktText, margin, y);
  y += mktText.length * 4 + 6;

  // Tabela da Cadeia de Valor
  const chainCols = [32, 86, 60]; // Elo (32mm), Situação (86mm), Efeito (60mm) = 178mm
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('ELO DA CADEIA', margin + 2, y + 4.8);
  doc.text('SITUAÇÃO EM 2026', margin + 34, y + 4.8);
  doc.text('EFEITO PARA A PLURIX', margin + 120, y + 4.8);
  y += 7;

  const chainRows = [
    {
      elo: 'Petróleo e nafta',
      sit: 'Brent saiu de US$ 72 (27/02) para picos de US$ 120 em março; nafta na América Latina praticamente dobrou desde o início do conflito no Oriente Médio.',
      efeito: 'Custo de base da resina disparou.',
    },
    {
      elo: 'Resina PE',
      sit: 'Braskem é a principal produtora nacional; em abril aplicou +R$ 8.000/t em duas fases, com fornecimento limitado a 35% da intenção de compra.',
      efeito: 'Repasse rápido e risco de falta temporária.',
    },
    {
      elo: 'Importação de resina',
      sit: 'Antidumping definitivo de US$ 199,04/t (EUA) e US$ 238,49/t (Canadá) por 5 anos, em vigor desde 26/03/2026.',
      efeito: 'Alternativa importada mais cara na fronteira.',
    },
    {
      elo: 'Transformador',
      sit: 'Resina é 55% a 70% do custo de fabricação de filmes plásticos como a sacolinha; margens de conversão comprimidas.',
      efeito: 'Vai tentar repassar tudo e recompor margem.',
    },
    {
      elo: 'Varejo (Plurix)',
      sit: 'Item de alto volume, baixa diferenciação, com muitos fornecedores transformadores regionais homologáveis.',
      efeito: 'Poder de compra alto se o volume corporativo unificado for consolidado.',
    },
  ];

  chainRows.forEach((row, rIdx) => {
    const sitLines = doc.splitTextToSize(row.sit, chainCols[1] - 4);
    const efeitoLines = doc.splitTextToSize(row.efeito, chainCols[2] - 4);
    const maxL = Math.max(sitLines.length, efeitoLines.length, 1);
    const rowH = Math.max(12, maxL * 3.8 + 4);

    doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.text);
    doc.text(row.elo, margin + 2, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(sitLines, margin + 34, y + 4.5);
    doc.text(efeitoLines, margin + 120, y + 4.5);

    y += rowH;
  });

  y += 8;

  // Callout Box de Risco da Braskem
  doc.setFillColor(...C.card);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');
  doc.setFillColor(...C.neg);
  doc.rect(margin, y, 2, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.neg);
  doc.text('Risco de oferta na cadeia petroquímica:', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.text);
  const braskemText = doc.splitTextToSize(
    'A Braskem reestruturou US$ 3,7 bilhões em dívida em junho e protocolou recuperação extrajudicial em agosto de 2026. Esse movimento limita novos investimentos de capacidade no curto prazo e reforça a postura defensiva dos preços de resina no mercado nacional.',
    contentWidth - 10
  );
  doc.text(braskemText, margin + 5, y + 10.5);

  drawPageFooter(3);

  // ==========================================
  // PÁGINA 4: 03 · COMPOSIÇÃO DE CUSTO & 04 · DRIVERS
  // ==========================================
  doc.addPage();
  drawPageHeader(4);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('03 · COMPOSIÇÃO DE CUSTO', margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  doc.text('Resina é 60% do preço da sacolinha; energia e frete somam outros 12%', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Composição estimada do preço, %  ·  e o índice que move cada parte', margin, y);
  y += 6;

  // --- GRÁFICO VETORIAL 1: BARRAS HORIZONTAIS DE COMPOSIÇÃO DE PREÇO ---
  const compBars = [
    { name: 'Resina PEAD', desc: 'Preço do PE em R$', pct: 60, color: C.orange },
    { name: 'Overhead e margem', desc: 'Fixo (sem driver de alta)', pct: 14, color: C.muted },
    { name: 'Mão de obra', desc: 'INPC / dissídio', pct: 9, color: [148, 163, 184] as [number, number, number] },
    { name: 'Energia elétrica', desc: 'Tarifa AT Copel / concessionárias', pct: 7, color: [148, 163, 184] as [number, number, number] },
    { name: 'Aditivos e pigmentos', desc: 'Proxy IPCA', pct: 5, color: [203, 213, 225] as [number, number, number] },
    { name: 'Frete', desc: 'Diesel S10 ANP', pct: 5, color: [203, 213, 225] as [number, number, number] },
  ];

  const maxBarW = 105;
  compBars.forEach((cb) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.text);
    doc.text(cb.name, margin, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(cb.desc, margin, y + 6.5);

    // Barra vetorial
    const barW = (cb.pct / 65) * maxBarW;
    doc.setFillColor(...cb.color);
    doc.roundedRect(margin + 52, y + 1, barW, 4.5, 1, 1, 'F');

    // Rótulo numérico
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...cb.color);
    doc.text(`${cb.pct}%`, margin + 55 + barW, y + 4.5);

    y += 8.5;
  });

  y += 6;

  // Seção 04 · DRIVERS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('04 · DRIVERS: HISTÓRICO E SITUAÇÃO ATUAL', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.text);
  doc.text('Três drivers concentram a alta; o real forte é o único alívio', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Resina, energia e diesel subiram 20% a 30%; mão de obra, só 4% (Variação acumulada em 12 meses)', margin, y);
  y += 7;

  // --- GRÁFICO VETORIAL 2: BARRAS HORIZONTAIS DE VARIAÇÃO DOS DRIVERS ---
  const driverBars = [
    { name: 'Resina PE em R$ (estimativa)', val: '+30,0%', num: 30.0, color: C.orange },
    { name: 'Energia alta tensão Copel', val: '+21,9%', num: 21.9, color: C.blueDriver },
    { name: 'Diesel S10 ANP (desde jan/26)', val: '+20,5%', num: 20.5, color: C.blueDriver },
    { name: 'IPCA 12 meses (inflação oficial)', val: '+4,2%', num: 4.2, color: C.muted },
    { name: 'INPC 12 meses (mão de obra)', val: '+4,0%', num: 4.0, color: C.muted },
    { name: 'Dólar PTAX (no ano)', val: '-8,1%', num: -8.1, color: C.pos },
  ];

  const zeroX = margin + 68; // Ponto zero no gráfico
  const scale = 2.4; // mm por ponto percentual

  // Linha do zero
  doc.setDrawColor(...C.brd2);
  doc.setLineWidth(0.4);
  doc.line(zeroX, y - 2, zeroX, y + driverBars.length * 7.5 + 2);

  // Linha guia vertical da inflação oficial (IPCA 4,2%)
  const ipcaGuideX = zeroX + 4.2 * scale;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(ipcaGuideX, y - 3, ipcaGuideX, y + driverBars.length * 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...C.muted);
  doc.text('inflação oficial (IPCA) +4,2%', ipcaGuideX + 1, y - 4);

  driverBars.forEach((db) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.text);
    doc.text(db.name, margin, y + 4);

    if (db.num >= 0) {
      const bw = db.num * scale;
      doc.setFillColor(...db.color);
      doc.roundedRect(zeroX, y + 1, bw, 4.2, 0.8, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...db.color);
      doc.text(db.val, zeroX + bw + 2, y + 4.2);
    } else {
      const bw = Math.abs(db.num) * scale;
      doc.setFillColor(...db.color);
      doc.roundedRect(zeroX - bw, y + 1, bw, 4.2, 0.8, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...db.color);
      doc.text(db.val, zeroX - bw - 11, y + 4.2);
    }

    y += 7.5;
  });

  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  const narrativeD = doc.splitTextToSize(
    'A resina teve dois choques em 2026: o pico de março-abril, com correção em maio-junho, e nova alta a partir de julho, com a Dow anunciando +US$ 220/t na América Latina para 1º/08. A valorização do real frente ao dólar (-8,1%) foi o único vetor que amortizou a disparada das cotações internacionais.',
    contentWidth
  );
  doc.text(narrativeD, margin, y);

  drawPageFooter(4);

  // ==========================================
  // PÁGINA 5: 05 · PROJEÇÕES E CENÁRIOS
  // ==========================================
  doc.addPage();
  drawPageHeader(5);

  y = 22;

  // Tabela: Situação Atual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  doc.text('Situação atual dos indicadores', margin, y);
  y += 4;

  const sitCols = [30, 26, 26, 96]; // 178mm
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('INDICADOR', margin + 2, y + 4.5);
  doc.text('ÚLTIMO VALOR', margin + 32, y + 4.5);
  doc.text('DATA', margin + 58, y + 4.5);
  doc.text('LEITURA ECONÔMICA', margin + 84, y + 4.5);
  y += 6.5;

  const sitRows = [
    { ind: 'Brent', val: 'US$ 104,13/bbl', dt: '08/10/2026', tag: 'PRESSÃO', leit: 'maior desde 24/09, novas ameaças ao Irã e Ormuz', tagColor: C.neg },
    { ind: 'Dólar PTAX', val: 'R$ 4,99', dt: '07/10/2026', tag: 'ALÍVIO', leit: 'real perto da mínima do ano, segurando insumos importados', tagColor: C.pos },
    { ind: 'Diesel S10', val: 'R$ 7,35/L', dt: '03/10/2026', tag: 'PRESSÃO', leit: 'máxima desde abril, pressão em fretes de transferência', tagColor: C.neg },
    { ind: 'Selic', val: '13,75% a.a.', dt: 'set/2026', tag: 'ESTÁVEL', leit: '5 cortes seguidos, estabilidade no custo financeiro', tagColor: C.muted },
    { ind: 'IPCA 12m', val: '4,22%', dt: 'ago/2026', tag: 'ESTÁVEL', leit: 'acima do centro da meta mas controlado', tagColor: C.muted },
    { ind: 'Focus IPCA 2026', val: '5,01% ^ (3)', dt: '05/10/2026', tag: 'ALTA', leit: '3 semanas seguidas de revisão altista no mercado', tagColor: C.orange },
  ];

  sitRows.forEach((sr, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.text);
    doc.text(sr.ind, margin + 2, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.text(sr.val, margin + 32, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(sr.dt, margin + 58, y + 4.2);

    // Pill de leitura
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...sr.tagColor);
    doc.text(sr.tag, margin + 84, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(`  ${sr.leit}`, margin + 100, y + 4.2);

    y += 6;
  });

  y += 9;

  // Seção 05 · PROJEÇÕES E CENÁRIOS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('05 · PROJEÇÕES E CENÁRIOS', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.text);
  doc.text('Próximos 12 meses: custo estável (-2%), em uma faixa de -9% a +11%', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Brent em US$ 104: base de 12 meses em US$ 90, mas o risco vai a US$ 115 (Brent, US$/barril realizados e cenários)', margin, y);
  y += 8;

  // --- GRÁFICO VETORIAL 3: CENÁRIOS DO BRENT (LINHA E LEQUE DE PROJEÇÃO) ---
  const chartBoxX = margin;
  const chartBoxY = y;
  const chartBoxW = contentWidth;
  const chartBoxH = 65;

  doc.setFillColor(...C.bg);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(chartBoxX, chartBoxY, chartBoxW, chartBoxH, 2, 2, 'FD');

  // Eixo Y (Valores de 60 a 120 US$/barril)
  const yLabels = [120, 100, 80, 60];
  yLabels.forEach((val, i) => {
    const gy = chartBoxY + 12 + i * 14;
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.2);
    doc.line(chartBoxX + 14, gy, chartBoxX + chartBoxW - 10, gy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(String(val), chartBoxX + 6, gy + 1.5);
  });

  // Linha divisória Realizado vs Projeção
  const projDivX = chartBoxX + 85;
  doc.setDrawColor(180, 190, 200);
  doc.setLineWidth(0.4);
  doc.line(projDivX, chartBoxY + 6, projDivX, chartBoxY + chartBoxH - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...C.muted);
  doc.text('REALIZADO', projDivX - 20, chartBoxY + 8);
  doc.text('PROJEÇÃO', projDivX + 4, chartBoxY + 8);

  // Pontos Realizados:
  // jan/26: 72 -> X=35, Y= (120-72)/(60)*42 = 33.6 -> y= chartBoxY + 12 + 33.6
  // mar/26 (pico): 118 -> X=50, Y= (120-118)/60*42 = 1.4 -> y= chartBoxY + 13.4
  // jul/26 (mínima): 79 -> X=68, Y= (120-79)/60*42 = 28.7 -> y= chartBoxY + 40.7
  // out/26 (hoje): 104 -> X=85, Y= (120-104)/60*42 = 11.2 -> y= chartBoxY + 23.2

  const p1 = { x: chartBoxX + 30, y: chartBoxY + 45.6 }; // 72
  const p2 = { x: chartBoxX + 48, y: chartBoxY + 13.4 }; // 118
  const p3 = { x: chartBoxX + 66, y: chartBoxY + 40.7 }; // 79
  const p4 = { x: projDivX, y: chartBoxY + 23.2 };       // 104 (hoje)

  // Desenha linha histórica sólida
  doc.setDrawColor(...C.darkNavy);
  doc.setLineWidth(1.2);
  doc.line(p1.x, p1.y, p2.x, p2.y);
  doc.line(p2.x, p2.y, p3.x, p3.y);
  doc.line(p3.x, p3.y, p4.x, p4.y);

  // Marcadores de ponto
  doc.setFillColor(...C.darkNavy);
  [p1, p2, p3, p4].forEach((p) => doc.circle(p.x, p.y, 1.2, 'F'));

  // Rótulos do histórico
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...C.text);
  doc.text('pré-guerra US$ 72', p1.x - 14, p1.y + 4);
  doc.text('pico mar/26 US$ 118', p2.x - 12, p2.y - 3);
  doc.text('mínima jul/26 US$ 79', p3.x - 8, p3.y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.orange);
  doc.text('hoje US$ 104', p4.x + 2, p4.y - 3);

  // Projeção Leque (Pontilhado para out/2027 em X=chartBoxX + 155):
  const pEndBase = { x: chartBoxX + 150, y: chartBoxY + 33.0 };  // US$ 90 (Base)
  const pEndDesf = { x: chartBoxX + 150, y: chartBoxY + 15.5 };  // US$ 115 (Desfavorável)
  const pEndFav = { x: chartBoxX + 150, y: chartBoxY + 43.5 };   // US$ 75 (Favorável)

  // Área sombreada do leque
  doc.setFillColor(254, 243, 199); // amarelo bem claro
  doc.triangle(p4.x, p4.y, pEndDesf.x, pEndDesf.y, pEndFav.x, pEndFav.y, 'F');

  // Linhas dos cenários
  doc.setDrawColor(...C.neg);
  doc.setLineWidth(0.7);
  doc.line(p4.x, p4.y, pEndDesf.x, pEndDesf.y);

  doc.setDrawColor(...C.orange);
  doc.setLineWidth(0.8);
  doc.line(p4.x, p4.y, pEndBase.x, pEndBase.y);

  doc.setDrawColor(...C.pos);
  doc.setLineWidth(0.7);
  doc.line(p4.x, p4.y, pEndFav.x, pEndFav.y);

  // Marcadores finais
  doc.setFillColor(...C.neg);
  doc.circle(pEndDesf.x, pEndDesf.y, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...C.neg);
  doc.text('desfavorável US$ 115', pEndDesf.x + 3, pEndDesf.y + 1);

  doc.setFillColor(...C.orange);
  doc.circle(pEndBase.x, pEndBase.y, 1.2, 'F');
  doc.setTextColor(...C.orange);
  doc.text('base US$ 90', pEndBase.x + 3, pEndBase.y + 1);

  doc.setFillColor(...C.pos);
  doc.circle(pEndFav.x, pEndFav.y, 1.2, 'F');
  doc.setTextColor(...C.pos);
  doc.text('favorável US$ 75', pEndFav.x + 3, pEndFav.y + 1);

  // Linha de referência Banco Mundial
  doc.setDrawColor(140, 150, 160);
  doc.setLineWidth(0.3);
  doc.line(projDivX + 15, chartBoxY + 47, chartBoxX + 148, chartBoxY + 47);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...C.muted);
  doc.text('Banco Mundial (abr/26): média 2027 US$ 70', projDivX + 16, chartBoxY + 45.5);

  drawPageFooter(5);

  // ==========================================
  // PÁGINA 6: 06 · IMPACTO NO PREÇO (WATERFALL)
  // ==========================================
  doc.addPage();
  drawPageHeader(6);

  y = 22;

  // Tabela: Projeção por Driver — 12 Meses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  doc.text('Projeção por driver — 12 meses', margin, y);
  y += 4;

  const projCols = [30, 22, 24, 24, 26, 52]; // 178mm
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('DRIVER', margin + 2, y + 4.2);
  doc.text('HOJE', margin + 32, y + 4.2);
  doc.text('BASE 12M', margin + 54, y + 4.2);
  doc.text('FAVORÁVEL', margin + 78, y + 4.2);
  doc.text('DESFAVORÁVEL', margin + 102, y + 4.2);
  doc.text('FONTE PRIMÁRIA', margin + 128, y + 4.2);
  y += 6;

  const projRows = [
    { d: 'Resina PE (R$)', h: '~+30%', b: '-5%', f: '-15%', df: '+15%', src: 'Estimativa: Brent + câmbio Focus' },
    { d: 'Dólar PTAX', h: 'R$ 4,99', b: 'R$ 5,20-5,28', f: 'R$ 5,00', df: 'R$ 5,60', src: 'Focus Bacen 21/09/2026' },
    { d: 'Energia AT', h: '+21,9%', b: '+5%', f: '+4%', df: '+12%', src: 'Desfav. inclui diferimento Copel' },
    { d: 'Diesel S10', h: 'R$ 7,35', b: '0%', f: '-8%', df: '+10%', src: 'Defasagem recorde Petrobras' },
    { d: 'Mão de obra', h: '3,98%', b: '4,5%', f: '4,0%', df: '6,0%', src: 'Focus IPCA 2027 + ganho real' },
    { d: 'Aditivos', h: '4,22%', b: '4,3%', f: '3,5%', df: '5,0%', src: 'Focus IPCA 2027 (4,30%)' },
    { d: 'Preço da sacola', h: '21,1%', b: '-2,0%', f: '-8,6%', df: '+11,1%', src: 'Soma ponderada pelos pesos', isTotal: true },
  ];

  projRows.forEach((pr, idx) => {
    doc.setFillColor(pr.isTotal ? 254 : idx % 2 === 0 ? 255 : 248, pr.isTotal ? 243 : 250, pr.isTotal ? 199 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

    doc.setFont('helvetica', pr.isTotal ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(pr.isTotal ? C.orange[0] : C.text[0], pr.isTotal ? C.orange[1] : C.text[1], pr.isTotal ? C.orange[2] : C.text[2]);
    doc.text(pr.d, margin + 2, y + 3.8);
    doc.text(pr.h, margin + 32, y + 3.8);
    doc.text(pr.b, margin + 54, y + 3.8);
    doc.text(pr.f, margin + 78, y + 3.8);
    doc.text(pr.df, margin + 102, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(pr.src, margin + 128, y + 3.8);

    y += 5.5;
  });

  y += 8;

  // Seção 06 · IMPACTO NO PREÇO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('06 · IMPACTO NO PREÇO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...C.text);
  doc.text('A resina sozinha justifica 18 p.p.; o resto do custo soma 3 p.p.', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Custo explica 21,1% de reajuste; 6,9 p.p. do pedido não têm lastro (Contribuição peso x variação, p.p.)', margin, y);
  y += 8;

  // --- GRÁFICO VETORIAL 4: WATERFALL / CASCATA DE CONTRIBUIÇÃO EM P.P. ---
  const wfBoxX = margin;
  const wfBoxY = y;
  const wfBoxW = contentWidth;
  const wfBoxH = 68;

  doc.setFillColor(...C.bg);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(wfBoxX, wfBoxY, wfBoxW, wfBoxH, 2, 2, 'FD');

  const baseLineY = wfBoxY + 54;
  doc.setDrawColor(...C.brd2);
  doc.setLineWidth(0.4);
  doc.line(wfBoxX + 10, baseLineY, wfBoxX + wfBoxW - 10, baseLineY);

  const wfCols = [
    { label: 'Resina', val: '+18,0', h: 36, color: C.orange, isSum: false },
    { label: 'Energia', val: '+1,5', h: 6, color: [251, 146, 60] as [number, number, number], isSum: false },
    { label: 'Frete', val: '+1,0', h: 4, color: [251, 146, 60] as [number, number, number], isSum: false },
    { label: 'Mão de obra', val: '+0,4', h: 2.5, color: [253, 186, 116] as [number, number, number], isSum: false },
    { label: 'Aditivos', val: '+0,2', h: 1.8, color: [254, 215, 170] as [number, number, number], isSum: false },
    { label: 'Margem', val: '+0,0', h: 0.5, color: [226, 232, 240] as [number, number, number], isSum: false },
    { label: 'Teórico', val: '21,1%', h: 42.2, color: C.darkNavy, isSum: true },
    { label: 'Pedido', val: '28,0%', h: 52, color: [254, 226, 226] as [number, number, number], isPedido: true },
  ];

  const colWidth = 14;
  const colGap = 7;
  const startX = wfBoxX + 14;

  wfCols.forEach((wc, i) => {
    const cx = startX + i * (colWidth + colGap);
    const cy = baseLineY - wc.h;

    if (wc.isPedido) {
      // Barra pontilhada do pedido
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(cx, cy, colWidth, wc.h, 1, 1, 'F');
      doc.setDrawColor(...C.neg);
      doc.setLineWidth(0.5);
      doc.roundedRect(cx, cy, colWidth, wc.h, 1, 1, 'S');
    } else {
      doc.setFillColor(...wc.color);
      doc.roundedRect(cx, cy, colWidth, wc.h, 1, 1, 'F');
    }

    // Valor acima da barra
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(wc.isSum || wc.isPedido ? 8 : 7);
    doc.setTextColor(wc.isPedido ? C.neg[0] : wc.isSum ? C.darkNavy[0] : C.orange[0], wc.isPedido ? C.neg[1] : wc.isSum ? C.darkNavy[1] : C.orange[1], wc.isPedido ? C.neg[2] : wc.isSum ? C.darkNavy[2] : C.orange[2]);
    doc.text(wc.val, cx + colWidth / 2, cy - 2, { align: 'center' });

    // Nome abaixo da barra
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(wc.label, cx + colWidth / 2, baseLineY + 4, { align: 'center' });
  });

  // Chave / Delta com "6,9 p.p. sem lastro"
  const teoricoTopY = baseLineY - 42.2;
  const pedidoTopY = baseLineY - 52;
  const bracketX = startX + 7 * (colWidth + colGap) + colWidth + 3;

  doc.setDrawColor(...C.neg);
  doc.setLineWidth(0.6);
  doc.line(bracketX, pedidoTopY, bracketX + 3, pedidoTopY);
  doc.line(bracketX + 3, pedidoTopY, bracketX + 3, teoricoTopY);
  doc.line(bracketX, teoricoTopY, bracketX + 3, teoricoTopY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.neg);
  doc.text('6,9 p.p.', bracketX + 5, (pedidoTopY + teoricoTopY) / 2 - 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('sem lastro', bracketX + 5, (pedidoTopY + teoricoTopY) / 2 + 2.5);
  doc.text('em custo', bracketX + 5, (pedidoTopY + teoricoTopY) / 2 + 5.5);

  drawPageFooter(6);

  // ==========================================
  // PÁGINA 7: 07 · RISCOS E MATRIZ 2X2
  // ==========================================
  doc.addPage();
  drawPageHeader(7);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('07 · RISCOS', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  doc.text('Dois riscos pedem proteção em contrato: Ormuz e falta de resina', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text('Matriz de riscos para o custo da sacolinha (Vermelho = risco de alta · verde = chance de queda)', margin, y);
  y += 8;

  // --- GRÁFICO VETORIAL 5: MATRIZ DE RISCOS 2X2 ---
  const mBoxX = margin;
  const mBoxY = y;
  const mBoxW = contentWidth;
  const mBoxH = 68;
  const halfW = mBoxW / 2;
  const halfH = mBoxH / 2;

  // 4 Quadrantes
  // Q1: Superior Esquerdo (TER PLANO B)
  doc.setFillColor(240, 253, 244); // verde bem suave
  doc.rect(mBoxX, mBoxY, halfW, halfH, 'F');

  // Q2: Superior Direito (PROTEGER NO CONTRATO)
  doc.setFillColor(254, 242, 242); // vermelho suave
  doc.rect(mBoxX + halfW, mBoxY, halfW, halfH, 'F');

  // Q3: Inferior Esquerdo (SÓ ACOMPANHAR)
  doc.setFillColor(248, 250, 252); // cinza suave
  doc.rect(mBoxX, mBoxY + halfH, halfW, halfH, 'F');

  // Q4: Inferior Direito (ABSORVER NA FÓRMULA)
  doc.setFillColor(255, 251, 235); // amarelo suave
  doc.rect(mBoxX + halfW, mBoxY + halfH, halfW, halfH, 'F');

  // Linhas divisórias da matriz
  doc.setDrawColor(...C.brd);
  doc.setLineWidth(0.4);
  doc.line(mBoxX, mBoxY + halfH, mBoxX + mBoxW, mBoxY + halfH);
  doc.line(mBoxX + halfW, mBoxY, mBoxX + halfW, mBoxY + mBoxH);
  doc.roundedRect(mBoxX, mBoxY, mBoxW, mBoxH, 1.5, 1.5, 'S');

  // Títulos dos Quadrantes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);

  doc.setTextColor(...C.muted);
  doc.text('TER PLANO B', mBoxX + 4, mBoxY + 6);

  doc.setTextColor(...C.neg);
  doc.text('PROTEGER NO CONTRATO', mBoxX + halfW + 4, mBoxY + 6);

  doc.setTextColor(...C.muted);
  doc.text('SÓ ACOMPANHAR', mBoxX + 4, mBoxY + halfH + 6);

  doc.setTextColor(...C.orange);
  doc.text('ABSORVER NA FÓRMULA', mBoxX + halfW + 4, mBoxY + halfH + 6);

  // Pontos e Textos dos Riscos
  // Q1
  doc.setFillColor(...C.pos);
  doc.circle(mBoxX + 24, mBoxY + 16, 1.2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...C.text);
  doc.text('Acordo rápido e Ormuz normalizado', mBoxX + 28, mBoxY + 16.5);

  // Q2
  doc.setFillColor(...C.neg);
  doc.circle(mBoxX + halfW + 10, mBoxY + 14, 1.2, 'F');
  doc.text('Escalada em Ormuz, Brent > US$ 115', mBoxX + halfW + 14, mBoxY + 14.5);

  doc.circle(mBoxX + halfW + 10, mBoxY + 23, 1.2, 'F');
  doc.text('Racionamento de resina (Braskem)', mBoxX + halfW + 14, mBoxY + 23.5);

  // Q3
  doc.setFillColor(...C.neg);
  doc.circle(mBoxX + 12, mBoxY + halfH + 14, 1.2, 'F');
  doc.text('Nova lei municipal de sacolas', mBoxX + 16, mBoxY + halfH + 14.5);

  doc.circle(mBoxX + 12, mBoxY + halfH + 22, 1.2, 'F');
  doc.text('Antidumping de PE ampliado', mBoxX + 16, mBoxY + halfH + 22.5);

  // Q4
  doc.setFillColor(...C.neg);
  doc.circle(mBoxX + halfW + 12, mBoxY + halfH + 12, 1.2, 'F');
  doc.text('Real mais fraco após a eleição', mBoxX + halfW + 16, mBoxY + halfH + 12.5);

  doc.circle(mBoxX + halfW + 24, mBoxY + halfH + 19, 1.2, 'F');
  doc.text('Devolução diferimento Copel (2027)', mBoxX + halfW + 28, mBoxY + halfH + 19.5);

  doc.circle(mBoxX + halfW + 36, mBoxY + halfH + 26, 1.2, 'F');
  doc.text('Petrobras reajusta diesel', mBoxX + halfW + 40, mBoxY + halfH + 26.5);

  y += mBoxH + 8;

  // Tabela: Sinais a monitorar por fator
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.text);
  doc.text('Sinais a monitorar por fator', margin, y);
  y += 4;

  const rCols = [38, 38, 102];
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 5.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('FATOR', margin + 2, y + 3.8);
  doc.text('ONDE AGE', margin + 40, y + 3.8);
  doc.text('SINAL A MONITORAR', margin + 78, y + 3.8);
  y += 5.5;

  const rRows = [
    { f: 'Escalada em Ormuz', o: 'Mundo · Brent, nafta, PE', s: 'Brent acima de US$ 110 por 2 semanas; ataques a navios petroleiros' },
    { f: 'Racionamento de resina', o: 'Brasil · oferta de PE', s: 'Cartas da Braskem com limite de volume; prazos de entrega ampliados' },
    { f: 'Câmbio pós-eleição', o: 'Brasil · PE em R$', s: 'PTAX acima de R$ 5,30; Focus após 25/10' },
    { f: 'Diferimento Copel', o: 'Brasil · energia', s: 'Pauta da ANEEL para jun/2027' },
    { f: 'Diesel', o: 'Brasil · frete', s: 'Reajuste da Petrobras; fim de subsídios' },
    { f: 'Acordo Oriente Médio', o: 'Mundo · queda do Brent', s: 'Reabertura de rotas marítimas; Brent abaixo de US$ 85' },
  ];

  rRows.forEach((rr, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.text);
    doc.text(rr.f, margin + 2, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(rr.o, margin + 40, y + 3.8);
    doc.text(rr.s, margin + 78, y + 3.8);

    y += 5.5;
  });

  drawPageFooter(7);

  // ==========================================
  // PÁGINA 8: 08 · ESTRATÉGIA DE NEGOCIAÇÃO
  // ==========================================
  doc.addPage();
  drawPageHeader(8);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('08 · ESTRATÉGIA DE NEGOCIAÇÃO', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.text);
  doc.text('Aceitar o custo real, recusar o pico travado por 12 meses', margin, y);
  y += 7;

  // 4 Balizas em Destaque
  const bW = (contentWidth - 9) / 4;
  const bH = 22;
  const stratBalizas = [
    { label: 'ABERTURA', val: '18%', desc: 'piso da faixa teórica' },
    { label: 'META', val: '21%', desc: 'reajuste teórico justo' },
    { label: 'TETO', val: '23%', desc: 'só com fórmula de revisão' },
    { label: 'PRAZO', val: '6 meses', desc: 'revisão trimestral, gatilho ±5%' },
  ];

  stratBalizas.forEach((sb, idx) => {
    const bx = margin + idx * (bW + 3);
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.brd2);
    doc.roundedRect(bx, y, bW, bH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(sb.label, bx + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.text);
    doc.text(sb.val, bx + 3, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.muted);
    doc.text(sb.desc, bx + 3, y + 18);
  });

  y += bH + 6;

  // Cláusula Paramétrica Formal em Card Dark Navy (#0B1938)
  const formulaH = 24;
  doc.setFillColor(...C.darkNavy);
  doc.roundedRect(margin, y, contentWidth, formulaH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.orange);
  doc.text('CLÁUSULA DE REAJUSTE PARAMÉTRICA (PRONTA PARA CONTRATO)', margin + 6, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('P_t = P_0 * [ 0,60*(PE_t/PE_0) + 0,07*(EN_t/EN_0) + 0,09*(INPC_t/INPC_0) + 0,05*(IPCA_t/IPCA_0) + 0,05*(DIESEL_t/DIESEL_0) + 0,14 ]', margin + 6, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(203, 213, 225);
  doc.text('PE = PEAD em R$/kg (nota de compra ou índice Braskem) · EN = Tarifa Copel · DIESEL = S10 ANP · 0,14 fixo · Teto/Piso ±10% por trimestre.', margin + 6, y + 18.5);

  y += formulaH + 6;

  // 2 Colunas: Argumentos com números & Alternativas (BATNA)
  const halfColW = (contentWidth - 6) / 2;

  // Coluna 1: Argumentos
  doc.setFillColor(...C.surface);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(margin, y, halfColW, 40, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  doc.text('Argumentos com números para a mesa', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  const argsList = [
    '1. O reajuste teórico é 21,1%; o pedido de 28% tem 6,9 p.p. sem lastro em custo.',
    '2. Overhead e margem (14% do preço) não têm motivo para subir.',
    '3. O real valorizou ~8% no ano, reduzindo o custo em reais da resina importada.',
    '4. Banco Mundial projeta Brent em US$ 70 em 2027. Travar no pico transfere risco só para a Plurix.',
  ];
  let ay = y + 10;
  argsList.forEach((arg) => {
    const l = doc.splitTextToSize(arg, halfColW - 8);
    doc.text(l, margin + 4, ay);
    ay += l.length * 3.2 + 1.5;
  });

  // Coluna 2: Alternativas (BATNA)
  const batnaX = margin + halfColW + 6;
  doc.setFillColor(...C.surface);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(batnaX, y, halfColW, 40, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  doc.text('Alternativas de negociação (BATNA)', batnaX + 4, y + 5.5);

  const batnaList = [
    '• Consolidar demanda corporativa da rede Plurix e cotar 2–3 transformadores regionais.',
    '• Revisar especificação: espessura (-1 a -2 microns), impressão 1 cor ou sem impressão.',
    '• Reduzir consumo via incentivo à sacola retornável conforme legislação da praça.',
    '• Cotar sacolinha importada pronta na fronteira como balizador de teto.',
  ];
  let by = y + 10;
  batnaList.forEach((batna) => {
    const l = doc.splitTextToSize(batna, halfColW - 8);
    doc.text(l, batnaX + 4, by);
    by += l.length * 3.2 + 1.5;
  });

  y += 44;

  // Tabela: Objeções esperadas e respostas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.text);
  doc.text('Objeções esperadas e respostas técnicas', margin, y);
  y += 4;

  const objCols = [58, 120];
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OBJEÇÃO DO FORNECEDOR', margin + 2, y + 3.8);
  doc.text('RESPOSTA TÉCNICA DO COMPRADOR', margin + 60, y + 3.8);
  y += 5.5;

  const objRows = [
    { o: '"A resina subiu 80% no ano."', r: 'Subiu até 80% no pico de abril e corrigiu em maio-junho; o acumulado de 12 meses ponderado em R$ é ~30%.' },
    { o: '"Precisamos de preço fixo para planejar."', r: 'A fórmula paramétrica dá previsibilidade nos dois sentidos e protege o fornecedor se o Brent passar de US$ 115.' },
    { o: '"A energia elétrica subiu 22%."', r: 'Correto e reconhecido: pesa apenas 7% na estrutura, impactando 1,5 p.p. no cálculo final.' },
    { o: '"Falta resina, o mercado está racionado."', r: 'Por isso propomos volume firme e consolidado de toda a rede Plurix em troca da adesão à fórmula.' },
  ];

  objRows.forEach((obr, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.text);
    doc.text(obr.o, margin + 2, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(obr.r, margin + 60, y + 3.8);

    y += 5.5;
  });

  drawPageFooter(8);

  // ==========================================
  // PÁGINA 9: 09 · FONTES E MÉTODO
  // ==========================================
  doc.addPage();
  drawPageHeader(9);

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.orange);
  doc.text('09 · FONTES E MÉTODO', margin, y);
  y += 6;

  // Tabela: Fontes Auditadas
  const fCols = [42, 110, 26];
  doc.setFillColor(...C.darkNavy);
  doc.rect(margin, y, contentWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FONTE', margin + 2, y + 4.5);
  doc.text('DADO USADO', margin + 44, y + 4.5);
  doc.text('DATA', margin + 154, y + 4.5);
  y += 6.5;

  const fontRows = [
    { f: 'Forbes Brasil — Focus', d: 'IPCA 2026 5,01% e 2027 4,30%; Selic 13,50% (2026) e 12% (2027); IPCA 12m 4,22%', dt: '05/10/2026' },
    { f: 'Exame — Focus', d: 'Dólar R$ 5,20 (2026) e R$ 5,28 (2027)', dt: '21/09/2026' },
    { f: 'O Tempo / Reuters', d: 'Brent US$ 104,13; US$ 108,23 em 24/09', dt: '08/10/2026' },
    { f: 'Banco Mundial — CMO', d: 'Brent US$ 86 (2026) e US$ 70 (2027); risco US$ 95–115', dt: 'abr/2026' },
    { f: 'PlásticoNews / ICIS', d: 'Cronologia do Brent, PE +40% a/a em US$, antidumping, peso da resina', dt: '25/07/2026' },
    { f: 'SIMPEP / ABIPLAST', d: 'Braskem +R$ 8.000/t; PE até +80% no ciclo', dt: 'abr/2026' },
    { f: 'ANEEL / Copel', d: 'Alta tensão +21,87%; diferimento -8,26%', dt: '24/06/2026' },
    { f: 'ANP (Reuters) / Ineep', d: 'Diesel S10 R$ 7,35/L; R$ 6,10/L em jan/2026', dt: '02/10/2026' },
    { f: 'IBGE SIDRA', d: 'INPC 12m 3,98% e IPCA 12m oficial', dt: 'ago/2026' },
    { f: 'InfoMoney / Bacen', d: 'Dólar ~R$ 5,40 no início de 2026; PTAX R$ 4,9935', dt: '07/10/2026' },
  ];

  fontRows.forEach((fr, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(...C.brd2);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.text);
    doc.text(fr.f, margin + 2, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(fr.d, margin + 44, y + 4.2);
    doc.text(fr.dt, margin + 154, y + 4.2);

    y += 6;
  });

  y += 10;

  // Caixa Metodológica Oficial
  doc.setFillColor(...C.bg);
  doc.setDrawColor(...C.brd);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');
  doc.setFillColor(...C.orange);
  doc.rect(margin, y, 2, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.text);
  doc.text('Nota metodológica e governança de alçadas:', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  const metodoText = doc.splitTextToSize(
    'Método: reajuste teórico = Σ (peso × variação do driver). A variação da resina em reais (~30%) é estimativa fundamentada: ~40% a/a em dólar (Dow / ICIS), descontada a valorização de ~8% do real no período.\nGlossário: a/a = contra o mesmo período do ano anterior; p.p. = pontos percentuais; PEAD = polietileno de alta densidade.\nEste boletim consolida inteligência econômica para apoio à tomada de decisão de Compras Indiretas; a decisão final e aprovação segue rigorosamente a política de alçadas da Plurix.',
    contentWidth - 10
  );
  doc.text(metodoText, margin + 5, y + 12);

  drawPageFooter(9);

  // Download automático com nome limpo
  const safeFilename = `Boletim_Inteligencia_Custos_${cleanTopic
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30)}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(safeFilename);
}
