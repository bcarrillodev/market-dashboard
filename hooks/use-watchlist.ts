'use client';

import { useState, useEffect, useCallback } from 'react';
import { Watchlist, WatchlistItem, DEFAULT_WATCHLIST } from '@/types/watchlist';

const STORAGE_KEY = 'market-dashboard-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Watchlist>(DEFAULT_WATCHLIST);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addToWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    setWatchlist(prev => {
      const key = type === 'stock' ? 'stocks' : 'crypto';
      if (prev[key].some(item => item.symbol === symbol)) return prev;
      
      return {
        ...prev,
        [key]: [...prev[key], { symbol, type, addedAt: new Date().toISOString() }]
      };
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    setWatchlist(prev => ({
      ...prev,
      [type === 'stock' ? 'stocks' : 'crypto']: prev[type === 'stock' ? 'stocks' : 'crypto']
        .filter(item => item.symbol !== symbol)
    }));
  }, []);

  const isInWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    const key = type === 'stock' ? 'stocks' : 'crypto';
    return watchlist[key].some(item => item.symbol === symbol);
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
