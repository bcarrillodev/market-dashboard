'use client';

import { CryptoTimeSeries } from '@/types/alphavantage';
import { TimeSeriesChart } from '@/components/charts/time-series-chart';

interface CryptoChartProps {
  data: CryptoTimeSeries;
}

export function CryptoChart({ data }: CryptoChartProps) {
  return <TimeSeriesChart candles={data?.candles ?? []} />;
}
