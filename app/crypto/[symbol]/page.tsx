import { getCryptoDetail } from '@/app/actions/crypto';
import { notFound } from 'next/navigation';
import { ThemedCard } from '@/components/ui/themed-card';
import { CryptoChart } from '@/components/charts/crypto-chart';
import { CryptoMetrics } from '@/components/crypto/crypto-metrics';
import { NewsList } from '@/components/news/news-list';
import { WatchlistButton } from '@/components/watchlist/watchlist-button';
import { normalizeSymbol } from '@/lib/symbols';
import { AssetDetailHeader } from '@/components/asset/asset-detail-header';
import { InfoList } from '@/components/asset/info-list';

export const revalidate = 300;

interface CryptoPageProps {
  params: { symbol: string };
}

export default async function CryptoPage({ params }: CryptoPageProps) {
  const { symbol } = params;
  const finnhubSymbol = normalizeSymbol(symbol, 'crypto');
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
      <AssetDetailHeader
        title={timeSeries.name || symbol.toUpperCase()}
        subtitle={`${symbol.toUpperCase()}${timeSeries.market ? ` • ${timeSeries.market}` : ''}`}
        price={currentPrice.toFixed(2)}
        change={`${isPositive ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`}
        isPositive={isPositive}
        isNegative={isNegative}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="min-w-0 lg:col-span-2 space-y-6">
          {/* Chart */}
          <ThemedCard className="min-w-0 p-4">
            <h2 className="text-lg font-semibold mb-4">Price Chart</h2>
            <CryptoChart data={timeSeries} />
          </ThemedCard>

          {/* Crypto Metrics */}
          <ThemedCard className="p-4">
            <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
            <CryptoMetrics timeSeries={timeSeries} symbol={symbol} />
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
            <InfoList
              items={[
                { label: 'Symbol', value: symbol.toUpperCase() },
                { label: 'Market', value: timeSeries.market },
                { label: 'Last Updated', value: new Date(timeSeries.lastRefreshed).toLocaleDateString() },
                { label: 'Time Zone', value: timeSeries.timeZone },
              ]}
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
