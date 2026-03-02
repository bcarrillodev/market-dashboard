import { CryptoTimeSeries } from '@/types/alphavantage';
import { ThemedCard } from '@/components/ui/themed-card';
import { NumberDisplay } from '@/components/ui/number-display';

interface CryptoMetricsProps {
  timeSeries: CryptoTimeSeries;
}

export function CryptoMetrics({ timeSeries }: CryptoMetricsProps) {
  const latestCandle = timeSeries.candles[0];
  const previousCandle = timeSeries.candles[1];
  
  if (!latestCandle) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No metrics data available
      </div>
    );
  }

  const currentPrice = latestCandle.close;
  const previousPrice = previousCandle?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  
  const isPositive = priceChange >= 0;
  const isNegative = priceChange < 0;

  // Calculate 24h volume (sum of last day's candles)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const lastDayCandles = timeSeries.candles.filter(candle => 
    new Date(candle.date) >= oneDayAgo
  );
  const volume24h = lastDayCandles.reduce((sum, candle) => sum + candle.volume, 0);

  // Get latest market cap
  const marketCap = latestCandle.marketCap;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Current Price</div>
        <NumberDisplay 
          value={currentPrice.toFixed(2)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">24h Change</div>
        <NumberDisplay 
          value={`${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%`}
          positive={isPositive}
          negative={isNegative}
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
        <NumberDisplay 
          value={volume24h.toLocaleString()} 
          size="lg"
        />
      </ThemedCard>

      {marketCap && (
        <ThemedCard className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
          <NumberDisplay 
            value={(marketCap / 1000000000).toFixed(2)} 
            suffix="B"
            prefix="$"
            size="lg"
          />
        </ThemedCard>
      )}

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day High</div>
        <NumberDisplay 
          value={latestCandle.high.toFixed(2)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day Low</div>
        <NumberDisplay 
          value={latestCandle.low.toFixed(2)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day Open</div>
        <NumberDisplay 
          value={latestCandle.open.toFixed(2)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Data Points</div>
        <NumberDisplay 
          value={timeSeries.candles.length.toString()} 
          size="lg"
        />
      </ThemedCard>
    </div>
  );
}
