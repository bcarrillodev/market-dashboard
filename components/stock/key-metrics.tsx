import { BasicFinancials } from '@/types/finnhub';
import { NumberDisplay } from '@/components/ui/number-display';
import { ThemedCard } from '@/components/ui/themed-card';

interface KeyMetricsProps {
  financials: BasicFinancials;
}

export function KeyMetrics({ financials }: KeyMetricsProps) {
  const metrics = [
    { label: 'P/E Ratio', value: financials.metric['peTTM'], format: '2' },
    { label: 'EPS (TTM)', value: financials.metric['epsTTM'], format: '2', prefix: '$' },
    { label: 'ROE', value: financials.metric['roeTTM'], format: '2', suffix: '%' },
    { label: 'ROA', value: financials.metric['roaTTM'], format: '2', suffix: '%' },
    // { label: 'Debt/Equity', value: financials.metric['totalDebt/totalEquityTTM'], format: '2' },
    // { label: 'Current Ratio', value: financials.metric['currentRatioTTM'], format: '2' },
    { label: 'Gross Margin', value: financials.metric['grossMarginTTM'], format: '2', suffix: '%' },
    { label: 'Operating Margin', value: financials.metric['operatingMarginTTM'], format: '2', suffix: '%' },
    { label: '52W High', value: financials.metric['52WeekHigh'], format: '2', prefix: '$' },
    { label: '52W Low', value: financials.metric['52WeekLow'], format: '2', prefix: '$' },
    { label: 'Dividend Yield', value: financials.metric['dividendYieldIndicatedAnnual'], format: '2', suffix: '%' },
    { label: 'Beta', value: financials.metric['beta'], format: '2' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <ThemedCard key={metric.label} className="p-4">
          <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
          {metric.value !== null && metric.value !== undefined ? (
            <NumberDisplay
              value={metric.value.toFixed(parseInt(metric.format))}
              prefix={metric.prefix}
              suffix={metric.suffix}
              size="lg"
            />
          ) : (
            <span className="text-lg text-muted-foreground">—</span>
          )}
        </ThemedCard>
      ))}
    </div>
  );
}
