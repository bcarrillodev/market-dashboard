import { getCryptoDetail } from '@/app/actions/crypto';
import { notFound } from 'next/navigation';
import { ThemedCard } from '@/components/ui/themed-card';
import { NumberDisplay } from '@/components/ui/number-display';
import { CryptoChart } from '@/components/charts/crypto-chart';
import { CryptoMetrics } from '@/components/crypto/crypto-metrics';
import { NewsList } from '@/components/news/news-list';
import { WatchlistButton } from '@/components/watchlist/watchlist-button';

interface CryptoPageProps {
  params: { symbol: string };
}

export default async function CryptoPage({ params }: CryptoPageProps) {
  const { symbol } = params;
  // Add BINANCE: prefix for crypto API calls
  const finnhubSymbol = `BINANCE:${symbol}`;
  const detail = await getCryptoDetail(finnhubSymbol);

  if (!detail) {
    notFound();
  }

  const { timeSeries, news } = detail;
  const latestCandle = timeSeries.candles[0];
  const previousCandle = timeSeries.candles[1];
  
  const currentPrice = latestCandle?.close || 0;
  const previousPrice = previousCandle?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  
  const isPositive = priceChange >= 0;
  const isNegative = priceChange < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{timeSeries.name || symbol.toUpperCase()}</h1>
          <p className="text-muted-foreground">
            {symbol.toUpperCase()} {timeSeries.market && `• ${timeSeries.market}`}
          </p>
        </div>
        <div className="text-right">
          <NumberDisplay 
            value={currentPrice.toFixed(2)} 
            prefix="$" 
            size="xl"
          />
          <NumberDisplay 
            value={`${isPositive ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`}
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
            <CryptoChart data={timeSeries} />
          </ThemedCard>

          {/* Crypto Metrics */}
          <ThemedCard className="p-4">
            <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
            <CryptoMetrics timeSeries={timeSeries} />
          </ThemedCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Watchlist Actions */}
          <ThemedCard className="p-4">
            <WatchlistButton symbol={finnhubSymbol} type="crypto" />
          </ThemedCard>

          {/* Crypto Info */}
          <ThemedCard className="p-4">
            <h2 className="text-lg font-semibold mb-4">Crypto Info</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Symbol</dt>
                <dd>{symbol.toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Market</dt>
                <dd>{timeSeries.market}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Updated</dt>
                <dd>{new Date(timeSeries.lastRefreshed).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Time Zone</dt>
                <dd>{timeSeries.timeZone}</dd>
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
}
