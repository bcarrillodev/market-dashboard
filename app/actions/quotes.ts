'use server';

import { getQuote, getCompanyProfile, getBasicFinancials, getNews, getRecommendationTrends, getSearch, getMarketNews } from '@/lib/finnhub/cache';
import { getStockDaily } from '@/lib/alphavantage/cache';
import { safeFetch } from '@/lib/finnhub/error-handler';
import type { Quote, CompanyProfile, BasicFinancials, NewsItem, RecommendationTrend, SearchResult } from '@/types/finnhub';
import type { StockTimeSeries } from '@/types/alphavantage';

export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const quotes: Record<string, Quote> = {};
  
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await getQuote(symbol);
        if (quote) {
          quotes[symbol] = quote;
        }
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
      }
    })
  );
  
  return quotes;
}

export interface StockDetailData {
  quote: Quote;
  profile: CompanyProfile;
  financials: BasicFinancials;
  news: NewsItem[];
  recommendations: RecommendationTrend[];
  candles: StockTimeSeries;
}

export async function getStockDetail(symbol: string): Promise<StockDetailData | null> {
  try {
    const upperSymbol = symbol.toUpperCase();
    const newsFrom = getDaysAgoString(7);
    const newsTo = getTodayString();

    const candlesPromise = getStockDaily(upperSymbol).catch((candleError) => {
      console.warn(`Alpha Vantage candle data not available for ${upperSymbol}:`, candleError);
      return {
        symbol: upperSymbol,
        lastRefreshed: new Date().toISOString(),
        timeZone: 'UTC',
        candles: [],
      } satisfies StockTimeSeries;
    });

    const [quote, profile, financials, news, recommendations, candles] = await Promise.all([
      safeFetch(() => getQuote(upperSymbol), {
        c: 0,
        d: 0,
        dp: 0,
        h: 0,
        l: 0,
        o: 0,
        pc: 0,
        t: 0,
      }),
      safeFetch(() => getCompanyProfile(upperSymbol), {}),
      safeFetch(() => getBasicFinancials(upperSymbol), {
        metric: {},
        metricType: '',
        series: {},
        symbol: upperSymbol,
      }),
      safeFetch(() => getNews(upperSymbol, newsFrom, newsTo), []),
      safeFetch(() => getRecommendationTrends(upperSymbol), []),
      candlesPromise,
    ]);

    if (!profile || Object.keys(profile).length === 0 || !profile.name) {
      return null;
    }

    return {
      quote,
      profile,
      financials,
      news,
      recommendations,
      candles,
    };
  } catch (error) {
    console.error(`Failed to fetch stock detail for ${symbol}:`, error);
    return null;
  }
}

export async function searchStockSymbols(query: string): Promise<SearchResult> {
  try {
    return await getSearch(query);
  } catch (error) {
    console.error('Search failed:', error);
    return { count: 0, result: [] };
  }
}

export async function fetchMarketNews(category: 'general' | 'forex' | 'crypto' | 'merger' = 'general'): Promise<NewsItem[]> {
  try {
    return await getMarketNews(category);
  } catch (error) {
    console.error('Failed to fetch market news:', error);
    return [];
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
