import { motion } from 'framer-motion';
import { memo } from 'react';
import { fromPrice, type Product } from '../../data/products';
import { openProduct } from '../../lib/actions';
import { formatINR } from '../../lib/format';
import { href } from '../../lib/router';
import { useAvailability, useStockRecord } from '../../store/inventory';
import { Picture } from '../ui/Picture';
import { StockTag } from '../ui/StockTag';
import { AddControl } from './AddControl';

interface Props {
  product: Product;
  origin: string;
  sizes?: string;
  priority?: boolean;
  tone?: 'light' | 'dark';
}

export const ProductCard = memo(function ProductCard({ product: p, origin, sizes = '(min-width: 1200px) 24vw, (min-width: 900px) 31vw, 48vw', priority, tone = 'light' }: Props) {
  const availability = useAvailability(p.id);
  const rec = useStockRecord(p.id);
  const multi = p.variants.length > 1;
  const off = availability === 'sold_out' || availability === 'unavailable';
  return (
    <article className={`card${off ? ' is-off' : ''} card-${tone}`}>
      <a
        href={href({ name: 'product', id: p.id })}
        className="card-media"
        onClick={(e) => {
          e.preventDefault();
          openProduct(p, origin);
        }}
        aria-label={`${p.name} — view details`}
      >
        <motion.div layoutId={`${origin}:${p.id}`} className="card-media-inner" whileTap={{ scale: 0.985 }}>
          <Picture name={p.image} sizes={sizes} priority={priority} />
        </motion.div>
      </a>
      <div className="card-body">
        <h3 className="card-title">
          <a
            href={href({ name: 'product', id: p.id })}
            onClick={(e) => {
              e.preventDefault();
              openProduct(p, origin);
            }}
          >
            {p.name}
          </a>
        </h3>
        <p className="card-short">{p.short}</p>
        <div className="card-foot">
          <div className="card-price num">
            <span>
              {multi && <span className="from">from </span>}
              {formatINR(fromPrice(p))}
            </span>
            <StockTag value={availability} stock={rec?.stock} quiet />
          </div>
          <AddControl product={p} tone={tone} />
        </div>
      </div>
    </article>
  );
});

/** List row used for dense browsing (cakes, desserts) — Swiggy-style, editorial type. */
export const ProductRow = memo(function ProductRow({ product: p, origin, index }: { product: Product; origin: string; index?: number }) {
  const availability = useAvailability(p.id);
  const rec = useStockRecord(p.id);
  const off = availability === 'sold_out' || availability === 'unavailable';
  return (
    <article className={`row${off ? ' is-off' : ''}`}>
      <div className="row-text">
        {index !== undefined && <span className="row-index label muted num">{String(index + 1).padStart(2, '0')}</span>}
        <h3 className="row-title">
          <a
            href={href({ name: 'product', id: p.id })}
            onClick={(e) => {
              e.preventDefault();
              openProduct(p, origin);
            }}
          >
            {p.name}
          </a>
        </h3>
        <p className="row-price num">
          {p.variants.length > 1 && <span className="from">from </span>}
          {formatINR(fromPrice(p))}
        </p>
        <p className="row-desc muted">{p.description}</p>
        <StockTag value={availability} stock={rec?.stock} quiet />
      </div>
      <div className="row-media">
        <a
          href={href({ name: 'product', id: p.id })}
          onClick={(e) => {
            e.preventDefault();
            openProduct(p, origin);
          }}
          aria-label={`${p.name} — view details`}
        >
          <motion.div layoutId={`${origin}:${p.id}`} className="row-media-inner">
            <Picture name={p.image} sizes="(min-width: 900px) 260px, 40vw" />
          </motion.div>
        </a>
        <div className="row-add">
          <AddControl product={p} />
        </div>
      </div>
    </article>
  );
});
