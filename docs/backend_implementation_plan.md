# Backend Implementation Plan

Implement a Next.js 14+ server-side data layer using Finnhub REST API with React `cache()` for optimal performance and 60-second revalidation for real-time market data.

---

## Phase 1: Foundation (Dependencies & Config)

**Files to Create:**
- `package.json` - Add environment variables template
- `.env.local` - Environment variables template
- `types/finnhub.ts` - TypeScript interfaces (Quote, CompanyProfile, CandleData, NewsItem, etc.)

**Key Decisions:**
- Use direct fetch calls to Finnhub REST API for better reliability
- Define cache TTLs: 60s (quote), 300s (candles/fundamentals), 86400s (profile)

---

## Phase 2: Core Data Layer

**Files to Create:**
- `lib/finnhub/cache.ts` - React cache() wrappers for 11 endpoints using direct fetch:
  - `getQuote()`, `getCompanyProfile()`, `getCandles()`, `getNews()`
  - `getBasicFinancials()`, `getFinancials()`, `getPeers()`
  - `getRecommendationTrends()`, `getEarnings()`, `getMarketNews()`
  - `getSearch()`, `getIPOCalendar()`
- `lib/finnhub/error-handler.ts` - `FinnhubError` class + `safeFetch()` helper
- `lib/utils/dates.ts` - `getTimestampDaysAgo()`, `getTodayString()`, `getDaysAgoString()`

---

## Phase 3: Server Components

**Files to Create:**
- `app/dashboard/page.tsx` - Main dashboard with watchlist + market news (revalidate: 60)
- `app/stock/[symbol]/page.tsx` - Stock detail with parallel data fetching
- `app/stock/[symbol]/chart/page.tsx` - Chart view with time range params
- `app/search/page.tsx` - Symbol search results

**Patterns:**
- Use `Promise.all()` for parallel fetches
- Use `notFound()` for invalid symbols
- Implement error boundaries with fallbacks

---

## Phase 4: Revalidation API

**Files to Create:**
- `app/api/revalidate/route.ts` - POST endpoint for on-demand cache revalidation

---

## Directory Structure

```
lib/
  finnhub/
    cache.ts        # React cache wrappers with direct fetch
  utils/
    dates.ts        # Date utilities
types/
  finnhub.ts
app/
  dashboard/page.tsx
  stock/[symbol]/page.tsx
  stock/[symbol]/chart/page.tsx
  search/page.tsx
```

---

## API Endpoint Mapping

| Function | Finnhub Endpoint |
|----------|-----------------|
| `getQuote(symbol)` | `/quote?symbol={symbol}` |
| `getCompanyProfile(symbol)` | `/stock/profile2?symbol={symbol}` |
| `getCandles(...)` | `/stock/candle?symbol={symbol}&resolution={res}&from={from}&to={to}` |
| `getNews(symbol, from, to)` | `/company-news?symbol={symbol}&from={from}&to={to}` |
| `getMarketNews(category)` | `/news?category={category}` |
| `getBasicFinancials(symbol)` | `/stock/metric?symbol={symbol}&metric=all` |
| `getPeers(symbol)` | `/stock/peers?symbol={symbol}` |
| `getRecommendationTrends(symbol)` | `/stock/recommendation?symbol={symbol}` |
| `getSearch(query)` | `/search?q={query}` |
| `getIPOCalendar(from, to)` | `/calendar/ipo?from={from}&to={to}` |
