import { NextRequest, NextResponse } from 'next/server';
import { generateBulletinContent } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, contextHistory } = body;

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return NextResponse.json(
        { error: 'O tema do boletim é obrigatório.' },
        { status: 400 }
      );
    }

    const response = await generateBulletinContent(topic.trim(), contextHistory);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro na rota /api/bulletin:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar o boletim temático.' },
      { status: 500 }
    );
  }
}
