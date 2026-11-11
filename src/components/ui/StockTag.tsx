import { availabilityLabel, type Availability } from '../../services/inventory';

export function StockTag({ value, stock, quiet }: { value: Availability; stock?: number; quiet?: boolean }) {
  if (quiet && value === 'in_stock') return null;
  const text = value === 'low_stock' && stock ? `Only ${stock} left` : availabilityLabel[value];
  return (
    <span className={`stock stock-${value}`}>
      <span className="stock-dot" aria-hidden />
      {text}
    </span>
  );
}
