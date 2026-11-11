import { motion } from 'framer-motion';
import { PRICING } from '../../config/business';
import { formatINR } from '../../lib/format';

/** Minimum-order guardrail. Threshold lives in config/business.ts (demo value). */
export function MinimumBar({ shortBy, subtotal }: { shortBy: number; subtotal: number }) {
  const pct = Math.min(1, subtotal / PRICING.minimumOrder);
  if (shortBy <= 0) return null;
  return (
    <div className="minbar" role="status">
      <p className="small">
        Add <strong className="num">{formatINR(shortBy)}</strong> more to place an order. Minimum order is{' '}
        <span className="num">{formatINR(PRICING.minimumOrder)}</span>.
      </p>
      <div className="minbar-track" aria-hidden>
        <motion.div className="minbar-fill" initial={false} animate={{ scaleX: pct }} transition={{ type: 'spring', stiffness: 260, damping: 32 }} />
      </div>
    </div>
  );
}
