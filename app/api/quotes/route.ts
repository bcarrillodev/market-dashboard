import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/app/actions/quotes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const symbols = Array.isArray(body?.symbols)
      ? body.symbols.filter((symbol: unknown): symbol is string => typeof symbol === 'string' && symbol.trim().length > 0)
      : [];

    if (symbols.length === 0) {
      return NextResponse.json({ quotes: {} });
    }

    const quotes = await getQuotes(symbols);

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Failed to fetch dashboard quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
