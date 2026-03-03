import { FinnhubError } from './error-handler';
import type {
  Quote,
  CompanyProfile,
  NewsItem,
  BasicFinancials,
  RecommendationTrend,
  SearchResult,
  NewsCategory,
} from '@/types/finnhub';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_TIMEOUT_MS = 8000;
const DEFAULT_REVALIDATE_SECONDS = 300;

if (!FINNHUB_API_KEY) {
  throw new Error('FINNHUB_API_KEY is not defined in environment variables');
}

interface FetchFinnhubOptions {
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
}

async function fetchFinnhub<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: FetchFinnhubOptions = {}
): Promise<T> {
  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
  
  // Add API key
  url.searchParams.append('token', FINNHUB_API_KEY!);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    cache: options.cache ?? 'force-cache',
    next: {
      revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
      tags: options.tags,
    },
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

export async function getQuote(symbol: string): Promise<Quote> {
  return fetchFinnhub<Quote>('/quote', { symbol }, {
    revalidate: 60,
    tags: [`quote:${symbol}`],
  });
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  return fetchFinnhub<CompanyProfile>('/stock/profile2', { symbol }, {
    revalidate: 3600,
    tags: [`profile:${symbol}`],
  });
}

export async function getNews(symbol: string, from: string, to: string): Promise<NewsItem[]> {
  return fetchFinnhub<NewsItem[]>('/company-news', {
    symbol,
    from,
    to,
  }, {
    revalidate: 300,
    tags: [`news:${symbol}`],
  });
}

export async function getBasicFinancials(symbol: string): Promise<BasicFinancials> {
  return fetchFinnhub<BasicFinancials>('/stock/metric', {
    symbol,
    metric: 'all',
  }, {
    revalidate: 3600,
    tags: [`financials:${symbol}`],
  });
}

export async function getRecommendationTrends(symbol: string): Promise<RecommendationTrend[]> {
  return fetchFinnhub<RecommendationTrend[]>('/stock/recommendation', { symbol }, {
    revalidate: 3600,
    tags: [`recommendations:${symbol}`],
  });
}

export async function getMarketNews(category: NewsCategory): Promise<NewsItem[]> {
  return fetchFinnhub<NewsItem[]>('/news', { category }, {
    revalidate: 300,
    tags: [`market-news:${category}`],
  });
}

export async function getSearch(query: string): Promise<SearchResult> {
  return fetchFinnhub<SearchResult>('/search', { q: query }, {
    cache: 'no-store',
    revalidate: 0,
  });
}
