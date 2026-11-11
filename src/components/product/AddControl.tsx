import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Product } from '../../data/products';
import { quickAdd } from '../../lib/actions';
import { canPurchase, useAvailability } from '../../store/inventory';
import { lineKey, setLineQty, stockFor, unitsInCart, useCartLines } from '../../store/cart';
import { QtyStepper } from '../ui/QtyStepper';

/** Quick add for the default configuration; turns into a stepper once it is in the bag. */
export function AddControl({ product, tone = 'light' }: { product: Product; tone?: 'light' | 'dark' }) {
  const availability = useAvailability(product.id);
  const lines = useCartLines();
  const key = lineKey({ productId: product.id, variantId: product.variants[0].id, addOnIds: [] });
  const line = lines.find((l) => l.key === key);
  const purchasable = canPurchase(availability);

  if (!purchasable) {
    return (
      <span className={`add-btn is-disabled add-${tone}`} aria-disabled="true">
        {availability === 'sold_out' ? 'Sold out' : 'Unavailable'}
      </span>
    );
  }
  if (line) {
    const max = line.qty + Math.max(0, stockFor(product.id) - unitsInCart(product.id));
    return <QtyStepper size="sm" value={line.qty} max={max} removable onChange={(n) => setLineQty(key, n)} label={product.name} />;
  }
  return (
    <motion.button
      type="button"
      className={`add-btn add-${tone}`}
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        quickAdd(product);
      }}
      aria-label={`Add ${product.name}, ${product.variants[0].label}, to bag`}
    >
      <Plus size={15} strokeWidth={1.8} />
      Add
    </motion.button>
  );
}
