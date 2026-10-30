import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatHandler } from './route';
import { isSimpleGreeting } from '@/lib/gemini';

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

  describe('Detecção de Saudações Sociais Simples (isSimpleGreeting)', () => {
    it('deve identificar cumprimentos sociais simples como verdadeiros', () => {
      expect(isSimpleGreeting('bom dia')).toBe(true);
      expect(isSimpleGreeting('Bom dia!')).toBe(true);
      expect(isSimpleGreeting('boa tarde')).toBe(true);
      expect(isSimpleGreeting('boa noite')).toBe(true);
      expect(isSimpleGreeting('olá')).toBe(true);
      expect(isSimpleGreeting('ola!')).toBe(true);
      expect(isSimpleGreeting('oi')).toBe(true);
      expect(isSimpleGreeting('oie')).toBe(true);
      expect(isSimpleGreeting('tudo bem?')).toBe(true);
      expect(isSimpleGreeting('como vai?')).toBe(true);
      expect(isSimpleGreeting('e aí')).toBe(true);
      expect(isSimpleGreeting('opa bom dia')).toBe(true);
      expect(isSimpleGreeting('oi tudo bem')).toBe(true);
    });

    it('deve rejeitar mensagens que contenham dúvidas ou demandas reais de compras', () => {
      expect(isSimpleGreeting('bom dia, qual a cotação do dólar?')).toBe(false);
      expect(isSimpleGreeting('quanto está o diesel?')).toBe(false);
      expect(isSimpleGreeting('reajuste de embalagens')).toBe(false);
      expect(isSimpleGreeting('dólar hoje')).toBe(false);
      expect(isSimpleGreeting('/reajuste sacolas 8%')).toBe(false);
    });
  });
});
