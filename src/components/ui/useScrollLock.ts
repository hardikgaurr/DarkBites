import { useEffect } from 'react';

let locks = 0;
/** Locks page scroll while an overlay is open. Ref-counted for stacked overlays. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    if (locks++ === 0) {
      const gap = window.innerWidth - root.clientWidth;
      root.style.setProperty('--scrollbar-gap', `${gap}px`);
      root.style.paddingRight = gap ? `${gap}px` : '';
      root.classList.add('scroll-locked');
    }
    return () => {
      if (--locks === 0) {
        root.classList.remove('scroll-locked');
        root.style.paddingRight = '';
      }
    };
  }, [active]);
}

export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onEscape();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, onEscape]);
}

export function useMediaQuery(q: string) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMQ(q, get);
}

import { useSyncExternalStore } from 'react';
function useMQ(q: string, get: () => boolean) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    get,
    () => false,
  );
}
