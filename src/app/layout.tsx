import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Economista de Compras — Plurix Hub',
  description:
    'Assistente conversacional de inteligência econômica, análise de cost drivers e estratégias de negociação para Compras Indiretas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
