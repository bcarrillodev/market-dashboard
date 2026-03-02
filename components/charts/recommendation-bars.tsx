'use client';

import { RecommendationTrend } from '@/types/finnhub';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface RecommendationBarsProps {
  trends: RecommendationTrend[];
}

export function RecommendationBars({ trends }: RecommendationBarsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!trends || trends.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No recommendation data available
      </div>
    );
  }

  // Get the most recent trend
  const latest = trends[0];
  const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;

  if (total === 0) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No recommendation data available
      </div>
    );
  }

  const data = [
    { label: 'Strong Buy', value: latest.strongBuy, color: 'bg-emerald-600' },
    { label: 'Buy', value: latest.buy, color: 'bg-emerald-400' },
    { label: 'Hold', value: latest.hold, color: 'bg-yellow-400' },
    { label: 'Sell', value: latest.sell, color: 'bg-rose-400' },
    { label: 'Strong Sell', value: latest.strongSell, color: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className={cn(
        "flex h-8 rounded-lg overflow-hidden",
        isDark ? "bg-white/5" : "bg-slate-100"
      )}>
        {data.map((item) => (
          item.value > 0 && (
            <div
              key={item.label}
              className={cn(item.color, "relative group")}
              style={{ width: `${(item.value / total) * 100}%` }}
            >
              {/* Tooltip */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10",
                isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-lg"
              )}>
                {item.label}: {item.value}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded", item.color)} />
            <span className={cn(
              "text-muted-foreground",
              item.value > 0 && "font-medium text-foreground"
            )}>
              {item.label} ({item.value})
            </span>
          </div>
        ))}
      </div>

      {/* Period info */}
      <p className="text-xs text-muted-foreground text-center">
        Based on {total} analyst ratings for {latest.period}
      </p>
    </div>
  );
}
