import { NextRequest, NextResponse } from 'next/server';
import { calculateShouldCost, validateWeights, CostComponent } from '@/lib/calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { components, requestedAdjustment } = body;

    if (!components || !Array.isArray(components)) {
      return NextResponse.json(
        { error: 'Componentes inválidos: envie uma lista de componentes de custo.' },
        { status: 400 }
      );
    }

    const typedComponents: CostComponent[] = components.map((c: any) => ({
      name: String(c.name || 'Componente'),
      weight: Number(c.weight || 0),
      driverName: String(c.driverName || 'Driver'),
      driverVariation: Number(c.driverVariation || 0),
    }));

    const result = calculateShouldCost(
      typedComponents,
      typeof requestedAdjustment === 'number' ? requestedAdjustment : undefined
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na rota /api/calculate:', error);
    return NextResponse.json(
      { error: 'Erro ao executar o cálculo determinístico.' },
      { status: 500 }
    );
  }
}
