# Frontend Architecture: Next.js + React + Tailwind + shadcn/ui

## Overview
Market dashboard frontend built with Next.js 14+ App Router, React Server Components, Tailwind CSS, and shadcn/ui. Features dual aesthetic themes: **Light Skeuomorphism** (default) and **Dark Glassmorphism**, with **Neon Cyan** as the primary action color.

---

## Technology Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4+ |
| Components | shadcn/ui |
| Charts | shadcn/ui Chart (Recharts-based) |
| Icons | Lucide React |
| State | React hooks + localStorage |
| Polling | Custom SWR/React Query pattern |

---

## Installation & Setup

### 1. Initialize shadcn/ui

```bash
npx shadcn@latest init --yes --template next --base-color slate
```

### 2. Install shadcn Components

```bash
npx shadcn add card button badge input tabs scroll-area separator dropdown-menu
npx shadcn add chart  # For Recharts-based charts
```

### 3. Install Additional Dependencies

```bash
npm install lucide-react
npm install date-fns  # For date formatting
```

---

## Design System

### Theme Architecture

Two distinct aesthetics with shared neon cyan accent:

```typescript
// types/theme.ts
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primary: '#00f0ff'; // Neon Cyan - consistent across both
}
```

### Color Tokens

```typescript
// tailwind.config.ts extensions
{
  theme: {
    extend: {
      colors: {
        // Primary - Neon Cyan (both themes)
        cyan: {
          50: '#e0fdff',
          100: '#b8f8ff',
          200: '#7af0ff',
          300: '#00f0ff', // Primary
          400: '#00d4e0',
          500: '#00b8c2',
          600: '#009ca5',
        },
        // Light Theme (Skeuomorphic)
        light: {
          bg: '#f0f4f8',
          surface: '#ffffff',
          surfaceRaised: '#f8fafc',
          surfaceInset: '#e2e8f0',
          border: '#cbd5e1',
          text: '#0f172a',
          textMuted: '#64748b',
          shadow: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            inset: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
            pressed: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
          }
        },
        // Dark Theme (Glassmorphic)
        dark: {
          bg: '#0a0a0f',
          surface: 'rgba(255, 255, 255, 0.05)',
          surfaceRaised: 'rgba(255, 255, 255, 0.08)',
          surfaceInset: 'rgba(0, 0, 0, 0.3)',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          glass: {
            sm: 'backdrop-blur-sm bg-white/5 border border-white/10',
            md: 'backdrop-blur-md bg-white/8 border border-white/10',
            lg: 'backdrop-blur-lg bg-white/10 border border-white/10',
          }
        }
      }
    }
  }
}
```

### Dark Mode Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // Uses .dark class strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ... extended colors from above
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 240, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(0, 240, 255, 0.2)' },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## Theme Provider & Toggle

### Theme Provider

```typescript
// components/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(systemDark ? 'dark' : 'light');
      root.classList.toggle('dark', systemDark);
    } else {
      setResolvedTheme(theme);
      root.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Theme Toggle Button

```typescript
// components/theme-toggle.tsx
'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          {theme === 'system' && <Monitor className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Aesthetic Component Patterns

### Skeuomorphic Card (Light Theme)

```typescript
// components/ui/skeuo-card.tsx
import { cn } from '@/lib/utils';

interface SkeuoCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  interactive?: boolean;
}

export function SkeuoCard({ 
  children, 
  className, 
  inset = false,
  interactive = false 
}: SkeuoCardProps) {
  return (
    <div
      className={cn(
        // Base styling
        'rounded-xl bg-white transition-all duration-200',
        
        // Shadow/depth based on type
        inset 
          ? 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-slate-100 border border-slate-200'
          : 'shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]',
        
        // Interactive states
        interactive && !inset && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px]',
        
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Glass Card (Dark Theme)

```typescript
// components/ui/glass-card.tsx
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  glow = false 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glass effect
        'rounded-xl backdrop-blur-md',
        'bg-white/5 border border-white/10',
        
        // Optional glow
        glow && 'shadow-[0_0_30px_rgba(0,240,255,0.1)]',
        
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Unified Card Component

