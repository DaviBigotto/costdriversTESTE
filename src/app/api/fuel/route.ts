import { NextResponse } from 'next/server';
import { getFuelPriceReport } from '@/lib/fuel';

export async function GET() {
  try {
    const report = await getFuelPriceReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error('Erro na rota /api/fuel:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar preços de combustível.' },
      { status: 500 }
    );
  }
}
