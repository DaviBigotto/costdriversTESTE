import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import * as currencyLib from '@/lib/currency';

describe('GET /api/currency', () => {
  it('returns currency rates with status 200 when available', async () => {
    vi.spyOn(currencyLib, 'getLiveCurrencyRates').mockResolvedValueOnce({
      usd: {
        code: 'USD',
        name: 'Dólar Americano/Real Brasileiro',
        bid: 5.045,
        ask: 5.0454,
        high: 5.0645,
        low: 5.0432,
        pctChange: -0.38,
        varBid: -0.0195,
        rawDate: '2026-10-19 09:09:49',
        formattedDate: '19/10/2026 09:09:49',
      },
      fetchedAt: Date.now(),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.usd).toBeDefined();
    expect(data.usd.bid).toBe(5.045);
  });

  it('returns 503 if currency service is unavailable', async () => {
    vi.spyOn(currencyLib, 'getLiveCurrencyRates').mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
