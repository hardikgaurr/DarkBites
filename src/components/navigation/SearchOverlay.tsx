import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Clock, Search, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MERCHANDISING } from '../../config/business';
import { categories, categoryById, fromPrice, productById, products, type Category, type Product } from '../../data/products';
import { openProduct } from '../../lib/actions';
import { formatINR } from '../../lib/format';
import { navigate } from '../../lib/router';
import { readStorage, writeStorage } from '../../lib/store';
import { useAvailability } from '../../store/inventory';
import { setUI, useUI } from '../../store/ui';
import { Picture } from '../ui/Picture';
import { StockTag } from '../ui/StockTag';
import { useEscape, useScrollLock } from '../ui/useScrollLock';

const RECENT_KEY = 'darkbites.recent-search.v1';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

function score(p: Product, q: string) {
  const name = norm(p.name);
  if (name.startsWith(q)) return 100;
  if (name.split(/\s|&/).some((w) => w.startsWith(q))) return 80;
  if (name.includes(q)) return 60;
  if (p.keywords.some((k) => norm(k).startsWith(q))) return 40;
  if (norm(categoryById.get(p.category)!.name).includes(q)) return 30;
  if (norm(p.short + ' ' + p.description).includes(q)) return 10;
  return 0;
}

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  return createPortal(<AnimatePresence>{open && <SearchPanel />}</AnimatePresence>, document.body);
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = norm(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function SearchPanel() {
  const [raw, setRaw] = useState('');
  const debounced = useDebounced(raw, 140);
  const q = useDeferredValue(norm(debounced.trim()));
  const [recent, setRecent] = useState<string[]>(() => readStorage<string[]>(RECENT_KEY, []));
  const inputRef = useRef<HTMLInputElement>(null);
  const close = () => setUI({ searchOpen: false });
  useScrollLock(true);
  useEscape(true, close);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    if (!q) return { products: [] as Product[], cats: [] as Category[] };
    const ps = products
      .map((p) => ({ p, s: score(p, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
    const cats = categories.filter((c) => norm(c.name).includes(q) || norm(c.id).includes(q));
    return { products: ps, cats };
  }, [q]);

  const remember = (term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    setRecent(next);
    writeStorage(RECENT_KEY, next);
  };

  const pickProduct = (p: Product) => {
    remember(raw || p.name);
    close();
    openProduct(p, null);
  };
  const pickCategory = (c: Category) => {
    remember(raw || c.name);
    close();
    navigate({ name: 'menu', category: c.id });
  };

  const empty = !q;
  const none = !!q && results.products.length === 0 && results.cats.length === 0;

  return (
    <motion.div
      className="search"
      role="dialog"
      aria-modal="true"
      aria-label="Search the menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
    >
      <motion.div
        className="search-panel"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      >
        <form
          className="search-bar wrap"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (results.products[0]) pickProduct(results.products[0]);
          }}
        >
          <button type="button" className="icon-btn" onClick={close} aria-label="Close search">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <label className="search-field">
            <Search size={18} strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Search products and categories</span>
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Search cheesecake, brownie, pizza…"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            {raw && (
              <button
                type="button"
                className="icon-btn sm"
                aria-label="Clear search"
                onClick={() => {
                  setRaw('');
                  inputRef.current?.focus();
                }}
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            )}
          </label>
        </form>

        <div className="search-body wrap" aria-live="polite">
          {empty && (
            <>
              {recent.length > 0 && (
                <section className="search-sec">
                  <div className="search-sec-head">
                    <h2 className="label muted">Recent</h2>
                    <button
                      type="button"
                      className="text-btn small"
                      onClick={() => {
                        setRecent([]);
                        writeStorage(RECENT_KEY, []);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <ul className="search-recent">
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onClick={() => setRaw(r)}>
                          <Clock size={15} strokeWidth={1.5} aria-hidden /> {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="search-sec">
                <h2 className="label muted">Categories</h2>
                <div className="chip-row wrap-row">
                  {categories.map((c) => (
                    <button key={c.id} type="button" className="chip" onClick={() => pickCategory(c)}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </section>
              <section className="search-sec">
                <h2 className="label muted">Popular</h2>
                <ul className="search-results">
                  {MERCHANDISING.bestsellers.map((id) => {
                    const p = productById.get(id)!;
                    return <ResultRow key={id} p={p} q="" onPick={pickProduct} />;
                  })}
                </ul>
              </section>
            </>
          )}

          {!empty && !none && (
            <>
              {results.cats.length > 0 && (
                <ul className="search-cats">
                  {results.cats.map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => pickCategory(c)}>
                        <span>
                          <span className="label muted">Category</span>
                          <span className="search-cat-name">
                            <Highlight text={c.name} q={q} />
                          </span>
                        </span>
                        <ArrowUpRight size={18} strokeWidth={1.4} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="label muted search-count">
                {results.products.length} {results.products.length === 1 ? 'item' : 'items'}
              </p>
              <ul className="search-results">
                {results.products.map((p) => (
                  <ResultRow key={p.id} p={p} q={q} onPick={pickProduct} />
                ))}
              </ul>
            </>
          )}

          {none && (
            <div className="search-none">
              <p className="h3">Nothing called “{debounced.trim()}” on the menu</p>
              <p className="muted">Try a flavour like Biscoff, Nutella or chocolate — or browse a category.</p>
              <div className="chip-row wrap-row">
                {categories.map((c) => (
                  <button key={c.id} type="button" className="chip" onClick={() => pickCategory(c)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ResultRow({ p, q, onPick }: { p: Product; q: string; onPick: (p: Product) => void }) {
  const a = useAvailability(p.id);
  return (
    <li>
      <button type="button" className="sresult" onClick={() => onPick(p)}>
        <span className="sresult-img">
          <Picture name={p.image} sizes="64px" />
        </span>
        <span className="sresult-text">
          <span className="sresult-name">
            <Highlight text={p.name} q={q} />
          </span>
          <span className="small muted">
            {categoryById.get(p.category)?.name} · <span className="num">{formatINR(fromPrice(p))}</span>
          </span>
          <StockTag value={a} quiet />
        </span>
      </button>
    </li>
  );
}
