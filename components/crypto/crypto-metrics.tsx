import { CryptoTimeSeries } from '@/types/alphavantage';
import { ThemedCard } from '@/components/ui/themed-card';
import { NumberDisplay } from '@/components/ui/number-display';

interface CryptoMetricsProps {
  timeSeries: CryptoTimeSeries;
  symbol: string;
}

export function CryptoMetrics({ timeSeries, symbol }: CryptoMetricsProps) {
  const latestCandle = timeSeries.candles[0];
  const previousCandle = timeSeries.candles[1];
  
  if (!latestCandle) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No metrics data available
      </div>
    );
  }

  const isBTC = symbol.toUpperCase() === 'BTCUSDT';
  const decimalPlaces = isBTC ? 0 : 2;

  const currentPrice = latestCandle.close;
  const previousPrice = previousCandle?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  
  const isPositive = priceChange >= 0;
  const isNegative = priceChange < 0;

  // Alpha Vantage crypto data is daily/weekly aggregated, so the latest candle
  // already represents the most recent 24h volume when daily data is available.
  const volume24h = latestCandle.volume;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Current Price</div>
        <NumberDisplay 
          value={currentPrice.toFixed(decimalPlaces)} 
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
          value={volume24h.toFixed(decimalPlaces)} 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day High</div>
        <NumberDisplay 
          value={latestCandle.high.toFixed(decimalPlaces)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day Low</div>
        <NumberDisplay 
          value={latestCandle.low.toFixed(decimalPlaces)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>

      <ThemedCard className="p-4">
        <div className="text-sm text-muted-foreground mb-1">Day Open</div>
        <NumberDisplay 
          value={latestCandle.open.toFixed(decimalPlaces)} 
          prefix="$" 
          size="lg"
        />
      </ThemedCard>
    </div>
  );
}
