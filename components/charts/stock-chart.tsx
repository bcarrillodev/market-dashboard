'use client';

import { StockTimeSeries } from '@/types/alphavantage';
import { TimeSeriesChart } from '@/components/charts/time-series-chart';

interface StockChartProps {
  data: StockTimeSeries;
}

export function StockChart({ data }: StockChartProps) {
  return <TimeSeriesChart candles={data?.candles ?? []} />;
}
