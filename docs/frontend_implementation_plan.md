# Market Dashboard Frontend Implementation Plan

A phased implementation plan for a Next.js 14+ market dashboard with dual-theme support (Light Skeuomorphism / Dark Glassmorphism) and real-time financial data via Finnhub API.

---

## Phase 1: Project Initialization (30 min)

### 1.1 Initialize Next.js with shadcn/ui

```bash
cd /Users/brandon/Repos/market-dashboard
npx shadcn@latest init --yes --template next --base-color slate
```

### 1.2 Install Dependencies

```bash
# shadcn components
npx shadcn add card button badge input tabs scroll-area separator dropdown-menu chart

# Additional packages
npm install lucide-react date-fns
```

### 1.3 Configure Environment

Create `.env.local`:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 2: Design System Foundation (45 min)

### 2.1 Tailwind Configuration

**File**: `tailwind.config.ts`

**Tasks**:
- Extend colors with `cyan` palette (primary: `#00f0ff`)
- Add `light` and `dark` semantic color tokens
- Define custom animations (`pulse-glow`)
- Configure `darkMode: ["class"]` strategy

### 2.2 Theme Provider

**Files**:
- `components/theme-provider.tsx` - Context provider with localStorage persistence
- `components/theme-toggle.tsx` - Dropdown toggle (Light/Dark/System)
- `hooks/use-theme.ts` - Hook re-export

**Key Requirements**:
- Support 'light' | 'dark' | 'system' modes
- Use `suppressHydrationWarning` on html element
- Persist preference to localStorage

### 2.3 Global Styles

**File**: `app/globals.css`

**Tasks**:
- Import Tailwind directives
- Define CSS variables for theme tokens
- Add custom utility classes for glass/skeuomorphic effects

---

## Phase 3: Core UI Components (60 min)

### 3.1 Themed Card Components

**Files**:
- `components/ui/skeuo-card.tsx` - Light theme with shadows/insets
- `components/ui/glass-card.tsx` - Dark theme with backdrop-blur
- `components/ui/themed-card.tsx` - Unified component using `useTheme()`

**Props Interface**:
```typescript
interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;      // Light only
  interactive?: boolean;  // Light only
  glow?: boolean;       // Dark only
}
```

### 3.2 Number Display Component

**File**: `components/ui/number-display.tsx`

**Features**:
- Inset effect for light theme (bg-slate-100, inner shadow)
- Glow effect for dark theme on positive/negative values
- Size variants: sm | md | lg | xl
- Color coding: emerald (positive), rose (negative), cyan accent

### 3.3 Primary Action Button

**File**: `components/ui/cyan-button.tsx`