```typescript
// components/ui/themed-card.tsx
'use client';

import { useTheme } from '../theme-provider';
import { SkeuoCard } from './skeuo-card';
import { GlassCard } from './glass-card';
import { cn } from '@/lib/utils';

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  interactive?: boolean;
  glow?: boolean;
}

export function ThemedCard({ 
  children, 
  className,
  inset = false,
  interactive = false,
  glow = false
}: ThemedCardProps) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark') {
    return (
      <GlassCard glow={glow} className={className}>
        {children}
      </GlassCard>
    );
  }

  return (
    <SkeuoCard 
      inset={inset} 
      interactive={interactive}
      className={className}
    >
      {children}
    </SkeuoCard>
  );
}
```

### Skeuomorphic Number Display

```typescript
// components/ui/number-display.tsx
'use client';

import { useTheme } from '../theme-provider';
import { cn } from '@/lib/utils';

interface NumberDisplayProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  positive?: boolean;
  negative?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NumberDisplay({
  value,
  prefix = '',
  suffix = '',
  positive,
  negative,
  className,
  size = 'md'
}: NumberDisplayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-semibold',
    xl: 'text-4xl font-bold'
  };

  const colorClass = positive 
    ? 'text-emerald-500' 
    : negative 
    ? 'text-rose-500' 
    : isDark 
    ? 'text-slate-100' 
    : 'text-slate-900';

  return (
    <span
      className={cn(
        'font-mono tabular-nums inline-flex items-baseline gap-1',
        sizeClasses[size],
        colorClass,
        
        // Inset effect for light theme
        !isDark && 'px-2 py-1 rounded-md bg-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]',
        
        // Glow effect for dark theme on positive/negative
        isDark && (positive || negative) && 'drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]',
        
        className
      )}
    >
      {prefix && <span className="opacity-60">{prefix}</span>}
      {value}
      {suffix && <span className="opacity-60">{suffix}</span>}
    </span>
  );
}
```

### Primary Action Button (Neon Cyan)

```typescript
// components/ui/cyan-button.tsx
'use client';

import { useTheme } from '../theme-provider';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CyanButtonProps extends React.ComponentProps<typeof Button> {
  glow?: boolean;
}

export function CyanButton({ className, glow = false, ...props }: CyanButtonProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      className={cn(
        // Base cyan styling
        'bg-cyan-300 hover:bg-cyan-400 text-slate-900 font-medium',
        'transition-all duration-200',
        
        // Light theme: skeuomorphic press effect
        !isDark && 'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,240,255,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,240,255,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]',
        
        // Dark theme: glass with glow
        isDark && 'shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] border border-cyan-300/50',
        
        glow && isDark && 'animate-pulse-glow',
        
        className
      )}
      {...props}
    />
  );
}
```

---

## Watchlist State Management

### Watchlist Types

```typescript
// types/watchlist.ts
export type AssetType = 'stock' | 'crypto';

export interface WatchlistItem {
  symbol: string;
  type: AssetType;
  addedAt: string;
}

export interface Watchlist {
  stocks: WatchlistItem[];
  crypto: WatchlistItem[];
}

export const DEFAULT_WATCHLIST: Watchlist = {
  stocks: [
    { symbol: 'AAPL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'MSFT', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'GOOGL', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'AMZN', type: 'stock', addedAt: new Date().toISOString() },
    { symbol: 'TSLA', type: 'stock', addedAt: new Date().toISOString() },
  ],
  crypto: [
    { symbol: 'BINANCE:BTCUSDT', type: 'crypto', addedAt: new Date().toISOString() },
    { symbol: 'BINANCE:ETHUSDT', type: 'crypto', addedAt: new Date().toISOString() },
  ],
};
```

### Watchlist Hook

```typescript
// hooks/use-watchlist.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Watchlist, WatchlistItem, DEFAULT_WATCHLIST } from '@/types/watchlist';

const STORAGE_KEY = 'market-dashboard-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Watchlist>(DEFAULT_WATCHLIST);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addToWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    setWatchlist(prev => {
      const key = type === 'stock' ? 'stocks' : 'crypto';
      if (prev[key].some(item => item.symbol === symbol)) return prev;
      
      return {
        ...prev,
        [key]: [...prev[key], { symbol, type, addedAt: new Date().toISOString() }]
      };
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    setWatchlist(prev => ({
      ...prev,
      [type === 'stock' ? 'stocks' : 'crypto']: prev[type === 'stock' ? 'stocks' : 'crypto']
        .filter(item => item.symbol !== symbol)
    }));
  }, []);

  const isInWatchlist = useCallback((symbol: string, type: 'stock' | 'crypto') => {
    const key = type === 'stock' ? 'stocks' : 'crypto';
    return watchlist[key].some(item => item.symbol === symbol);
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
```

