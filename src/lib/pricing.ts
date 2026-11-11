import { PRICING } from '../config/business';
import { productById, type Product, type Variant } from '../data/products';

export interface LineSelection {
  productId: string;
  variantId: string;
  addOnIds: string[];
  message?: string;
}

export function variantOf(p: Product, variantId: string): Variant {
  return p.variants.find((v) => v.id === variantId) ?? p.variants[0];
}

export function unitPrice(sel: LineSelection): number {
  const p = productById.get(sel.productId);
  if (!p) return 0;
  const v = variantOf(p, sel.variantId);
  const extras = p.addOns.filter((a) => {
    if (a.kind === 'text') return Boolean(sel.message?.trim());
    return sel.addOnIds.includes(a.id);
  });
  return v.price + extras.reduce((n, a) => n + a.price, 0);
}

export interface Totals {
  items: number;
  subtotal: number;
  packaging: number;
  delivery: number;
  tax: number;
  total: number;
  /** Amount still needed to reach the minimum order (0 when met). */
  shortBy: number;
  /** Amount still needed for free delivery (0 when met). */
  freeDeliveryIn: number;
}

export function computeTotals(lines: (LineSelection & { qty: number })[]): Totals {
  const items = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + unitPrice(l) * l.qty, 0);
  if (items === 0) return { items, subtotal: 0, packaging: 0, delivery: 0, tax: 0, total: 0, shortBy: PRICING.minimumOrder, freeDeliveryIn: PRICING.freeDeliveryAbove };
  const packaging = PRICING.packagingFee;
  const delivery = subtotal >= PRICING.freeDeliveryAbove ? 0 : PRICING.deliveryFee;
  const tax = Math.round((subtotal + packaging) * PRICING.taxRate);
  return {
    items,
    subtotal,
    packaging,
    delivery,
    tax,
    total: subtotal + packaging + delivery + tax,
    shortBy: Math.max(0, PRICING.minimumOrder - subtotal),
    freeDeliveryIn: Math.max(0, PRICING.freeDeliveryAbove - subtotal),
  };
}
