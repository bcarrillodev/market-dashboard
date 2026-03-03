import { NumberDisplay } from '@/components/ui/number-display';

interface AssetDetailHeaderProps {
  title: string;
  subtitle: string;
  price: string;
  change: string;
  isPositive: boolean;
  isNegative: boolean;
}

export function AssetDetailHeader({
  title,
  subtitle,
  price,
  change,
  isPositive,
  isNegative,
}: AssetDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-right">
        <NumberDisplay value={price} prefix="$" size="xl" />
        <NumberDisplay value={change} positive={isPositive} negative={isNegative} size="md" />
      </div>
    </div>
  );
}
