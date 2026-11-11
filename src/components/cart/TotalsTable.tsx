import { PRICING } from '../../config/business';
import { formatINR } from '../../lib/format';
import type { Totals } from '../../lib/pricing';

export function TotalsTable({ totals }: { totals: Totals }) {
  return (
    <dl className="totals num">
      <div>
        <dt>Item total</dt>
        <dd>{formatINR(totals.subtotal)}</dd>
      </div>
      <div>
        <dt>Packaging</dt>
        <dd>{formatINR(totals.packaging)}</dd>
      </div>
      <div>
        <dt>Delivery</dt>
        <dd>{totals.delivery === 0 ? 'Free' : formatINR(totals.delivery)}</dd>
      </div>
      <div>
        <dt>{PRICING.taxLabel}</dt>
        <dd>{formatINR(totals.tax)}</dd>
      </div>
      <div className="totals-grand">
        <dt>To pay</dt>
        <dd>{formatINR(totals.total)}</dd>
      </div>
    </dl>
  );
}
