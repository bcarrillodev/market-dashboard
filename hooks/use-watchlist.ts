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
      if (prev.items.some(item => item.symbol === symbol && item.type === type)) return prev;
      
      return {
        ...prev,
        items: [...prev.items, { symbol, type, addedAt: new Date().toISOString() }]
      };
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    setWatchlist(prev => ({
      ...prev,
      items: prev.items.filter(item => !(item.symbol === symbol && item.type === type))
    }));
  }, []);

  const isInWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    return watchlist?.items?.some(item => item.symbol === symbol && item.type === type) || false;
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
