import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as calculateHandler } from './route';

describe('Rota de API /api/calculate', () => {
  it('deve retornar 400 se os componentes não forem enviados', async () => {
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await calculateHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Componentes inválidos');
  });

  it('deve calcular corretamente a variação teórica agregada e a diferença para o reajuste pedido', async () => {
    const payload = {
      components: [
        { name: 'Mão de Obra', weight: 75, driverName: 'Dissídio', driverVariation: 6.0 },
        { name: 'Insumos', weight: 10, driverName: 'IPCA', driverVariation: 4.0 },
        { name: 'Equipamentos', weight: 5, driverName: 'IPCA', driverVariation: 3.0 },
        { name: 'Tributos/Margem', weight: 10, driverName: 'Fixo', driverVariation: 0.0 },
      ],
      requestedAdjustment: 9.0,
    };

    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await calculateHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.isValid).toBe(true);
    // 75*6% = 4.5; 10*4% = 0.4; 5*3% = 0.15; Total = 5.05%
    expect(data.aggregatedTheoreticalVariation).toBe(5.05);
    // 9.0 - 5.05 = 3.95 p.p.
    expect(data.differencePercentagePoints).toBe(3.95);
    expect(data.summaryText).toContain('supera o reajuste teórico ponderado em 3.95 pontos percentuais');
  });
});
