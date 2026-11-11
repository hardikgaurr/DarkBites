import { useMemo } from 'react';
import { productById } from '../data/products';
import { computeTotals, variantOf, type LineSelection } from '../lib/pricing';
import { createStore, readStorage, useStore, writeStorage } from '../lib/store';
import { inventoryStore } from './inventory';

export interface CartLine extends LineSelection {
  key: string;
  qty: number;
  addedAt: number;
}

const STORAGE_KEY = 'darkbites.cart.v1';

export const lineKey = (s: LineSelection) =>
  [s.productId, s.variantId, [...s.addOnIds].sort().join('+'), s.message?.trim() ?? ''].join('|');

const initial = readStorage<CartLine[]>(STORAGE_KEY, []).filter((l) => productById.has(l.productId));
export const cartStore = createStore<CartLine[]>(initial);
cartStore.subscribe(() => writeStorage(STORAGE_KEY, cartStore.get()));

/** Units of a product already in the cart, optionally excluding one line. */
export function unitsInCart(productId: string, exceptKey?: string) {
  return cartStore.get().reduce((n, l) => (l.productId === productId && l.key !== exceptKey ? n + l.qty : n), 0);
}

export function stockFor(productId: string) {
  return inventoryStore.get().stock[productId]?.stock ?? 0;
}

/** Returns the quantity actually added (clamped to stock). */
export function addToCart(sel: LineSelection, qty = 1): number {
  const key = lineKey(sel);
  const room = Math.max(0, stockFor(sel.productId) - unitsInCart(sel.productId));
  const add = Math.min(qty, room);
  if (add <= 0) return 0;
  cartStore.set((lines) => {
    const existing = lines.find((l) => l.key === key);
    if (existing) return lines.map((l) => (l.key === key ? { ...l, qty: l.qty + add } : l));
    return [...lines, { ...sel, message: sel.message?.trim() || undefined, key, qty: add, addedAt: Date.now() }];
  });
  return add;
}

export function setLineQty(key: string, qty: number) {
  cartStore.set((lines) => {
    const line = lines.find((l) => l.key === key);
    if (!line) return lines;
    if (qty <= 0) return lines.filter((l) => l.key !== key);
    const max = Math.max(0, stockFor(line.productId) - unitsInCart(line.productId, key));
    return lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, Math.max(max, 0)) || l.qty } : l));
  });
}

export const removeLine = (key: string) => cartStore.set((lines) => lines.filter((l) => l.key !== key));
export const clearCart = () => cartStore.set([]);

export const useCartLines = () => useStore(cartStore, (s) => s);
export const useCartCount = () => useStore(cartStore, (s) => s.reduce((n, l) => n + l.qty, 0));

export function useTotals() {
  const lines = useCartLines();
  return useMemo(() => computeTotals(lines), [lines]);
}

/** Lines whose quantity exceeds current stock, or whose product is no longer purchasable. */
export function useStockConflicts() {
  const lines = useCartLines();
  const stock = useStore(inventoryStore, (s) => s.stock);
  const loaded = useStore(inventoryStore, (s) => s.loaded);
  return useMemo(() => {
    if (!loaded) return new Map<string, string>();
    const conflicts = new Map<string, string>();
    const used: Record<string, number> = {};
    for (const l of lines) {
      const r = stock[l.productId];
      if (!r || r.paused) {
        conflicts.set(l.key, 'Temporarily unavailable — remove to continue');
        continue;
      }
      used[l.productId] = (used[l.productId] ?? 0) + l.qty;
      if (r.stock <= 0) conflicts.set(l.key, 'Sold out — remove to continue');
      else if (used[l.productId] > r.stock) conflicts.set(l.key, `Only ${r.stock} available — reduce quantity`);
    }
    return conflicts;
  }, [lines, stock, loaded]);
}

/** Longest notice period demanded by anything in the cart (whole cakes etc.). */
export function useCartNoticeHours() {
  const lines = useCartLines();
  return useMemo(
    () =>
      lines.reduce((h, l) => {
        const p = productById.get(l.productId);
        return p ? Math.max(h, variantOf(p, l.variantId).noticeHours ?? 0) : h;
      }, 0),
    [lines],
  );
}

export function useCartPrepMinutes() {
  const lines = useCartLines();
  return useMemo(() => lines.reduce((m, l) => Math.max(m, productById.get(l.productId)?.prepMinutes ?? 0), 0), [lines]);
}
