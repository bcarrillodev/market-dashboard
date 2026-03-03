import { getStockDetail } from '@/app/actions/quotes';
import { notFound } from 'next/navigation';
import { ThemedCard } from '@/components/ui/themed-card';
import { StockChart } from '@/components/charts/stock-chart';
import { RecommendationBars } from '@/components/charts/recommendation-bars';
import { KeyMetrics } from '@/components/stock/key-metrics';
import { NewsList } from '@/components/news/news-list';
import { WatchlistButton } from '@/components/watchlist/watchlist-button';
import { AssetDetailHeader } from '@/components/asset/asset-detail-header';
import { InfoList } from '@/components/asset/info-list';

export const revalidate = 300;

interface StockPageProps {
  params: { symbol: string };
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = params;
  const detail = await getStockDetail(symbol);

  if (!detail) {
    notFound();
  }

  const { quote, profile, financials, news, recommendations, candles } = detail;
  const isPositive = quote.d >= 0;
  const isNegative = quote.d < 0;

  return (
    <div className="space-y-6">
      <AssetDetailHeader
        title={profile.name || symbol.toUpperCase()}
        subtitle={`${symbol.toUpperCase()}${profile.exchange ? ` • ${profile.exchange}` : ''}`}
        price={quote.c.toFixed(2)}
        change={`${isPositive ? '+' : ''}${quote.d.toFixed(2)} (${quote.dp.toFixed(2)}%)`}
        isPositive={isPositive}
        isNegative={isNegative}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="min-w-0 lg:col-span-2 space-y-6">
          {/* Chart */}
          <ThemedCard className="min-w-0 p-4">
            <h2 className="text-lg font-semibold mb-4">Price Chart</h2>
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
          {/* Watchlist Actions */}
          <ThemedCard className="p-4">
            <WatchlistButton symbol={symbol} type="stock" />
          </ThemedCard>

          {/* Analyst Recommendations */}
          <ThemedCard className="p-4">
            <h2 className="text-lg font-semibold mb-4">Analyst Ratings</h2>
            <RecommendationBars trends={recommendations} />
          </ThemedCard>

          {/* Company Info */}
          <ThemedCard className="p-4">
            <h2 className="text-lg font-semibold mb-4">Company Info</h2>
            <InfoList
              items={[
                profile.marketCapitalization
                  ? { label: 'Market Cap', value: `$${(profile.marketCapitalization / 1000).toFixed(2)}B` }
                  : null,
                profile.finnhubIndustry
                  ? { label: 'Industry', value: profile.finnhubIndustry }
                  : null,
                profile.country
                  ? { label: 'Country', value: profile.country }
                  : null,
                profile.ipo
                  ? { label: 'IPO Date', value: profile.ipo }
                  : null,
              ].filter((item): item is { label: string; value: string } => item !== null)}
            />
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
}
