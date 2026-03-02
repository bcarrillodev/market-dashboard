import { cache } from 'react';
import type {
  StockDailyResponse,
  StockWeeklyResponse,
  StockTimeSeries,
  StockCandle,
  DigitalCurrencyDailyResponse,
  DigitalCurrencyWeeklyResponse,
  CryptoTimeSeries,
  CryptoCandle,
} from '@/types/alphavantage';

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const ALPHAVANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const ALPHAVANTAGE_TIMEOUT_MS = 10000;

// Check if API key is available
const hasApiKey = !!ALPHAVANTAGE_API_KEY;

class AlphaVantageError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AlphaVantageError';
  }
}

async function fetchAlphaVantage<T>(params: Record<string, string>): Promise<T> {
  // Return empty data if no API key is available
  if (!hasApiKey) {
    console.warn('ALPHAVANTAGE_API_KEY is not defined, returning empty data');
    return {} as T;
  }

  const url = new URL(ALPHAVANTAGE_BASE_URL);

  // Add API key
  url.searchParams.append('apikey', ALPHAVANTAGE_API_KEY!);

  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(ALPHAVANTAGE_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new AlphaVantageError(`HTTP ${response.status}: ${response.statusText}`, response.status);
  }

  const data = await response.json();

  // Alpha Vantage returns error messages in the response body
  if (data['Error Message']) {
    throw new AlphaVantageError(data['Error Message']);
  }

  // Handle note/rate limit messages
  if (data['Note']) {
    throw new AlphaVantageError(data['Note']);
  }

  return data as T;
}

function normalizeStockDailyData(response: StockDailyResponse): StockTimeSeries {
  const meta = response['Meta Data'];
  const timeSeries = response['Time Series (Daily)'];

  const candles: StockCandle[] = Object.entries(timeSeries)
    .map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume']),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    symbol: meta['2. Symbol'],
    lastRefreshed: meta['3. Last Refreshed'],
    timeZone: meta['5. Time Zone'],
    candles,
  };
}

function normalizeStockWeeklyData(response: StockWeeklyResponse): StockTimeSeries {
  const meta = response['Meta Data'];
  const timeSeries = response['Weekly Time Series'];

  const candles: StockCandle[] = Object.entries(timeSeries)
    .map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume']),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    symbol: meta['2. Symbol'],
    lastRefreshed: meta['3. Last Refreshed'],
    timeZone: meta['4. Time Zone'],
    candles,
  };
}

function normalizeDailyData(response: DigitalCurrencyDailyResponse): CryptoTimeSeries {
  if (!response || !response['Meta Data'] || !response['Time Series (Digital Currency Daily)']) {
    throw new AlphaVantageError('Invalid response format for daily crypto data');
  }
  
  const meta = response['Meta Data'];
  const timeSeries = response['Time Series (Digital Currency Daily)'];

  const candles: CryptoCandle[] = Object.entries(timeSeries)
    .map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume'])
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    symbol: meta['2. Digital Currency Code'],
    name: meta['3. Digital Currency Name'],
    market: meta['4. Market Code'],
    lastRefreshed: meta['6. Last Refreshed'],
    timeZone: meta['7. Time Zone'],
    candles,
  };
}

function normalizeWeeklyData(response: DigitalCurrencyWeeklyResponse): CryptoTimeSeries {
  if (!response || !response['Meta Data'] || !response['Time Series (Digital Currency Weekly)']) {
    throw new AlphaVantageError('Invalid response format for weekly crypto data');
  }
  
  const meta = response['Meta Data'];
  const timeSeries = response['Time Series (Digital Currency Weekly)'];

  const candles: CryptoCandle[] = Object.entries(timeSeries)
    .map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume'])
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    symbol: meta['2. Digital Currency Code'],
    name: meta['3. Digital Currency Name'],
    market: meta['4. Market Code'],
    lastRefreshed: meta['6. Last Refreshed'],
    timeZone: meta['7. Time Zone'],
    candles,
  };
}

export const getStockDaily = cache(async (symbol: string): Promise<StockTimeSeries> => {
  if (!hasApiKey) {
    console.warn(`No Alpha Vantage API key available for ${symbol} daily data`);
    return {
      symbol,
      lastRefreshed: new Date().toISOString(),
      timeZone: 'UTC',
      candles: [],
    };
  }

  const data = await fetchAlphaVantage<StockDailyResponse>({
    function: 'TIME_SERIES_DAILY',
    symbol,
  });

  const result = normalizeStockDailyData(data);
  
  // Log the date range for debugging
  if (result.candles.length > 0) {
    const earliestDate = result.candles[result.candles.length - 1].date;
    const latestDate = result.candles[0].date;
    console.log(`Alpha Vantage data for ${symbol}: ${earliestDate} to ${latestDate} (${result.candles.length} data points)`);
  }
  
  return result;
});

export const getStockWeekly = cache(async (symbol: string): Promise<StockTimeSeries> => {
  if (!hasApiKey) {
    console.warn(`No Alpha Vantage API key available for ${symbol} weekly data`);
    return {
      symbol,
      lastRefreshed: new Date().toISOString(),
      timeZone: 'UTC',
      candles: [],
    };
  }

  const data = await fetchAlphaVantage<StockWeeklyResponse>({
    function: 'TIME_SERIES_WEEKLY',
    symbol,
  });

  return normalizeStockWeeklyData(data);
});

export const getDigitalCurrencyDaily = cache(async (
  symbol: string,
  market: string = 'USD'
): Promise<CryptoTimeSeries> => {
  if (!hasApiKey) {
    console.warn(`No Alpha Vantage API key available for ${symbol} daily crypto data`);
    return {
      symbol,
      name: symbol,
      market,
      lastRefreshed: new Date().toISOString(),
      timeZone: 'UTC',
      candles: [],
    };
  }

  const data = await fetchAlphaVantage<DigitalCurrencyDailyResponse>({
    function: 'DIGITAL_CURRENCY_DAILY',
    symbol,
    market,
  });

  return normalizeDailyData(data);
});

export const getDigitalCurrencyWeekly = cache(async (
  symbol: string,
  market: string = 'USD'
): Promise<CryptoTimeSeries> => {
  if (!hasApiKey) {
    console.warn(`No Alpha Vantage API key available for ${symbol} weekly crypto data`);
    return {
      symbol,
      name: symbol,
      market,
      lastRefreshed: new Date().toISOString(),
      timeZone: 'UTC',
      candles: [],
    };
  }

  const data = await fetchAlphaVantage<DigitalCurrencyWeeklyResponse>({
    function: 'DIGITAL_CURRENCY_WEEKLY',
    symbol,
    market,
  });

  return normalizeWeeklyData(data);
});

export { AlphaVantageError };
