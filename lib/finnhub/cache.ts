import { cache } from 'react';
import { FinnhubError } from './error-handler';
import type {
  Quote,
  CompanyProfile,
  CandleData,
  NewsItem,
  BasicFinancials,
  Financials,
  RecommendationTrend,
  SearchResult,
  EarningsItem,
  IPOCalendarItem,
  NewsCategory,
  CandleResolution,
} from '@/types/finnhub';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_TIMEOUT_MS = 8000;

if (!FINNHUB_API_KEY) {
  throw new Error('FINNHUB_API_KEY is not defined in environment variables');
}

async function fetchFinnhub<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
  
  // Add API key
  url.searchParams.append('token', FINNHUB_API_KEY!);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(FINNHUB_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new FinnhubError(`HTTP ${response.status}: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  
  // Handle candle data specific error response
  if (endpoint.includes('/candle') && data.s === 'no_data') {
    return data as T;
  }
  
  return data as T;
}

export const getQuote = cache(async (symbol: string): Promise<Quote> => {
  return fetchFinnhub<Quote>('/quote', { symbol });
});

export const getCompanyProfile = cache(async (symbol: string): Promise<CompanyProfile> => {
  return fetchFinnhub<CompanyProfile>('/stock/profile2', { symbol });
});

export const getCandles = cache(async (
  symbol: string,
  resolution: CandleResolution,
  from: number,
  to: number
): Promise<CandleData> => {
  return fetchFinnhub<CandleData>('/stock/candle', {
    symbol,
    resolution,
    from,
    to,
  });
});

export const getNews = cache(async (symbol: string, from: string, to: string): Promise<NewsItem[]> => {
  return fetchFinnhub<NewsItem[]>('/company-news', {
    symbol,
    from,
    to,
  });
});

export const getFinancials = cache(async (symbol: string): Promise<Financials> => {
  return fetchFinnhub<Financials>('/stock/financials', {
    symbol,
    statement: 'ic',
    period: 'annual',
  });
});

export const getBasicFinancials = cache(async (symbol: string): Promise<BasicFinancials> => {
  return fetchFinnhub<BasicFinancials>('/stock/metric', {
    symbol,
    metric: 'all',
  });
});

export const getPeers = cache(async (symbol: string): Promise<string[]> => {
  return fetchFinnhub<string[]>('/stock/peers', { symbol });
});

export const getRecommendationTrends = cache(async (symbol: string): Promise<RecommendationTrend[]> => {
  return fetchFinnhub<RecommendationTrend[]>('/stock/recommendation', { symbol });
});

export const getEarnings = cache(async (symbol: string): Promise<EarningsItem[]> => {
  const data = await fetchFinnhub<{ earningsCalendar: EarningsItem[] }>('/calendar/earnings', { symbol });
  return data.earningsCalendar;
});

export const getMarketNews = cache(async (category: NewsCategory): Promise<NewsItem[]> => {
  return fetchFinnhub<NewsItem[]>('/news', { category });
});

export const getSearch = cache(async (query: string): Promise<SearchResult> => {
  return fetchFinnhub<SearchResult>('/search', { q: query });
});

export const getIPOCalendar = cache(async (from: string, to: string): Promise<IPOCalendarItem[]> => {
  const data = await fetchFinnhub<{ ipoCalendar: IPOCalendarItem[] }>('/calendar/ipo', { from, to });
  return data.ipoCalendar;
});
