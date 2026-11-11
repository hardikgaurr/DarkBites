import { useSyncExternalStore } from 'react';
import { categoryById, productById, type CategoryId } from '../data/products';

/**
 * Hash router. Route names are plain `#name` tokens (letters, digits, hyphens)
 * so links survive the artifact host and can be shared.
 *   #            home
 *   #menu        shop, all categories        #menu-cakes   shop, one category
 *   #p-<id>      product sheet (opens over the previous page)
 *   #checkout    checkout                    #story        about the baker
 *   #box         dessert box (subscription preview)
 */
export type Route =
  | { name: 'home' }
  | { name: 'menu'; category?: CategoryId }
  | { name: 'product'; id: string }
  | { name: 'checkout' }
  | { name: 'story' }
  | { name: 'box' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (!h) return { name: 'home' };
  if (h === 'menu') return { name: 'menu' };
  if (h.startsWith('menu-')) {
    const c = h.slice(5) as CategoryId;
    return categoryById.has(c) ? { name: 'menu', category: c } : { name: 'menu' };
  }
  if (h.startsWith('p-') && productById.has(h.slice(2))) return { name: 'product', id: h.slice(2) };
  if (h === 'checkout' || h === 'story' || h === 'box') return { name: h };
  return { name: 'home' };
}

export function toHash(r: Route): string {
  switch (r.name) {
    case 'home':
      return '';
    case 'menu':
      return r.category ? `menu-${r.category}` : 'menu';
    case 'product':
      return `p-${r.id}`;
    default:
      return r.name;
  }
}

let current = parseHash(window.location.hash);
let pushedInApp = 0;
const listeners = new Set<() => void>();
const sync = () => {
  const next = parseHash(window.location.hash);
  if (toHash(next) === toHash(current)) return;
  current = next;
  listeners.forEach((l) => l());
};
window.addEventListener('hashchange', sync);
window.addEventListener('popstate', sync);

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}

export function navigate(r: Route, opts: { replace?: boolean } = {}) {
  const hash = toHash(r);
  if (opts.replace) {
    const url = window.location.pathname + window.location.search + (hash ? `#${hash}` : '');
    try {
      history.replaceState(null, '', url);
    } catch {
      /* sandboxed */
    }
    current = parseHash(hash);
    listeners.forEach((l) => l());
    return;
  }
  pushedInApp++;
  if (!hash) {
    // Clearing the hash with location.hash = '' leaves a bare '#'. Use pushState where allowed.
    try {
      history.pushState(null, '', window.location.pathname + window.location.search);
      current = { name: 'home' };
      listeners.forEach((l) => l());
      return;
    } catch {
      /* fall through */
    }
  }
  window.location.hash = hash;
}

/** Go back if the previous entry belongs to this app, otherwise navigate to the fallback. */
export function back(fallback: Route) {
  if (pushedInApp > 0) {
    pushedInApp--;
    history.back();
  } else navigate(fallback, { replace: true });
}

export const href = (r: Route) => `#${toHash(r)}`;
