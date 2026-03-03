interface InfoListItem {
  label: string;
  value: string;
}

interface InfoListProps {
  items: InfoListItem[];
}

export function InfoList({ items }: InfoListProps) {
  return (
    <dl className="space-y-2 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
