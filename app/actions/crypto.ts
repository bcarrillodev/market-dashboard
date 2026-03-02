'use server';

import { getDigitalCurrencyDaily, getDigitalCurrencyWeekly } from '@/lib/alphavantage/cache';
import { fetchMarketNews } from '@/app/actions/quotes';
import type { CryptoTimeSeries } from '@/types/alphavantage';
import type { NewsItem } from '@/types/finnhub';

export interface CryptoDetailData {
  timeSeries: CryptoTimeSeries;
  news: NewsItem[];
}

export async function getCryptoDetail(symbol: string): Promise<CryptoDetailData | null> {
  try {
    // Extract the base symbol from Finnhub format (e.g., "BINANCE:BTCUSDT" -> "BTC")
    const baseSymbol = symbol.includes(':') ? symbol.split(':')[1].replace('USDT', '') : symbol;
    const upperSymbol = baseSymbol.toUpperCase();
    
    // Try to get daily data first, fall back to weekly if daily fails
    let timeSeries: CryptoTimeSeries | null = null;
    try {
      timeSeries = await getDigitalCurrencyDaily(upperSymbol);
    } catch (dailyError) {
      console.warn(`Daily crypto data not available for ${upperSymbol}, trying weekly:`, dailyError);
      try {
        timeSeries = await getDigitalCurrencyWeekly(upperSymbol);
      } catch (weeklyError) {
        console.error(`Failed to fetch crypto data for ${upperSymbol}:`, weeklyError);
        return null;
      }
    }

    if (!timeSeries) {
      return null;
    }

    // If no candles available, create empty timeSeries with basic info
    if (!timeSeries.candles || timeSeries.candles.length === 0) {
      console.warn(`No candle data available for ${upperSymbol}, but continuing with empty data`);
    }

    // Get crypto market news
    const news = await fetchMarketNews('crypto');

    return {
      timeSeries,
      news,
    };
  } catch (error) {
    console.error(`Failed to fetch crypto detail for ${symbol}:`, error);
    return null;
  }
}
