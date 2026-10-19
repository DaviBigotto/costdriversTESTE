import { NextRequest, NextResponse } from 'next/server';
import { generateEconomistResponse, ChatMessage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, topic } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Formato inválido: o campo "messages" deve ser uma lista não vazia.' },
        { status: 400 }
      );
    }

    // Validação básica dos itens de mensagem
    const sanitizedMessages: ChatMessage[] = messages
      .filter((m: any) => m && typeof m.content === 'string' && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        content: String(m.content).trim(),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma mensagem válida com conteúdo foi informada.' },
        { status: 400 }
      );
    }

    const response = await generateEconomistResponse(sanitizedMessages, topic);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro na rota /api/chat:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a resposta do Economista de Compras.' },
      { status: 500 }
    );
  }
}
