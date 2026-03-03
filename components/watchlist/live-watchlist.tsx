'use client';

import { usePolling } from '@/hooks/use-polling';
import { WatchlistItem } from '@/types/watchlist';
import { Quote } from '@/types/finnhub';
import { WatchlistRow } from './watchlist-row';

interface LiveWatchlistProps {
  symbols: WatchlistItem[];
  initialQuotes?: (Quote | null)[];
}

async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbols }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch quotes: ${response.status}`);
  }

  const payload = (await response.json()) as { quotes?: Record<string, Quote> };
  return payload.quotes ?? {};
}

export function LiveWatchlist({ symbols, initialQuotes }: LiveWatchlistProps) {
  const symbolStrings = symbols.map(s => s.symbol);
  
  const { data: quotes, isLoading } = usePolling<Record<string, Quote>>({
    fetchFn: () => fetchQuotes(symbolStrings),
    interval: 15000,
    enabled: symbols.length > 0,
  });

  // Merge initial quotes with polled quotes
  const mergedQuotes: Record<string, Quote> = {};
  
  // Add initial quotes
  if (initialQuotes) {
    symbols.forEach((item, index) => {
      const quote = initialQuotes[index];
      if (quote) {
        mergedQuotes[item.symbol] = quote;
      }
    });
  }
  
  // Override with polled quotes
  if (quotes) {
    Object.assign(mergedQuotes, quotes);
  }

  return (
    <div className="space-y-2">
      {symbols.map(item => (
        <WatchlistRow
          key={item.symbol}
          item={item}
          quote={mergedQuotes[item.symbol]}
          isLoading={isLoading && !mergedQuotes[item.symbol]}
        />
      ))}
    </div>
  );
}
