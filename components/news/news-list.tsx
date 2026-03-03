'use client';

import Image from 'next/image';
import { NewsItem } from '@/types/finnhub';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsListProps {
  items: NewsItem[];
  compact?: boolean;
}

export function NewsList({ items, compact = false }: NewsListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No news available
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group block p-3 rounded-lg transition-colors",
            "hover:bg-accent/50"
          )}
        >
          <div className="flex gap-3">
            {!compact && item.image && (
              <Image
                src={item.image}
                alt={item.headline}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-medium leading-tight group-hover:text-cyan-300 transition-colors",
                compact ? "text-sm" : "text-base"
              )}>
                {item.headline}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{item.source}</span>
                <span>•</span>
                <span>{format(item.datetime * 1000, 'MMM d, h:mm a')}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {!compact && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {item.summary}
                </p>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
