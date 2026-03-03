'use client';

import Link from 'next/link';
import { WatchlistItem } from '@/types/watchlist';
import { Quote } from '@/types/finnhub';
import { NumberDisplay } from '@/components/ui/number-display';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetHref, getDisplaySymbol } from '@/lib/symbols';

interface WatchlistRowProps {
  item: WatchlistItem;
  quote?: Quote;
  isLoading?: boolean;
}

export function WatchlistRow({ item, quote, isLoading }: WatchlistRowProps) {
  const hasPrice = typeof quote?.c === 'number' && Number.isFinite(quote.c);
  const hasPercentChange = typeof quote?.dp === 'number' && Number.isFinite(quote.dp);
  const isPositive = hasPercentChange ? quote.dp >= 0 : false;
  const isNegative = hasPercentChange ? quote.dp < 0 : false;

  // Format symbol for display (remove BINANCE: prefix for crypto)
  const displaySymbol = getDisplaySymbol(item.symbol, item.type);

  return (
    <Link 
      href={getAssetHref(item.type, item.symbol)}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
        "hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
          item.type === 'crypto' 
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        )}>
          {displaySymbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{displaySymbol}</h3>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            item.type === 'crypto'
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
          )}>
            {item.type}
          </span>
        </div>
      </div>

      <div className="text-right">
        {isLoading ? (
          <div className="space-y-1">
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          </div>
        ) : !hasPrice ? (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Quote unavailable</div>
            <div className="text-xs text-muted-foreground">Try again later</div>
          </div>
        ) : (
          <>
            <NumberDisplay 
              value={quote.c.toFixed(2)} 
              prefix="$" 
              size="md"
              className="block"
            />
            <div className="flex items-center gap-1 justify-end">
              {hasPercentChange ? (
                <>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-500" />
                  )}
                  <NumberDisplay 
                    value={`${isPositive ? '+' : ''}${quote.dp.toFixed(2)}%`}
                    positive={isPositive}
                    negative={isNegative}
                    size="sm"
                  />
                </>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
