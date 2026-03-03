'use client';

import { LiveWatchlist } from '@/components/watchlist/live-watchlist';
import { useWatchlist } from '@/hooks/use-watchlist';

export function LiveWatchlistClient() {
  const { watchlist, isLoaded } = useWatchlist();

  if (!isLoaded) {
    return <div>Loading watchlist...</div>;
  }

  if (watchlist.items.length === 0) {
    return <div className="text-sm text-muted-foreground">Your watchlist is empty.</div>;
  }

  return <LiveWatchlist symbols={watchlist.items} />;
}
