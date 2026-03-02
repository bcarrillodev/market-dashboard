'use client';

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CandleData } from '@/types/finnhub';
import { useTheme } from '@/components/theme-provider';
import { format } from 'date-fns';

interface StockChartProps {
  data: CandleData;
}

export function StockChart({ data }: StockChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!data || data.s === 'no_data' || !data.c || data.c.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
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
  );
}
