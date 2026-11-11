import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { Check, Clock, Info, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { media, type MediaKey } from '../../data/media';
import { categoryById, products, type Product } from '../../data/products';
import { addSelection, openProduct } from '../../lib/actions';
import { formatINR } from '../../lib/format';
import { unitPrice, variantOf } from '../../lib/pricing';
import { estimateEta } from '../../services/delivery';
import { stockFor, unitsInCart, useCartLines } from '../../store/cart';
import { useServiceCheck } from '../../store/delivery';
import { canPurchase, useAvailability, useStockRecord } from '../../store/inventory';
import { useUI } from '../../store/ui';
import { DeliveryCheck } from '../delivery/DeliveryCheck';
import { Picture } from '../ui/Picture';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';
import { StockTag } from '../ui/StockTag';

export function ProductSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Sheet open={!!product} onClose={onClose} label={product?.name ?? 'Product'} desktop="dialog" bare className="pdp-sheet">
      {product && <ProductDetail key={product.id} p={product} />}
    </Sheet>
  );
}

function ProductDetail({ p }: { p: Product }) {
  const origin = useUI((s) => s.productOrigin);
  const availability = useAvailability(p.id);
  const rec = useStockRecord(p.id);
  useCartLines(); // re-render when the bag changes so remaining stock stays correct
  const check = useServiceCheck();

  const [variantId, setVariantId] = useState(p.variants[0].id);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variantOf(p, variantId);
  const sel = { productId: p.id, variantId, addOnIds, message };
  const unit = unitPrice(sel);
  const remaining = Math.max(0, stockFor(p.id) - unitsInCart(p.id));
  const purchasable = canPurchase(availability) && remaining > 0;
  const variantKey = p.variantImages?.[variantId];

  useEffect(() => {
    if (qty > Math.max(1, remaining)) setQty(Math.max(1, remaining));
  }, [remaining, qty]);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(t);
  }, [added]);

  const related = useMemo(
    () => products.filter((x) => x.id !== p.id && (x.category === p.category || (p.category === 'cheesecakes' && x.category === 'brownies'))).slice(0, 4),
    [p],
  );

  const add = () => {
    const n = addSelection(p, sel, qty);
    if (n > 0) {
      setAdded(true);
      setQty(1);
    }
  };

  const eta = check?.status === 'serviceable' ? estimateEta(check.distanceKm ?? 3, p.prepMinutes) : null;

  return (
    <div className="pdp">
      <Gallery p={p} origin={origin} activeKey={variantKey} />

      <div className="pdp-info">
        <div className="pdp-head">
          <p className="label muted">{categoryById.get(p.category)?.name}</p>
          <h2 className="h2 pdp-title">{p.name}</h2>
          <div className="pdp-price-row">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={unit}
                className="pdp-price num"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 40 }}
              >
                {formatINR(unit)}
              </motion.span>
            </AnimatePresence>
            <StockTag value={availability} stock={rec?.stock} />
          </div>
          <p className="pdp-desc">{p.description}</p>
        </div>

        {p.variants.length > 1 && (
          <fieldset className="opt-group">
            <legend className="label">Choose</legend>
            <div className="opt-list">
              {p.variants.map((v) => (
                <label key={v.id} className={`opt${v.id === variantId ? ' is-on' : ''}`}>
                  <input type="radio" name={`variant-${p.id}`} value={v.id} checked={v.id === variantId} onChange={() => setVariantId(v.id)} />
                  <span className="opt-mark" aria-hidden />
                  <span className="opt-text">
                    <span>{v.label}</span>
                    {(v.hint || v.noticeHours) && (
                      <span className="opt-hint">
                        {v.hint}
                        {v.hint && v.noticeHours ? ' · ' : ''}
                        {v.noticeHours ? `${v.noticeHours} h notice` : ''}
                      </span>
                    )}
                  </span>
                  <span className="opt-price num">{formatINR(v.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {p.addOns.length > 0 && (
          <fieldset className="opt-group">
            <legend className="label">Add</legend>
            <div className="opt-list">
              {p.addOns.map((a) =>
                a.kind === 'toggle' ? (
                  <label key={a.id} className={`opt${addOnIds.includes(a.id) ? ' is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={addOnIds.includes(a.id)}
                      onChange={(e) => setAddOnIds((ids) => (e.target.checked ? [...ids, a.id] : ids.filter((x) => x !== a.id)))}
                    />
                    <span className="opt-mark is-box" aria-hidden>
                      <Check size={12} strokeWidth={2.4} />
                    </span>
                    <span className="opt-text">{a.label}</span>
                    <span className="opt-price num">+{formatINR(a.price)}</span>
                  </label>
                ) : (
                  <label key={a.id} className="opt-textfield">
                    <span className="opt-text">
                      {a.label}
                      <span className="opt-hint">{a.price ? `+${formatINR(a.price)}` : 'No charge'}</span>
                    </span>
                    <input className="input" maxLength={a.maxLength} placeholder={a.placeholder} value={message} onChange={(e) => setMessage(e.target.value)} />
                    <span className="opt-count num muted">
                      {message.length}/{a.maxLength}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        )}

        <section className="pdp-block">
          <h3 className="label">Delivery</h3>
          {eta ? (
            <p className="pdp-eta">
              <Clock size={16} strokeWidth={1.5} aria-hidden />
              <span>
                To {check?.pin ?? 'your location'} in about{' '}
                <strong className="num">
                  {eta[0]}–{eta[1]} min
                </strong>
                {variant.noticeHours ? `. The ${variant.label.toLowerCase()} needs ${variant.noticeHours} hours’ notice — pick a later slot at checkout.` : '.'}
              </span>
            </p>
          ) : (
            <DeliveryCheck compact prepMinutes={p.prepMinutes} />
          )}
        </section>

        <section className="pdp-block">
          <h3 className="label">Dietary &amp; allergens</h3>
          {p.allergens.verified ? (
            <p>{p.allergens.list.join(', ')}</p>
          ) : (
            <p className="pdp-note">
              <Info size={16} strokeWidth={1.5} aria-hidden />
              <span>
                Ingredient and allergen details for this item are awaiting confirmation from the kitchen. If you have an allergy, please contact DARK
                BITES before ordering.
              </span>
            </p>
          )}
        </section>

        {related.length > 0 && (
          <section className="pdp-block">
            <h3 className="label">Also from the kitchen</h3>
            <div className="mini-rail">
              {related.map((r) => (
                <button key={r.id} type="button" className="mini" onClick={() => openProduct(r, null)}>
                  <Picture name={r.image} sizes="140px" />
                  <span className="mini-name">{r.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        <p className="pdp-demo small muted">Prices and options shown are sample data for review.</p>
      </div>

      <div className="pdp-bar">
        {purchasable ? (
          <>
            <QtyStepper value={qty} min={1} max={Math.max(1, remaining)} onChange={(n) => setQty(Math.max(1, n))} label={p.name} />
            <motion.button type="button" className={`btn btn-primary btn-grow${added ? ' is-done' : ''}`} whileTap={{ scale: 0.97 }} onClick={add}>
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="done" className="btn-in" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Check size={17} strokeWidth={2} /> Added to bag
                  </motion.span>
                ) : (
                  <motion.span key="add" className="btn-in" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <ShoppingBag size={17} strokeWidth={1.6} /> Add <span className="num">{formatINR(unit * qty)}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </>
        ) : (
          <button type="button" className="btn btn-grow" disabled>
            {availability === 'unavailable' ? 'Temporarily unavailable' : availability === 'sold_out' ? 'Sold out today' : 'All available units are in your bag'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Product gallery: swipeable, scroll-snapped, every photo whole at its own ratio.
 * The first slide carries the shared-element transition from the card that was tapped.
 * Selecting a variant with its own photo (e.g. a box of brownies) brings that photo into view.
 */
function Gallery({ p, origin, activeKey }: { p: Product; origin: string | null; activeKey?: MediaKey }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const items = p.gallery.length ? p.gallery : [p.image];

  useEffect(() => {
    if (!activeKey || !track.current) return;
    const i = items.indexOf(activeKey);
    if (i < 0) return;
    track.current.scrollTo({ left: i * track.current.clientWidth, behavior: 'smooth' });
  }, [activeKey, items]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const current = media[items[index] ?? items[0]];

  return (
    <div className="pdp-media" style={{ background: current.edge }}>
      <div className="pdp-track" ref={track} onScroll={onScroll} aria-roledescription="carousel" aria-label={`${p.name} photos`}>
        {items.map((key, i) => {
          const m = media[key];
          return (
            <div className="pdp-slide" key={key} style={{ background: m.edge }} aria-label={`Photo ${i + 1} of ${items.length}`}>
              <motion.div
                layoutId={i === 0 && origin ? `${origin}:${p.id}` : undefined}
                className="pdp-media-inner"
                style={{ maxWidth: `calc(var(--pdp-media-h, 100vh) * ${m.w / m.h})` }}
                initial={i === 0 && origin ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Picture name={key} sizes="(min-width: 900px) 52vw, 100vw" priority={i === 0} />
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="pdp-media-meta">
        {current.origin === 'stock' && <span className="pdp-rep">Representative image</span>}
        {items.length > 1 && (
          <span className="pdp-dots" aria-hidden>
            {items.map((k, i) => (
              <span key={k} className={`pdp-dot${i === index ? ' is-on' : ''}`} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
