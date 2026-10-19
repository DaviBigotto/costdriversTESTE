import { NextResponse } from 'next/server';
import { getMacroeconomicPanel } from '@/lib/indicators';

export async function GET() {
  try {
    const panel = await getMacroeconomicPanel();
    return NextResponse.json(panel);
  } catch (error) {
    console.error('Erro na rota /api/indicators:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar painel de indicadores macroeconômicos.' },
      { status: 500 }
    );
  }
}
