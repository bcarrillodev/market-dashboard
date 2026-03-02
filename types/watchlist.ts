export type AssetType = 'stock' | 'crypto';

export interface WatchlistItem {
  symbol: string;
  type: AssetType;
  addedAt: string;
}

export interface Watchlist {
  stocks: WatchlistItem[];
  crypto: WatchlistItem[];
}

export const DEFAULT_WATCHLIST: Watchlist = {
  stocks: [
    { symbol: 'AAPL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'MSFT', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'GOOGL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'AMZN', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'TSLA', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'BINANCE:BTCUSDT', type: 'crypto', addedAt: new Date().toISOString() },
  ],
  crypto: [
    { symbol: 'BINANCE:BTCUSDT', type: 'crypto', addedAt: new Date().toISOString() },
    { symbol: 'BINANCE:ETHUSDT', type: 'crypto', addedAt: new Date().toISOString() },
  ],
};
