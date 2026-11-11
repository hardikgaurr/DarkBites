import type { Product } from '../data/products';
import { navigate } from './router';
import { variantOf, type LineSelection } from './pricing';
import { addToCart } from '../store/cart';
import { pulseCart, setUI, showToast } from '../store/ui';

export function openProduct(p: Product, origin: string | null) {
  setUI({ productOrigin: origin });
  navigate({ name: 'product', id: p.id });
}

export function addSelection(p: Product, sel: LineSelection, qty = 1) {
  const added = addToCart(sel, qty);
  const v = variantOf(p, sel.variantId);
  if (added > 0) {
    pulseCart();
    showToast({
      title: added > 1 ? `${added} × ${p.name}` : p.name,
      detail: `${v.label} · added to your bag`,
      action: { label: 'View bag', run: () => setUI({ cartOpen: true }) },
    });
  } else {
    showToast({ title: 'That’s all we have today', detail: `No more ${p.name} available right now.` });
  }
  return added;
}

export const quickAdd = (p: Product) => addSelection(p, { productId: p.id, variantId: p.variants[0].id, addOnIds: [] });
