'use server';

import { getDigitalCurrencyDaily, getDigitalCurrencyWeekly } from '@/lib/alphavantage/cache';
import { fetchMarketNews } from '@/app/actions/quotes';
import type { CryptoTimeSeries } from '@/types/alphavantage';
import type { NewsItem } from '@/types/finnhub';
import { getCryptoBaseSymbol } from '@/lib/symbols';

export interface CryptoDetailData {
  timeSeries: CryptoTimeSeries;
  news: NewsItem[];
}

function createFallbackTimeSeries(symbol: string): CryptoTimeSeries {
  return {
    symbol,
    name: symbol,
    market: 'USD',
    lastRefreshed: new Date().toISOString(),
    timeZone: 'UTC',
    candles: [],
  };
}

export async function getCryptoDetail(symbol: string): Promise<CryptoDetailData | null> {
  try {
    const upperSymbol = getCryptoBaseSymbol(symbol);
    const newsPromise = fetchMarketNews('crypto').catch((error) => {
      console.error(`Failed to fetch crypto news for ${upperSymbol}:`, error);
      return [];
    });
    
    let timeSeries: CryptoTimeSeries | null = null;
    try {
      timeSeries = await getDigitalCurrencyDaily(upperSymbol);
    } catch (dailyError) {
      console.warn(`Daily crypto data not available for ${upperSymbol}, trying weekly:`, dailyError);
      try {
        timeSeries = await getDigitalCurrencyWeekly(upperSymbol);
      } catch (weeklyError) {
        console.error(`Failed to fetch crypto data for ${upperSymbol}:`, weeklyError);
        timeSeries = createFallbackTimeSeries(upperSymbol);
      }
    }

    if (!timeSeries) {
      timeSeries = createFallbackTimeSeries(upperSymbol);
    }

    // If no candles available, create empty timeSeries with basic info
    if (!timeSeries.candles || timeSeries.candles.length === 0) {
      console.warn(`No candle data available for ${upperSymbol}, but continuing with empty data`);
    }

    const news = await newsPromise;

    return {
      timeSeries,
      news,
    };
  } catch (error) {
    console.error(`Failed to fetch crypto detail for ${symbol}:`, error);
    return null;
  }
}
