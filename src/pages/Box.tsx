import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Picture } from '../components/ui/Picture';
import { QtyStepper } from '../components/ui/QtyStepper';
import { SUBSCRIPTION } from '../config/business';
import { products } from '../data/products';
import { formatINR } from '../lib/format';

/** Dessert-box (subscription) concept. Not live: business model unconfirmed. */
const eligible = products.filter((p) => ['cheesecakes', 'brownies', 'cookies', 'cakes'].includes(p.category));
const slicePrice = (id: string) => products.find((p) => p.id === id)!.variants[0].price;

export function Box() {
  const [planId, setPlanId] = useState<string>(SUBSCRIPTION.plans[0].id);
  const [freqId, setFreqId] = useState<string>(SUBSCRIPTION.frequencies[0].id);
  const [day, setDay] = useState<string>(SUBSCRIPTION.deliveryDays[0]);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const plan = SUBSCRIPTION.plans.find((p) => p.id === planId)!;
  const freq = SUBSCRIPTION.frequencies.find((f) => f.id === freqId)!;
  const count = Object.values(picks).reduce((a, b) => a + b, 0);
  const room = plan.items - count;

  const price = useMemo(() => {
    const items = Object.entries(picks).reduce((n, [id, q]) => n + slicePrice(id) * q, 0);
    const perBox = Math.round(items * (1 - SUBSCRIPTION.discount));
    return { items, perBox, saving: items - perBox, perMonth: perBox * freq.perMonth };
  }, [picks, freq]);

  const setQty = (id: string, q: number) =>
    setPicks((x) => {
      const next = { ...x, [id]: Math.max(0, q) };
      if (!next[id]) delete next[id];
      return next;
    });

  return (
    <div className="box-page">
      <section className="wrap box-hero">
        <p className="label muted">Concept preview · not yet available</p>
        <h1 className="h1">
          The dessert <em>box</em>
        </h1>
        <p className="lede muted">Choose a box, fill it with desserts and pick a delivery day. Prices and the discount are sample figures.</p>
      </section>

      <div className="wrap box-grid">
        <div className="box-main">
          <fieldset className="opt-group">
            <legend className="label">Box</legend>
            <div className="seg two">
              {SUBSCRIPTION.plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`seg-btn${p.id === planId ? ' is-on' : ''}`}
                  aria-pressed={p.id === planId}
                  onClick={() => {
                    setPlanId(p.id);
                    setPicks({});
                  }}
                >
                  <strong>{p.name}</strong>
                  <span className="small muted">{p.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="opt-group">
            <legend className="label">Frequency</legend>
            <div className="seg">
              {SUBSCRIPTION.frequencies.map((f) => (
                <button key={f.id} type="button" className={`seg-btn${f.id === freqId ? ' is-on' : ''}`} aria-pressed={f.id === freqId} onClick={() => setFreqId(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="opt-group">
            <legend className="label">Delivery day</legend>
            <div className="seg">
              {SUBSCRIPTION.deliveryDays.map((d) => (
                <button key={d} type="button" className={`seg-btn${d === day ? ' is-on' : ''}`} aria-pressed={d === day} onClick={() => setDay(d)}>
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="opt-group">
            <legend className="label">
              Fill your box <span className="num muted">({count}/{plan.items})</span>
            </legend>
            <ul className="box-picks">
              {eligible.map((p) => (
                <li key={p.id} className="box-pick">
                  <span className="box-pick-img">
                    <Picture name={p.image} sizes="64px" />
                  </span>
                  <span className="box-pick-text">
                    <span>{p.name}</span>
                    <span className="small muted num">{formatINR(slicePrice(p.id))} · {p.variants[0].label.toLowerCase()}</span>
                  </span>
                  <QtyStepper size="sm" min={0} value={picks[p.id] ?? 0} max={(picks[p.id] ?? 0) + room} onChange={(n) => setQty(p.id, n)} label={p.name} />
                </li>
              ))}
            </ul>
          </fieldset>
        </div>

        <aside className="box-side">
          <div className="summary">
            <h2 className="h3">{plan.name}</h2>
            <div className="box-meter" aria-hidden>
              {Array.from({ length: plan.items }, (_, i) => (
                <motion.span key={i} className="box-cell" animate={{ backgroundColor: i < count ? 'var(--espresso)' : 'rgba(0,0,0,0)' }} transition={{ duration: 0.2 }} />
              ))}
            </div>
            <dl className="totals num">
              <div>
                <dt>Items</dt>
                <dd>{formatINR(price.items)}</dd>
              </div>
              <div>
                <dt>Box discount ({Math.round(SUBSCRIPTION.discount * 100)}%)</dt>
                <dd>−{formatINR(price.saving)}</dd>
              </div>
              <div className="totals-grand">
                <dt>Per box</dt>
                <dd>{formatINR(price.perBox)}</dd>
              </div>
              <div>
                <dt>
                  {freq.label}, {day}s
                </dt>
                <dd>≈ {formatINR(price.perMonth)}/month</dd>
              </div>
            </dl>
            <button type="button" className="btn btn-block btn-lg" disabled>
              {room > 0 ? `Add ${room} more to fill the box` : 'Subscriptions not yet offered'}
            </button>
            <p className="pdp-note small">
              <Info size={15} strokeWidth={1.5} aria-hidden />
              <span>A concept for the client to review. DARK BITES does not offer subscriptions yet.</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
