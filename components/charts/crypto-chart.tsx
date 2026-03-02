'use client';

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CryptoTimeSeries } from '@/types/alphavantage';
import { useTheme } from '@/components/theme-provider';
import { format } from 'date-fns';

interface CryptoChartProps {
  data: CryptoTimeSeries;
}

export function CryptoChart({ data }: CryptoChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!data || !data.candles || data.candles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const chartData = data.candles.map((candle) => ({
    date: new Date(candle.date),
    price: candle.close,
    volume: candle.volume,
    marketCap: candle.marketCap,
  }));

  const prices = data.candles.map(c => c.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor="#f97316" 
                stopOpacity={isDark ? 0.3 : 0.2}
              />
              <stop 
                offset="95%" 
                stopColor="#f97316" 
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
                const item = payload[0].payload;
                return (
                  <div className={`
                    p-3 rounded-lg text-sm
                    ${isDark ? 'bg-slate-900/90 border border-white/10' : 'bg-white shadow-lg border border-slate-200'}
                  `}>
                    <p className="text-muted-foreground mb-1">
                      {format(item.date, 'MMM d, yyyy')}
                    </p>
                    <p className="font-mono font-semibold text-orange-300">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Vol: {item.volume.toLocaleString()}
                    </p>
                    {item.marketCap && (
                      <p className="text-muted-foreground text-xs mt-1">
                        MC: ${(item.marketCap / 1000000000).toFixed(2)}B
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#f97316"
            strokeWidth={isDark ? 3 : 2}
            fill="url(#colorCrypto)"
            dot={false}
            activeDot={{ 
              r: isDark ? 6 : 4, 
              fill: '#f97316',
              stroke: isDark ? '#0a0a0f' : '#ffffff',
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