**Features**:
- Neon cyan (#00f0ff) background
- Skeuomorphic press effect (light)
- Glass glow effect (dark)
- Optional `pulse-glow` animation

### 3.4 Layout Components

**Files**:
- `components/layout/header.tsx` - Sticky header with logo, nav, theme toggle
- `app/layout.tsx` - Root layout with ThemeProvider

---

## Phase 4: State Management & Data Layer (45 min)

### 4.1 TypeScript Types

**Files**:
- `types/theme.ts` - ThemeMode, ThemeConfig
- `types/watchlist.ts` - AssetType, WatchlistItem, Watchlist, DEFAULT_WATCHLIST
- `types/finnhub.ts` - API types (Quote, CompanyProfile, CandleData, NewsItem, etc.)

### 4.2 Watchlist Hook

**File**: `hooks/use-watchlist.ts`

**Features**:
- localStorage persistence
- Default stocks (AAPL, MSFT, GOOGL, AMZN, TSLA)
- Default crypto (BINANCE:BTCUSDT, BINANCE:ETHUSDT)
- Methods: `addToWatchlist`, `removeFromWatchlist`, `isInWatchlist`

### 4.3 Polling Hook

**File**: `hooks/use-polling.ts`

**Configuration**:
- Default interval: 15 seconds
- Error handling with `onError` callback
- Auto-fetch on mount when enabled

---

## Phase 5: Data Fetching Infrastructure (60 min)

### 5.1 Server Actions

**File**: `app/actions/quotes.ts`

**Functions**:
```typescript
export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>>
export async function getStockDetail(symbol: string): Promise<StockDetailData>
export async function searchSymbols(query: string): Promise<SearchResult>
```

### 5.2 Backend Integration

**Files** (from backend spec):
- `lib/finnhub/cache.ts` - React cache wrappers with direct fetch

---

## Phase 6: Chart Components (45 min)

### 6.1 Stock Price Chart

**File**: `components/charts/stock-chart.tsx`

**Features**:
- Recharts AreaChart with gradient fill
- Neon cyan stroke (#00f0ff)
- Theme-aware tooltip styling
- Volume display in tooltip
- Responsive container

### 6.2 Recommendation Bars

**File**: `components/charts/recommendation-bars.tsx`

**Features**:
- Stacked bar chart for analyst ratings
- Color coding: emerald (buy), yellow (hold), rose (sell)
- Hover tooltips with counts
- Legend with counts

---

## Phase 7: Page Implementations (90 min)

### 7.1 Dashboard Page

**File**: `app/page.tsx`

**Sections**:
1. Market Overview (grid of summary cards)
2. Watchlist (2/3 width, client-side polling)
3. Market News (1/3 width, server-rendered)

**Components Needed**:
- `components/watchlist/live-watchlist.tsx` - Client component with polling
- `components/watchlist/watchlist-row.tsx` - Individual stock row
- `components/news/news-list.tsx` - News feed component

### 7.2 Stock Detail Page

**File**: `app/stock/[symbol]/page.tsx`

**Data Fetching**:
- Quote, Company Profile, Basic Financials, News, Recommendations
- 30-day candle data for chart

**Layout**:
- Header: Company name, symbol, current price, change
- Main (2/3): Price chart, key metrics
- Sidebar (1/3): Analyst ratings, company info, news

**Components Needed**:
- `components/stock/key-metrics.tsx` - Financial metrics grid

### 7.3 Search Page

**File**: `app/search/page.tsx`

**Features**:
- Search input with debouncing
- Results list with add-to-watchlist buttons
- Type badges (stock/crypto)

---

## Phase 8: Polish & Testing (30 min)

### 8.1 Final Tasks

- [ ] Verify theme toggle works across all pages
- [ ] Confirm 15-second polling interval
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Validate localStorage persistence for watchlist
- [ ] Check accessibility (keyboard navigation, focus states)

### 8.2 Development Server

```bash
npm run dev
```

---

## Implementation Order Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1 | 30 min | Project setup, dependencies |
| 2 | 45 min | Tailwind config, theme system |
| 3 | 60 min | Card components, button, header |
| 4 | 45 min | Hooks (watchlist, polling) |
| 5 | 60 min | Server actions, backend lib |
| 6 | 45 min | Charts (stock, recommendations) |
| 7 | 90 min | Dashboard, Stock, Search pages |
| 8 | 30 min | Testing, polish |

**Total Estimated Time**: ~7 hours

---

## Key Technical Decisions

1. **Server Components for Pages**: Initial data fetch on server, client components for interactivity
2. **Theme Strategy**: CSS class-based dark mode with `dark` class on html element
3. **Data Polling**: Custom hook at 15s interval (not WebSockets) to respect Finnhub free tier limits
4. **State Persistence**: localStorage for watchlist (simple, no backend needed for MVP)
5. **Chart Library**: Recharts (via shadcn/ui chart) - React-native, themeable

---

## File Structure Preview

```
app/
├── layout.tsx, page.tsx, globals.css
├── stock/[symbol]/page.tsx
├── search/page.tsx
└── actions/quotes.ts

components/
├── theme-provider.tsx, theme-toggle.tsx
├── layout/header.tsx
├── ui/themed-card.tsx, skeuo-card.tsx, glass-card.tsx
├── ui/number-display.tsx, cyan-button.tsx
├── charts/stock-chart.tsx, recommendation-bars.tsx
├── watchlist/live-watchlist.tsx, watchlist-row.tsx
├── stock/key-metrics.tsx
└── news/news-list.tsx

hooks/
├── use-watchlist.ts, use-polling.ts

lib/
├── utils.ts
└── finnhub/cache.ts

types/
├── theme.ts, watchlist.ts, finnhub.ts
```
