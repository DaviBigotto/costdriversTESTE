import { NextRequest, NextResponse } from 'next/server';
import { calculateShouldCost, validateWeights, CostComponent } from '@/lib/calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { components, category, requestedAdjustment, supplierClaim } = body;
    const finalRequestedAdjustment = typeof requestedAdjustment === 'number' 
      ? requestedAdjustment 
      : (typeof supplierClaim === 'number' ? supplierClaim : undefined);

    let rawComponents = components;
    if ((!rawComponents || !Array.isArray(rawComponents)) && category) {
      const { COST_BREAKDOWN_LIBRARY } = await import('@/lib/knowledge');
      const catData = COST_BREAKDOWN_LIBRARY.find((c: any) => 
        c.category.toLowerCase().includes(String(category).toLowerCase()) ||
        (c.keywords && c.keywords.some((k: string) => String(category).toLowerCase().includes(k.toLowerCase())))
      );
      if (catData && catData.components) {
        rawComponents = catData.components.map((c: any) => {
          // Extrai variação numérica caso exista no texto do driver (ex: "+30%", "+21,9%")
          let variation = 0;
          const match = c.driver ? c.driver.match(/([+-]?\d+([.,]\d+)?)\s*%/) : null;
          if (match) {
            variation = parseFloat(match[1].replace(',', '.'));
          }
          return {
            name: c.name,
            weight: c.defaultWeight || 0,
            driverName: c.driver || 'Driver Primário',
            driverVariation: variation,
          };
        });
      }
    }

    if (!rawComponents || !Array.isArray(rawComponents)) {
      return NextResponse.json(
        { error: 'Componentes inválidos: envie uma lista de componentes de custo ou uma categoria válida.' },
        { status: 400 }
      );
    }

    const typedComponents: CostComponent[] = rawComponents.map((c: any) => ({
      name: String(c.name || 'Componente'),
      weight: Number(c.weight || 0),
      driverName: String(c.driverName || c.driver || 'Driver'),
      driverVariation: Number(c.driverVariation ?? c.variation12m ?? c.variation ?? 0),
    }));

    const result = calculateShouldCost(
      typedComponents,
      finalRequestedAdjustment
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
