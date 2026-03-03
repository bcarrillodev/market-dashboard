'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface WatchlistButtonProps {
  symbol: string;
  type: 'stock' | 'crypto';
}

export function WatchlistButton({ symbol, type }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isLoaded } = useWatchlist();
  
  const inWatchlist = isInWatchlist(symbol, type);

  const handleClick = () => {
    if (inWatchlist) {
      removeFromWatchlist(symbol, type);
    } else {
      addToWatchlist(symbol, type);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        className={`flex-1 ${inWatchlist 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-cyan-400 hover:bg-cyan-500 text-black'}`}
        onClick={handleClick}
        disabled={!isLoaded}
      >
        {inWatchlist ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
        {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </Button>
    </div>
  );
}
