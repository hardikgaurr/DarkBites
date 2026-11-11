import { Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  min?: number;
  size?: 'sm' | 'md';
  /** Show a remove icon when the value would drop to zero. */
  removable?: boolean;
  label: string;
}

export function QtyStepper({ value, onChange, max = 99, min = 1, size = 'md', removable, label }: Props) {
  const atMin = value <= min;
  return (
    <div className={`stepper stepper-${size}`} role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(value - 1)}
        disabled={atMin && !removable}
        aria-label={atMin && removable ? `Remove ${label}` : 'Decrease quantity'}
      >
        {atMin && removable ? <Trash2 size={15} strokeWidth={1.6} /> : <Minus size={15} strokeWidth={1.6} />}
      </button>
      <output className="stepper-val num" aria-live="polite">
        {value}
      </output>
      <button type="button" className="stepper-btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={15} strokeWidth={1.6} />
      </button>
    </div>
  );
}
