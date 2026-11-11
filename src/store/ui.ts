import { createStore, useStore } from '../lib/store';

export interface Toast {
  id: number;
  title: string;
  detail?: string;
  action?: { label: string; run: () => void };
}

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  deliveryOpen: boolean;
  demoOpen: boolean;
  toast: Toast | null;
  /** Bumps on every add-to-cart, drives the bag icon pulse. */
  cartPulse: number;
  /** Which surface opened the product sheet — scopes the shared-element morph. */
  productOrigin: string | null;
}

export const uiStore = createStore<UIState>({
  cartOpen: false,
  searchOpen: false,
  deliveryOpen: false,
  demoOpen: false,
  toast: null,
  cartPulse: 0,
  productOrigin: null,
});

export const useUI = <S,>(sel: (s: UIState) => S) => useStore(uiStore, sel);
export const setUI = (patch: Partial<UIState>) => uiStore.set((s) => ({ ...s, ...patch }));

let toastTimer: number | undefined;
let toastId = 0;
export function showToast(t: Omit<Toast, 'id'>, ms = 3200) {
  window.clearTimeout(toastTimer);
  setUI({ toast: { ...t, id: ++toastId } });
  toastTimer = window.setTimeout(() => setUI({ toast: null }), ms);
}
export const pulseCart = () => uiStore.set((s) => ({ ...s, cartPulse: s.cartPulse + 1 }));
