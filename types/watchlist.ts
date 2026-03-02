export type AssetType = 'stock' | 'crypto';

export interface WatchlistItem {
  symbol: string;
  type: AssetType;
  addedAt: string;
}

export interface Watchlist {
  items: WatchlistItem[];
}

export const DEFAULT_WATCHLIST: Watchlist = {
  items: [
    { symbol: 'AAPL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'MSFT', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'GOOGL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'AMZN', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'TSLA', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'BINANCE:BTCUSDT', type: 'crypto', addedAt: new Date().toISOString() },
    { symbol: 'BINANCE:ETHUSDT', type: 'crypto', addedAt: new Date().toISOString() },
  ],
};