---

## Real-time Data Polling

### Polling Hook

```typescript
// hooks/use-polling.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions<T> {
  fetchFn: () => Promise<T>;
  interval?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function usePolling<T>({
  fetchFn,
  interval = 15000, // Default 15 seconds per requirements
  enabled = true,
  onError
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

### Watchlist Polling Component

```typescript
// components/watchlist/live-watchlist.tsx
'use client';

import { usePolling } from '@/hooks/use-polling';
import { getQuotes } from '@/app/actions/quotes'; // Server Action
import { WatchlistItem } from '@/types/watchlist';
import { Quote } from '@/types/finnhub';

interface LiveWatchlistProps {
  symbols: WatchlistItem[];
}

export function LiveWatchlist({ symbols }: LiveWatchlistProps) {
  const symbolStrings = symbols.map(s => s.symbol);
  
  const { data: quotes, isLoading } = usePolling<Record<string, Quote>>({
    fetchFn: () => getQuotes(symbolStrings),
    interval: 15000,
    enabled: symbols.length > 0,
  });

  return (
    <div className="space-y-2">
      {symbols.map(item => (
        <WatchlistRow
          key={item.symbol}
          item={item}
          quote={quotes?.[item.symbol]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
```

---

## Page Components

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Market Dashboard",
  description: "Real-time market data and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Header with Theme Toggle

```typescript
// components/layout/header.tsx
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <TrendingUp className="h-6 w-6 text-cyan-300" />
          <span>MarketDash</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-cyan-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/search" className="text-sm font-medium hover:text-cyan-300 transition-colors">
            Search
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

### Dashboard Page (Server Component)

```typescript
// app/page.tsx (Dashboard)
import { getQuote, getMarketNews } from '@/lib/finnhub/cache';
import { ThemedCard } from '@/components/ui/themed-card';
import { LiveWatchlist } from '@/components/watchlist/live-watchlist';
import { NewsList } from '@/components/news/news-list';
import { DEFAULT_WATCHLIST } from '@/types/watchlist';
import { Suspense } from 'react';

export const revalidate = 60;

export default async function DashboardPage() {
  // Initial data fetch for server render
  const [initialQuotes, news] = await Promise.all([
    Promise.all(
      DEFAULT_WATCHLIST.stocks.map(item => 
        getQuote(item.symbol).catch(() => null)
      )
    ),
    getMarketNews('general').catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Market Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary cards will go here */}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Watchlist */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Watchlist</h2>
          <ThemedCard className="p-4">
            <Suspense fallback={<div>Loading watchlist...</div>}>
              <LiveWatchlistClient 
                initialSymbols={DEFAULT_WATCHLIST.stocks}
                initialQuotes={initialQuotes}
              />
            </Suspense>
          </ThemedCard>
        </section>

        {/* News */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Market News</h2>
          <ThemedCard className="p-4">
            <NewsList items={news.slice(0, 10)} />
          </ThemedCard>
        </section>
      </div>
    </div>
  );
}
```

### Stock Detail Page

```typescript
// app/stock/[symbol]/page.tsx
import { getQuote, getCompanyProfile, getBasicFinancials, getNews, getCandles, getRecommendationTrends } from '@/lib/finnhub/cache';
import { notFound } from 'next/navigation';
import { ThemedCard } from '@/components/ui/themed-card';
import { NumberDisplay } from '@/components/ui/number-display';
import { StockChart } from '@/components/charts/stock-chart';
import { RecommendationBars } from '@/components/charts/recommendation-bars';
import { KeyMetrics } from '@/components/stock/key-metrics';
import { NewsList } from '@/components/news/news-list';

interface StockPageProps {
  params: { symbol: string };
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = params;
  const upperSymbol = symbol.toUpperCase();
  
  try {
    const [quote, profile, financials, news, recommendations] = await Promise.all([
      getQuote(upperSymbol),
      getCompanyProfile(upperSymbol),
      getBasicFinancials(upperSymbol),
      getNews(upperSymbol, getDaysAgoString(7), getTodayString()),
      getRecommendationTrends(upperSymbol),
    ]);

    if (!profile || Object.keys(profile).length === 0) {
      notFound();
    }

    // Get chart data for last 30 days
    const to = Math.floor(Date.now() / 1000);
    const from = to - 30 * 24 * 60 * 60;
    const candles = await getCandles(upperSymbol, 'D', from, to);

    const isPositive = quote.d >= 0;
    const isNegative = quote.d < 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{upperSymbol} • {profile.exchange}</p>
          </div>
          <div className="text-right">
            <NumberDisplay 
              value={quote.c.toFixed(2)} 
              prefix="$" 
              size="xl"
            />
            <NumberDisplay 
              value={`${isPositive ? '+' : ''}${quote.d.toFixed(2)} (${quote.dp.toFixed(2)}%)`}
              positive={isPositive}
              negative={isNegative}
              size="md"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <ThemedCard className="p-4">
              <h2 className="text-lg font-semibold mb-4">Price Chart (30D)</h2>
              <StockChart data={candles} />
            </ThemedCard>

            {/* Key Metrics */}
            <ThemedCard className="p-4">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              <KeyMetrics financials={financials} />
            </ThemedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analyst Recommendations */}
            <ThemedCard className="p-4">
              <h2 className="text-lg font-semibold mb-4">Analyst Ratings</h2>
              <RecommendationBars trends={recommendations} />
            </ThemedCard>

            {/* Company Info */}
            <ThemedCard className="p-4">
              <h2 className="text-lg font-semibold mb-4">Company Info</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Market Cap</dt>
                  <dd>${(profile.marketCapitalization! / 1000).toFixed(2)}B</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd>{profile.finnhubIndustry}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Country</dt>
                  <dd>{profile.country}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">IPO Date</dt>
                  <dd>{profile.ipo}</dd>
                </div>
              </dl>
            </ThemedCard>

            {/* News */}
            <ThemedCard className="p-4">
              <h2 className="text-lg font-semibold mb-4">Recent News</h2>
              <NewsList items={news.slice(0, 5)} compact />
            </ThemedCard>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    throw new Error(`Failed to fetch data for ${symbol}`);
  }
}

// Helper functions
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
```

---

## Chart Components

### Stock Price Chart (Line Chart)

```typescript
// components/charts/stock-chart.tsx
'use client';

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { CandleData } from '@/types/finnhub';
import { useTheme } from '@/components/theme-provider';
import { format } from 'date-fns';

interface StockChartProps {
  data: CandleData;
}

export function StockChart({ data }: StockChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!data || data.s === 'no_data' || !data.c) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No chart data available</div>;
  }

  const chartData = data.t.map((timestamp, i) => ({
    date: new Date(timestamp * 1000),
    price: data.c[i],
    volume: data.v[i],
  }));

  const minPrice = Math.min(...data.c);
  const maxPrice = Math.max(...data.c);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor="#00f0ff" 
                stopOpacity={isDark ? 0.3 : 0.2}
              />
              <stop 
                offset="95%" 
                stopColor="#00f0ff" 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date"
            tickFormatter={(date) => format(date, 'MMM d')}
            stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
            fontSize={12}
          />
          
          <YAxis 
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(price) => `$${price.toFixed(0)}`}
            stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
            fontSize={12}
            width={60}
          />
          
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const data = payload[0].payload;
                return (
                  <div className={`
                    p-3 rounded-lg text-sm
                    ${isDark ? 'bg-slate-900/90 border border-white/10' : 'bg-white shadow-lg border border-slate-200'}
                  `}>
                    <p className="text-muted-foreground mb-1">
                      {format(data.date, 'MMM d, yyyy')}
                    </p>
                    <p className="font-mono font-semibold text-cyan-300">
                      ${data.price.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Vol: {data.volume.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#00f0ff"
            strokeWidth={isDark ? 3 : 2}
            fill="url(#colorPrice)"
            dot={false}
            activeDot={{ 
              r: isDark ? 6 : 4, 
              fill: '#00f0ff',
              stroke: isDark ? '#0a0a0f' : '#ffffff',
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Recommendation Bars

```typescript
// components/charts/recommendation-bars.tsx
'use client';

import { RecommendationTrend } from '@/types/finnhub';
import { useTheme } from '@/components/theme-provider';

interface RecommendationBarsProps {
  trends: RecommendationTrend[];
}

export function RecommendationBars({ trends }: RecommendationBarsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  if (!trends || trends.length === 0) {
    return <div className="text-muted-foreground text-sm">No recommendations available</div>;
  }

  const latest = trends[0];
  const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
  
  const categories = [
    { key: 'strongBuy', label: 'Strong Buy', color: 'bg-emerald-500', value: latest.strongBuy },
    { key: 'buy', label: 'Buy', color: 'bg-emerald-400', value: latest.buy },
    { key: 'hold', label: 'Hold', color: 'bg-yellow-400', value: latest.hold },
    { key: 'sell', label: 'Sell', color: 'bg-rose-400', value: latest.sell },
    { key: 'strongSell', label: 'Strong Sell', color: 'bg-rose-500', value: latest.strongSell },
  ];

  return (
    <div className="space-y-3">
      {/* Period label */}
      <p className="text-xs text-muted-foreground">
        Based on {total} analysts • {latest.period}
      </p>
      
      {/* Stacked bar */}
      <div className={`
        flex h-8 rounded-lg overflow-hidden
        ${isDark ? 'shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] bg-slate-100'}
      `}>
        {categories.map(cat => {
          const pct = total > 0 ? (cat.value / total) * 100 : 0;
          return pct > 0 ? (
            <div
              key={cat.key}
              className={`${cat.color} transition-all duration-300 relative group`}
              style={{ width: `${pct}%` }}
            >
              {/* Tooltip */}
              <div className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                px-2 py-1 rounded text-xs font-medium
                bg-slate-900 text-white
                opacity-0 group-hover:opacity-100 transition-opacity
                pointer-events-none whitespace-nowrap
                z-10
              ">
                {cat.label}: {cat.value}
              </div>
            </div>
          ) : null;
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${cat.color}`} />
            <span className="text-muted-foreground">{cat.label}</span>
            <span className="font-medium">{cat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Directory Structure

```
app/
├── layout.tsx              # Root layout with ThemeProvider
├── page.tsx                # Dashboard (Server Component)
├── globals.css             # Global styles with Tailwind
├── stock/
│   └── [symbol]/
│       └── page.tsx        # Stock detail page
├── search/
│   └── page.tsx            # Symbol search page
└── actions/
    └── quotes.ts           # Server Actions for client fetching

components/
├── theme-provider.tsx      # Theme context and provider
├── theme-toggle.tsx        # Theme toggle button in header
├── layout/
│   └── header.tsx          # App header with nav
├── ui/
│   ├── themed-card.tsx     # Unified card (skeuo/glass)
│   ├── skeuo-card.tsx      # Light theme card
│   ├── glass-card.tsx      # Dark theme card
│   ├── number-display.tsx  # Inset number display
│   └── cyan-button.tsx     # Primary action button
├── charts/
│   ├── stock-chart.tsx     # Line chart component
│   └── recommendation-bars.tsx # Analyst ratings
├── watchlist/
│   ├── live-watchlist.tsx  # Polling watchlist
│   └── watchlist-row.tsx   # Single watchlist item
├── stock/
│   └── key-metrics.tsx     # Financial metrics display
└── news/
    └── news-list.tsx       # News feed component

hooks/
├── use-theme.ts            # Theme hook (re-export)
├── use-watchlist.ts        # Watchlist state management
└── use-polling.ts          # Data polling hook

lib/
├── utils.ts                # cn() and utilities
└── finnhub/                # (from backend)
    └── cache.ts

types/
├── finnhub.ts              # API types (from backend)
├── theme.ts                # Theme types
└── watchlist.ts            # Watchlist types
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Implementation Notes

### Server vs Client Components
- **Server Components**: Page shells, initial data fetching, metadata
- **Client Components**: Theme provider, polling hooks, interactive UI

### Performance Optimizations
- Server Components for initial render (no JS bundle)
- `usePolling` hook with 15-second interval for real-time feel
- React `cache()` for deduplicated API calls
- `suppressHydrationWarning` on html element for theme mismatch

### Theme Consistency
- Always use `useTheme()` hook for conditional styling
- Neon cyan (#00f0ff) is consistent across both themes
- Light: Skeuomorphic depth with shadows and insets
- Dark: Glassmorphism with backdrop-blur and transparency

### Watchlist MVP Features
- Default stock and crypto watchlists
- localStorage persistence
- Add/remove functionality (future enhancement)
