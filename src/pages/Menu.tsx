import { motion } from 'framer-motion';
import { ArrowDownUp, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Masonry } from '../components/product/Masonry';
import { ProductCard } from '../components/product/ProductCard';
import { Picture } from '../components/ui/Picture';
import { Skeleton } from '../components/ui/Skeleton';
import { categories, categoryById, fromPrice, products, type CategoryId, type DietaryTag, type Product } from '../data/products';
import { navigate } from '../lib/router';
import { media } from '../data/media';
import { availabilityOf } from '../services/inventory';
import { inventoryStore, useInventoryLoaded } from '../store/inventory';
import { useStore } from '../lib/store';

type Sort = 'recommended' | 'price-asc' | 'price-desc' | 'name';
const sortLabels: Record<Sort, string> = {
  recommended: 'Recommended',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name: A to Z',
};

const dietaryLabels: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  eggless: 'Eggless',
  'gluten-free': 'Gluten-free',
  'contains-nuts': 'Contains nuts',
  'contains-dairy': 'Contains dairy',
  'contains-gluten': 'Contains gluten',
};

/** Dietary filters appear only for tags that exist in verified product data. Today: none. */
const verifiedDietary = Array.from(new Set(products.flatMap((p) => (p.dietary.verified ? p.dietary.tags : []))));

export function Menu({ category }: { category?: CategoryId }) {
  const loaded = useInventoryLoaded();
  const stock = useStore(inventoryStore, (s) => s.stock);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<Sort>('recommended');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [diet, setDiet] = useState<DietaryTag[]>([]);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim().toLowerCase()), 160);
    return () => window.clearTimeout(t);
  }, [query]);

  // Keep the active category chip visible in the horizontal rail.
  useEffect(() => {
    const el = chipsRef.current?.querySelector<HTMLElement>('.chip.is-on');
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [category]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !category || p.category === category);
    if (debounced)
      list = list.filter((p) =>
        [p.name, p.short, categoryById.get(p.category)!.name, ...p.keywords].some((s) => s.toLowerCase().includes(debounced)),
      );
    if (availableOnly && loaded) list = list.filter((p) => ['in_stock', 'low_stock'].includes(availabilityOf(stock[p.id])));
    if (diet.length) list = list.filter((p) => p.dietary.verified && diet.every((d) => p.dietary.tags.includes(d)));
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      recommended: () => 0,
      'price-asc': (a, b) => fromPrice(a) - fromPrice(b),
      'price-desc': (a, b) => fromPrice(b) - fromPrice(a),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [category, debounced, availableOnly, diet, sort, stock, loaded]);

  const grouped = !category && !debounced && sort === 'recommended';
  const cat = category ? categoryById.get(category) : null;
  const setCategory = (c?: CategoryId) => navigate({ name: 'menu', category: c }, { replace: true });
  const clearAll = () => {
    setQuery('');
    setAvailableOnly(false);
    setDiet([]);
    setSort('recommended');
    setCategory(undefined);
  };

  return (
    <div className="menu">
      <header className="wrap menu-head">
        <p className="label muted">The DARK BITES menu</p>
        <h1 className="h1">{cat ? cat.name : 'The menu'}</h1>
        <p className="muted num">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          {cat ? ` · ${cat.line}` : ' · cheesecakes, desserts, cakes, pizza and more'}
        </p>
      </header>

      <div className="filterbar">
        <div className="wrap filterbar-inner">
          <div className="chip-row" ref={chipsRef} role="tablist" aria-label="Categories">
            <button type="button" role="tab" aria-selected={!category} className={`chip${!category ? ' is-on' : ''}`} onClick={() => setCategory(undefined)}>
              All
            </button>
            {categories.map((c) => (
              <button
                type="button"
                role="tab"
                aria-selected={category === c.id}
                key={c.id}
                className={`chip${category === c.id ? ' is-on' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap menu-tools">
        <label className="menu-search">
          <Search size={17} strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Filter this menu</span>
          <input type="search" placeholder={cat ? `Search ${cat.name.toLowerCase()}` : 'Search the menu'} value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && (
            <button type="button" className="icon-btn sm" onClick={() => setQuery('')} aria-label="Clear">
              <X size={16} strokeWidth={1.6} />
            </button>
          )}
        </label>
        <div className="menu-tool-row">
          <label className="select">
            <ArrowDownUp size={15} strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {(Object.keys(sortLabels) as Sort[]).map((s) => (
                <option key={s} value={s}>
                  {sortLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="switch">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
            <span>Available now</span>
          </label>
          {verifiedDietary.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip sm${diet.includes(d) ? ' is-on' : ''}`}
              onClick={() => setDiet((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}
            >
              {dietaryLabels[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap menu-results">
        {!loaded ? (
          <div className="masonry" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
            {[0, 1].map((c) => (
              <div className="masonry-col" key={c}>
                <Skeleton ratio={c ? '3 / 4' : '4 / 5'} />
                <Skeleton ratio={c ? '3 / 2' : '1 / 1'} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p className="h3">Nothing matches those filters</p>
            <p className="muted">{debounced ? `No items for “${query.trim()}”.` : 'Everything in this view is unavailable right now.'}</p>
            <button type="button" className="btn btn-outline" onClick={clearAll}>
              Clear filters
            </button>
          </div>
        ) : grouped ? (
          categories.map((c) => {
            const items = filtered.filter((p) => p.category === c.id);
            if (!items.length) return null;
            return (
              <motion.section key={c.id} className="menu-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div className={`menu-group-head fam-${c.family}`}>
                  <span className="menu-group-cover" aria-hidden>
                    <Picture name={c.cover} sizes="96px" />
                  </span>
                  <span className="menu-group-text">
                    <h2 className="h3">{c.name}</h2>
                    <span className="small muted">{c.line}</span>
                  </span>
                  <span className="label muted num">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <Masonry
                  items={items}
                  cols={items.length === 1 && media[items[0].image].w > media[items[0].image].h ? [1, 2, 3] : undefined}
                  render={(p, i) => <ProductCard product={p} origin="menu" priority={i < 2} />}
                />
              </motion.section>
            );
          })
        ) : (
          <Masonry items={filtered} render={(p, i) => <ProductCard product={p} origin="menu" priority={i < 2} />} />
        )}
      </div>
    </div>
  );
}
