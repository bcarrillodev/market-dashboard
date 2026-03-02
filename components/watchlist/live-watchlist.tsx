'use client';

import { usePolling } from '@/hooks/use-polling';
import { getQuotes } from '@/app/actions/quotes';
import { WatchlistItem } from '@/types/watchlist';
import { Quote } from '@/types/finnhub';
import { WatchlistRow } from './watchlist-row';
import { ThemedCard } from '@/components/ui/themed-card';

interface LiveWatchlistProps {
  symbols: WatchlistItem[];
  initialQuotes?: (Quote | null)[];
}

export function LiveWatchlist({ symbols, initialQuotes }: LiveWatchlistProps) {
  const symbolStrings = symbols.map(s => s.symbol);
  
  const { data: quotes, isLoading } = usePolling<Record<string, Quote>>({
    fetchFn: () => getQuotes(symbolStrings),
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
