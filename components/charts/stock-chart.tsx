'use client';

import { useState } from 'react';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StockTimeSeries } from '@/types/alphavantage';
import { useTheme } from '@/components/theme-provider';
import { format } from 'date-fns';

interface StockChartProps {
  data: StockTimeSeries;
}

export function StockChart({ data }: StockChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [timePeriod, setTimePeriod] = useState<'6M' | '3M' | '2M' | '1M' | '1W'>('6M');

  if (!data || !data.candles || data.candles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  // Filter data based on selected time period
  const filterDataByPeriod = () => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timePeriod) {
      case '6M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); // 6 months ago
        break;
      case '3M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); // 3 months ago
        break;
      case '2M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()); // 2 months ago
        break;
      case '1M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); // 1 month ago
        break;
      case '1W':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      default:
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    // Filter candles based on date
    return data.candles.filter(candle => new Date(candle.date) >= cutoffDate);
  };

  const filteredCandles = filterDataByPeriod();
  const chartData = filteredCandles.map((candle) => ({
    date: new Date(candle.date),
    price: candle.close,
    volume: candle.volume,
  })).reverse();

  const prices = data.candles.map(c => c.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="space-y-4">
      {/* Time Period Toggle */}
      <div className="flex gap-2">
        {(['6M', '3M', '2M', '1M', '1W'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md transition-colors
              ${timePeriod === period
                ? isDark 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-cyan-100 text-cyan-600 border border-cyan-200'
                : isDark
                  ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }
            `}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Chart */}
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
            domain={[0, maxPrice + padding]}
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
                  <div className={`
                    p-3 rounded-lg text-sm
                    ${isDark ? 'bg-slate-900/90 border border-white/10' : 'bg-white shadow-lg border border-slate-200'}
                  `}>
                    <p className="text-muted-foreground mb-1">
                      {format(item.date, 'MMM d, yyyy')}
                    </p>
                    <p className="font-mono font-semibold text-cyan-300">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Vol: {item.volume.toLocaleString()}
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
    </div>
  );
}
