import type { AssetType } from '@/types/watchlist';

const CRYPTO_EXCHANGE = 'BINANCE';
const CRYPTO_QUOTE = 'USDT';

export function normalizeSymbol(symbol: string, type: AssetType): string {
  const trimmedSymbol = symbol.trim().toUpperCase();

  if (type !== 'crypto') {
    return trimmedSymbol;
  }

  return trimmedSymbol.includes(':') ? trimmedSymbol : `${CRYPTO_EXCHANGE}:${trimmedSymbol}`;
}

export function getDisplaySymbol(symbol: string, type: AssetType): string {
  const normalizedSymbol = normalizeSymbol(symbol, type);

  if (type !== 'crypto') {
    return normalizedSymbol;
  }

  return normalizedSymbol.replace(`${CRYPTO_EXCHANGE}:`, '');
}

export function getAssetHref(type: AssetType, symbol: string): string {
  const routeSymbol = type === 'crypto' ? getDisplaySymbol(symbol, type) : normalizeSymbol(symbol, type);

  return `/${type === 'crypto' ? 'crypto' : 'stock'}/${routeSymbol}`;
}

export function getCryptoBaseSymbol(symbol: string): string {
  const normalizedSymbol = normalizeSymbol(symbol, 'crypto');
  const pairSymbol = normalizedSymbol.split(':')[1] ?? normalizedSymbol;

  return pairSymbol.endsWith(CRYPTO_QUOTE)
    ? pairSymbol.slice(0, -CRYPTO_QUOTE.length)
    : pairSymbol;
}
