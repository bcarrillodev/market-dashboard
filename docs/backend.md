# Backend Architecture: Next.js + TypeScript + Finnhub

## Overview
Server-side data fetching architecture using Next.js 14+ Server Components, React `cache()`, and Finnhub REST API.

---

## Environment Setup

### 1. Dependencies
```bash
npm install finnhub
npm install -D @types/finnhub  # If available, or create custom types
```

### 2. Environment Variables (`.env.local`)
```bash
FINNHUB_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your free API key at [https://finnhub.io](https://finnhub.io) (60 calls/minute on free tier).

---

## Core Architecture

### Direct API Setup

The application uses direct fetch calls to the Finnhub REST API instead of the client library for better reliability and performance.

### React Cache Layer (`lib/finnhub/cache.ts`)
```typescript
import { cache } from 'react';

const apiKey = process.env.FINNHUB_API_KEY;

if (!apiKey) {
  throw new Error('FINNHUB_API_KEY is not defined in environment variables');
}

// Cache duration: 60 seconds for real-time data, 5 minutes for fundamentals
const CACHE_TTL = {
  quote: 60,
  candles: 300,
  fundamentals: 300,
  news: 120,
  profile: 86400, // 24 hours
};

export const getQuote = cache(async (symbol: string) => {
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
  );
  return response.json();
});

