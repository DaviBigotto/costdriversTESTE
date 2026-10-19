import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatHandler } from './route';

describe('Rota de API /api/chat', () => {
  it('deve rejeitar requisições sem array de mensagens', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('o campo "messages" deve ser uma lista não vazia');
  });

  it('deve retornar mensagem transparente quando GEMINI_API_KEY não estiver configurada', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Qual o impacto do dólar em embalagens?' }],
      }),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.text).toContain('Atenção: Chave de API não configurada');
    expect(data.text).toContain('GEMINI_API_KEY');

    process.env.GEMINI_API_KEY = originalKey;
  });
});
