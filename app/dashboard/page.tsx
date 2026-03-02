import { getQuote, getMarketNews } from '@/lib/finnhub/cache';
import { safeFetch } from '@/lib/finnhub/error-handler';
import type { Quote, NewsItem } from '@/types/finnhub';
import { ThemedCard } from '@/components/ui/themed-card';
import { NewsList } from '@/components/news/news-list';
import { LiveWatchlist } from '@/components/watchlist/live-watchlist';
import { DEFAULT_WATCHLIST } from '@/types/watchlist';
import { Suspense } from 'react';

export const revalidate = 60;

export default async function DashboardPage() {
  // Initial data fetch for server render
  const [initialQuotes, news] = await Promise.all([
    Promise.all(
      DEFAULT_WATCHLIST.items.map(item => 
        safeFetch(() => getQuote(item.symbol), null)
      )
    ),
    safeFetch(() => getMarketNews('general'), []),
  ]);

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Market Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary cards could go here */}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Watchlist */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Watchlist</h2>
          <ThemedCard className="p-4">
            <Suspense fallback={<div>Loading watchlist...</div>}>
              <LiveWatchlist 
                symbols={DEFAULT_WATCHLIST.items}
                initialQuotes={initialQuotes}
              />
            </Suspense>
          </ThemedCard>
        </section>

        {/* News */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Market News</h2>
          <ThemedCard className="p-4">
            <NewsList items={news.slice(0, 10)} />
          </ThemedCard>
        </section>
      </div>
    </div>
  );
}
