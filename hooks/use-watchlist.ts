'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssetType, Watchlist, WatchlistItem, DEFAULT_WATCHLIST } from '@/types/watchlist';
import { normalizeSymbol } from '@/lib/symbols';

const STORAGE_KEY = 'market-dashboard-watchlist';

function normalizeWatchlistItem(item: WatchlistItem): WatchlistItem {
  return {
    ...item,
    symbol: normalizeSymbol(item.symbol, item.type),
  };
}

function sanitizeWatchlist(watchlist: Watchlist): Watchlist {
  const seen = new Set<string>();
  const items = watchlist.items.reduce<WatchlistItem[]>((acc, item) => {
    const normalizedItem = normalizeWatchlistItem(item);
    const key = `${normalizedItem.type}:${normalizedItem.symbol}`;

    if (seen.has(key)) {
      return acc;
    }

    seen.add(key);
    acc.push(normalizedItem);
    return acc;
  }, []);

  return { items };
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Watchlist>(DEFAULT_WATCHLIST);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(sanitizeWatchlist(JSON.parse(stored)));
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
    const normalizedSymbol = normalizeSymbol(symbol, type);

    setWatchlist(prev => {
      if (prev.items.some(item => item.symbol === normalizedSymbol && item.type === type)) return prev;

      return {
        ...prev,
        items: [...prev.items, { symbol: normalizedSymbol, type, addedAt: new Date().toISOString() }]
      };
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    const normalizedSymbol = normalizeSymbol(symbol, type);

    setWatchlist(prev => ({
      ...prev,
      items: prev.items.filter(item => !(item.symbol === normalizedSymbol && item.type === type))
    }));
  }, []);

  const isInWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    const normalizedSymbol = normalizeSymbol(symbol, type);

    return watchlist.items.some(item => item.symbol === normalizedSymbol && item.type === type);
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
