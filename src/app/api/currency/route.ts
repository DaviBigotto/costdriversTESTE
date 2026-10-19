import { NextResponse } from 'next/server';
import { getLiveCurrencyRates } from '@/lib/currency';

export async function GET() {
  try {
    const rates = await getLiveCurrencyRates();
    if (!rates) {
      return NextResponse.json(
        { error: 'Não foi possível obter cotações da AwesomeAPI no momento.' },
        { status: 503 }
      );
    }
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Erro na rota /api/currency:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar serviço de câmbio.' },
      { status: 500 }
    );
  }
}
