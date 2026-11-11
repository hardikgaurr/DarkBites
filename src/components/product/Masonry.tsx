import { useMemo, type ReactNode } from 'react';
import { media } from '../../data/media';
import type { Product } from '../../data/products';
import { useMediaQuery } from '../ui/useScrollLock';

/**
 * Distributes cards into balanced columns using each photo's real aspect ratio,
 * so every image keeps its full composition — no cropping to a uniform grid.
 */
export function Masonry({ items, render, cols }: { items: Product[]; render: (p: Product, i: number) => ReactNode; cols?: [number, number, number] }) {
  const [m, t, d] = cols ?? [2, 3, 4];
  const isTablet = useMediaQuery('(min-width: 900px)');
  const isDesk = useMediaQuery('(min-width: 1200px)');
  const n = isDesk ? d : isTablet ? t : m;
  const columns = useMemo(() => {
    const out: { p: Product; i: number }[][] = Array.from({ length: n }, () => []);
    const heights = new Array(n).fill(0);
    items.forEach((p, i) => {
      const a = media[p.image];
      const col = heights.indexOf(Math.min(...heights));
      out[col].push({ p, i });
      heights[col] += a.h / a.w + 0.55; // image + text block, in column-width units
    });
    return out;
  }, [items, n]);
  return (
    <div className="masonry" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {columns.map((col, ci) => (
        <div className="masonry-col" key={ci}>
          {col.map(({ p, i }) => (
            <div key={p.id}>{render(p, i)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
