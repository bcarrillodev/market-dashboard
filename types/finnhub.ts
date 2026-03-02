export interface Quote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface CompanyProfile {
  country?: string;
  currency?: string;
  exchange?: string;
  finnhubIndustry?: string;
  ipo?: string;
  logo?: string;
  marketCapitalization?: number;
  name?: string;
  phone?: string;
  shareOutstanding?: number;
  ticker?: string;
  weburl?: string;
}

export interface CandleData {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string;   // Status
  t: number[]; // Timestamps
  v: number[]; // Volumes
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface BasicFinancials {
  metric: Record<string, number | null>;
  metricType: string;
  series: Record<string, Array<{ period: string; v: number }>>;
  symbol: string;
}

export interface Financials {
  symbol: string;
  financials: Array<{
    period: string;
    year: number;
    [key: string]: string | number | undefined;
  }>;
}

export interface RecommendationTrend {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

export interface SearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface EarningsItem {
  symbol: string;
  date: string;
  epsActual?: number;
  epsEstimate?: number;
  hour?: string;
  quarter?: number;
  revenueActual?: number;
  revenueEstimate?: number;
  year?: number;
}

export interface IPOCalendarItem {
  date: string;
  exchange: string;
  name: string;
  numberOfShares?: number;
  price?: string;
  status: string;
  symbol?: string;
  totalSharesValue?: number;
}

export type NewsCategory = 'general' | 'forex' | 'crypto' | 'merger';

export type CandleResolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
