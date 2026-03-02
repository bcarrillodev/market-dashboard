import { getStockDetail } from '@/app/actions/quotes';
import { notFound } from 'next/navigation';
import { ThemedCard } from '@/components/ui/themed-card';
import { NumberDisplay } from '@/components/ui/number-display';
import { StockChart } from '@/components/charts/stock-chart';
import { RecommendationBars } from '@/components/charts/recommendation-bars';
import { KeyMetrics } from '@/components/stock/key-metrics';
import { NewsList } from '@/components/news/news-list';
import { WatchlistButton } from '@/components/watchlist/watchlist-button';

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{profile.name || symbol.toUpperCase()}</h1>
          <p className="text-muted-foreground">
            {symbol.toUpperCase()} {profile.exchange && `• ${profile.exchange}`}
          </p>
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
            <dl className="space-y-2 text-sm">
              {profile.marketCapitalization && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Market Cap</dt>
                  <dd>${(profile.marketCapitalization / 1000).toFixed(2)}B</dd>
                </div>
              )}
              {profile.finnhubIndustry && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd>{profile.finnhubIndustry}</dd>
                </div>
              )}
              {profile.country && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Country</dt>
                  <dd>{profile.country}</dd>
                </div>
              )}
              {profile.ipo && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">IPO Date</dt>
                  <dd>{profile.ipo}</dd>
                </div>
              )}
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
}
