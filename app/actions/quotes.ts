'use server';

import { getQuote, getCompanyProfile, getBasicFinancials, getNews, getCandles, getRecommendationTrends, getSearch, getMarketNews } from '@/lib/finnhub/cache';
import type { Quote, CompanyProfile, BasicFinancials, NewsItem, CandleData, RecommendationTrend, SearchResult } from '@/types/finnhub';

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
  candles: CandleData;
}

export async function getStockDetail(symbol: string): Promise<StockDetailData | null> {
  try {
    const upperSymbol = symbol.toUpperCase();
    const to = Math.floor(Date.now() / 1000);
    const from = to - 30 * 24 * 60 * 60; // 30 days ago
    
    // Fetch candle data separately since it may fail due to API limitations
    let candles: CandleData | null = null;
    try {
      candles = await getCandles(upperSymbol, 'D', from, to);
    } catch (candleError) {
      console.warn(`Candle data not available for ${upperSymbol} (likely requires premium API):`, candleError);
      // Provide empty candle data as fallback
      candles = {
        c: [],
        h: [],
        l: [],
        o: [],
        s: "no_data",
        t: [],
        v: []
      };
    }
    
    const [quote, profile, financials, news, recommendations] = await Promise.all([
      getQuote(upperSymbol),
      getCompanyProfile(upperSymbol),
      getBasicFinancials(upperSymbol),
      getNews(upperSymbol, getDaysAgoString(7), getTodayString()),
      getRecommendationTrends(upperSymbol),
    ]);

    if (!profile || Object.keys(profile).length === 0) {
      return null;
    }

    return {
      quote,
      profile,
      financials,
      news,
      recommendations,
      candles: candles || {
        c: [],
        h: [],
        l: [],
        o: [],
        s: "no_data",
        t: [],
        v: []
      },
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
