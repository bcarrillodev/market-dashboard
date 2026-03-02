'use client';

import { useState, useCallback, useEffect } from 'react';
import { searchStockSymbols } from '@/app/actions/quotes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemedCard } from '@/components/ui/themed-card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check } from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ symbol: string; description: string; type: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, isLoaded } = useWatchlist();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchStockSymbols(searchQuery);
      setResults(data.result.map(r => ({
        symbol: r.symbol,
        description: r.description,
        type: r.type || 'stock'
      })));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, search]);

  const handleAddToWatchlist = (symbol: string, type: 'stock' | 'crypto') => {
    if (isInWatchlist(symbol, type)) {
      removeFromWatchlist(symbol, type);
    } else {
      addToWatchlist(symbol, type);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Stocks</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for stocks, ETFs, or crypto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-300 border-r-transparent" />
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <ThemedCard className="p-4">
          <div className="space-y-2">
            {results.map((result) => {
              const type: 'stock' | 'crypto' = result.type === 'crypto' ? 'crypto' : 'stock';
              const inWatchlist = isInWatchlist(result.symbol, type);

              return (
                <div
                  key={result.symbol}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Link href={`/${type === 'crypto' ? 'crypto' : 'stock'}/${result.symbol}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                        type === 'crypto'
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                      )}>
                        {result.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm">{result.symbol}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Badge variant={type === 'crypto' ? 'secondary' : 'default'}>
                      {type}
                    </Badge>
                    <Button
                      size="sm"
                      variant={inWatchlist ? 'secondary' : 'default'}
                      onClick={() => handleAddToWatchlist(result.symbol, type)}
                      disabled={!isLoaded}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ThemedCard>
      )}

      {!isLoading && query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {!query.trim() && (
        <ThemedCard className="p-8 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Enter a stock symbol or company name to search
          </p>
        </ThemedCard>
      )}
    </div>
  );
}