export const getCompanyProfile = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyProfile2({ symbol }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getCandles = cache(async (
  symbol: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
  from: number, // Unix timestamp
  to: number
) => {
  return new Promise((resolve, reject) => {
    finnhubClient.stockCandles(symbol, resolution, from, to, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getNews = cache(async (symbol: string, from: string, to: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyNews(symbol, from, to, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getFinancials = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.financials(symbol, 'annual', 'ic', (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getBasicFinancials = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyBasicFinancials(symbol, 'all', (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getPeers = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.companyPeers(symbol, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getRecommendationTrends = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.recommendationTrends(symbol, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getEarnings = cache(async (symbol: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.earningsCalendar(symbol, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getMarketNews = cache(async (category: 'general' | 'forex' | 'crypto' | 'merger') => {
  return new Promise((resolve, reject) => {
    finnhubClient.marketNews(category, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getSearch = cache(async (query: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.symbolSearch(query, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});

export const getIPOCalendar = cache(async (from: string, to: string) => {
  return new Promise((resolve, reject) => {
    finnhubClient.ipoCalendar(from, to, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
});
```

---

## TypeScript Types (`types/finnhub.ts`)

```typescript
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
```

---

## Server Component Patterns

### Pattern 1: Direct Data Fetching (`app/stock/[symbol]/page.tsx`)
```typescript
import { getQuote, getCompanyProfile, getBasicFinancials, getNews } from '@/lib/finnhub/cache';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { symbol: string };
}

export default async function StockPage({ params }: PageProps) {
  const { symbol } = params;
  const upperSymbol = symbol.toUpperCase();
  
  try {
    // Parallel data fetching
    const [quote, profile, financials] = await Promise.all([
      getQuote(upperSymbol),
      getCompanyProfile(upperSymbol),
      getBasicFinancials(upperSymbol),
    ]);

    if (!profile || Object.keys(profile).length === 0) {
      notFound();
    }

    return (
      <div>
        <h1>{profile.name} ({upperSymbol})</h1>
        <p>Current Price: ${quote.c}</p>
        <p>Change: {quote.dp}%</p>
        {/* ... */}
      </div>
    );
  } catch (error) {
    // Handle error appropriately
    throw new Error(`Failed to fetch data for ${symbol}`);
  }
}
```

### Pattern 2: Chart Data with Time Range (`app/stock/[symbol]/chart/page.tsx`)
```typescript
import { getCandles } from '@/lib/finnhub/cache';

interface PageProps {
  params: { symbol: string };
  searchParams: { 
    from?: string; 
    to?: string;
    resolution?: 'D' | 'W' | 'M';
  };
}

export default async function ChartPage({ params, searchParams }: PageProps) {
  const { symbol } = params;
  const resolution = searchParams.resolution || 'D';
  
  // Default to last 30 days
  const to = searchParams.to ? parseInt(searchParams.to) : Math.floor(Date.now() / 1000);
  const from = searchParams.from ? parseInt(searchParams.from) : to - 30 * 24 * 60 * 60;

  const candles = await getCandles(symbol.toUpperCase(), resolution, from, to);

  return (
    <div>
      <h2>Price Chart</h2>
      {/* Pass candles to client component for rendering */}
      <ChartClient data={candles} />
    </div>
  );
}
```

### Pattern 3: Dashboard with Multiple Stocks (`app/dashboard/page.tsx`)
```typescript
import { getQuote, getMarketNews } from '@/lib/finnhub/cache';

const WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

export default async function DashboardPage() {
  // Fetch all quotes in parallel
  const quotes = await Promise.all(
    WATCHLIST.map(symbol => getQuote(symbol).catch(() => null))
  );

  const news = await getMarketNews('general').catch(() => []);

  return (
    <div>
      <h1>Market Dashboard</h1>
      
      <section>
        <h2>Watchlist</h2>
        {WATCHLIST.map((symbol, index) => (
          <WatchlistItem 
            key={symbol} 
            symbol={symbol} 
            quote={quotes[index]} 
          />
        ))}
      </section>

      <section>
        <h2>Market News</h2>
        <NewsList items={news.slice(0, 5)} />
      </section>
    </div>
  );
}
```

---

## Error Handling Pattern (`lib/finnhub/error-handler.ts`)

```typescript
export class FinnhubError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FinnhubError';
  }
}

export async function safeFetch<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error('Finnhub API Error:', error);
    return fallback;
  }
}

// Usage in components
const quote = await safeFetch(() => getQuote('AAPL'), {
  c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, t: 0
});
```

---

## Data Fetching Utilities (`lib/utils/dates.ts`)

```typescript
export function getTimestampDaysAgo(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
```

---

## Revalidation Strategy

### Time-based Revalidation (`app/market/page.tsx`)
```typescript
export const revalidate = 60; // Revalidate every 60 seconds

export default async function MarketPage() {
  // ...
}
```

### On-demand Revalidation (`app/api/revalidate/route.ts`)
```typescript
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { tag, token } = await request.json();
  
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true });
}
```

---

## Complete API Endpoint Reference

| Data Type | Cache Function | Endpoint |
|-----------|---------------|----------|
| Real-time Quote | `getQuote(symbol)` | `/quote?symbol={symbol}` |
| Company Profile | `getCompanyProfile(symbol)` | `/stock/profile2?symbol={symbol}` |
| Historical Candles | `getCandles(symbol, resolution, from, to)` | `/stock/candle?symbol={symbol}&resolution={res}&from={from}&to={to}` |
| Company News | `getNews(symbol, from, to)` | `/company-news?symbol={symbol}&from={from}&to={to}` |
| Market News | `getMarketNews(category)` | `/news?category={category}` |
| Basic Financials | `getBasicFinancials(symbol)` | `/stock/metric?symbol={symbol}&metric=all` |
| Financial Statements | `getFinancials(symbol)` | `/stock/financials?symbol={symbol}` |
| Peers | `getPeers(symbol)` | `/stock/peers?symbol={symbol}` |
| Analyst Recommendations | `getRecommendationTrends(symbol)` | `/stock/recommendation?symbol={symbol}` |
| Earnings Calendar | `getEarnings(symbol)` | `/calendar/earnings?symbol={symbol}` |
| Symbol Search | `getSearch(query)` | `/search?q={query}` |
| IPO Calendar | `getIPOCalendar(from, to)` | `/calendar/ipo?from={from}&to={to}` |

---

## Directory Structure

```
lib/
  finnhub/
    cache.ts        # React cache wrappers with direct fetch
  utils/
    dates.ts        # Date utilities
types/
  finnhub.ts        # TypeScript interfaces
app/
  stock/
    [symbol]/
      page.tsx      # Stock detail page
      chart/
        page.tsx    # Chart view
  dashboard/
    page.tsx        # Main dashboard
  search/
    page.tsx        # Search results
```
