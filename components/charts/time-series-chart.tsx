'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '@/components/theme-provider';
import type { Candle } from '@/types/alphavantage';
import { cn } from '@/lib/utils';

const TIME_PERIODS = ['6M', '3M', '2M', '1M', '1W'] as const;

type TimePeriod = (typeof TIME_PERIODS)[number];

interface TimeSeriesChartProps {
  candles: Candle[];
}

function getCutoffDate(timePeriod: TimePeriod): Date {
  const now = new Date();

  switch (timePeriod) {
    case '6M':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case '3M':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '2M':
      return new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    case '1M':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export function TimeSeriesChart({ candles }: TimeSeriesChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('6M');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gradientId = useId();
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setChartSize({
        width: Math.max(0, Math.floor(width)),
        height: Math.max(0, Math.floor(height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  if (!candles.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const filteredCandles = candles.filter((candle) => new Date(candle.date) >= getCutoffDate(timePeriod));
  const visibleCandles = filteredCandles.length > 0 ? filteredCandles : candles.slice(0, Math.min(candles.length, 30));
  const chartData = visibleCandles
    .map((candle) => ({
      date: new Date(candle.date),
      price: candle.close,
      volume: candle.volume,
    }))
    .reverse();
  const prices = visibleCandles.map((candle) => candle.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  const baselinePadding = maxPrice !== 0 ? Math.abs(maxPrice) * 0.02 : 1;
  const padding = range === 0 ? baselinePadding : range * 0.1;
  const yAxisMin = Math.max(0, minPrice - padding);
  const yAxisMax = maxPrice + padding;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TIME_PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              timePeriod === period
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-100 text-cyan-600 border border-cyan-200'
                : isDark
                  ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            )}
          >
            {period}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="h-80 min-w-0">
        {chartSize.width > 0 && chartSize.height > 0 ? (
          <AreaChart width={chartSize.width} height={chartSize.height} data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={isDark ? 0.3 : 0.2} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(date, 'MMM d')}
              stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              fontSize={12}
            />

            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tickFormatter={(price) => `$${price.toFixed(0)}`}
              stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              fontSize={12}
              width={60}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const item = payload[0].payload;
                  return (
                    <div
                      className={cn(
                        'p-3 rounded-lg text-sm',
                        isDark ? 'bg-slate-900/90 border border-white/10' : 'bg-white shadow-lg border border-slate-200'
                      )}
                    >
                      <p className="text-muted-foreground mb-1">{format(item.date, 'MMM d, yyyy')}</p>
                      <p className="font-mono font-semibold text-cyan-300">${item.price.toFixed(2)}</p>
                      <p className="text-muted-foreground text-xs mt-1">Vol: {item.volume.toLocaleString()}</p>
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
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: isDark ? 6 : 4,
                fill: '#00f0ff',
                stroke: isDark ? '#0a0a0f' : '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        ) : null}
      </div>
    </div>
  );
}
