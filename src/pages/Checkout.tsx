import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Banknote, CreditCard, Landmark, Lock, ShieldAlert, Smartphone, Wallet } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { MinimumBar } from '../components/cart/MinimumBar';
import { TotalsTable } from '../components/cart/TotalsTable';
import { SlotPicker } from '../components/checkout/SlotPicker';
import { DeliveryCheck } from '../components/delivery/DeliveryCheck';
import { Link } from '../components/ui/Link';
import { Picture } from '../components/ui/Picture';
import { Sheet } from '../components/ui/Sheet';
import { PAYMENT, type PaymentMethodId } from '../config/business';
import { productById } from '../data/products';
import { formatClock, formatINR } from '../lib/format';
import { unitPrice, variantOf } from '../lib/pricing';
import { back } from '../lib/router';
import { buildSlotDays } from '../services/delivery';
import { useCartLines, useCartPrepMinutes, useStockConflicts, useTotals } from '../store/cart';
import { updateCheckout, useCheckout, validateCheckout, type CheckoutForm, type FieldErrors } from '../store/checkout';
import { useServiceCheck, useSlot } from '../store/delivery';
import { setUI } from '../store/ui';

const payIcons: Record<PaymentMethodId, ReactNode> = {
  upi: <Smartphone size={20} strokeWidth={1.4} />,
  card: <CreditCard size={20} strokeWidth={1.4} />,
  netbanking: <Landmark size={20} strokeWidth={1.4} />,
  wallet: <Wallet size={20} strokeWidth={1.4} />,
  cod: <Banknote size={20} strokeWidth={1.4} />,
};

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {hint && <span className="muted"> · {hint}</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p className="field-error" id={`${id}-err`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Checkout() {
  const lines = useCartLines();
  const totals = useTotals();
  const conflicts = useStockConflicts();
  const form = useCheckout();
  const check = useServiceCheck();
  const slot = useSlot();
  const prep = useCartPrepMinutes();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const codBlocked = totals.total > PAYMENT.codMaxOrder;
  const methods = PAYMENT.methods.filter((m) => m.id !== 'cod' || PAYMENT.codEnabled);

  const set = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateCheckout({ [k]: e.target.value } as Partial<CheckoutForm>);
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const slotLabel = useMemo(() => {
    if (!slot) return null;
    if (slot.kind === 'asap') return 'As soon as possible';
    const day = buildSlotDays(new Date(), 0)[slot.dayIndex];
    return `${day?.label ?? ''}, ${formatClock(slot.start)} – ${formatClock(slot.end)}`;
  }, [slot]);

  const proceed = () => {
    const e = validateCheckout(form);
    if (check?.status !== 'serviceable') e.pin = 'Confirm a delivery PIN inside the delivery area';
    if (!slot) e.slot = 'Choose a delivery time';
    if (form.payment === 'cod' && codBlocked) e.payment = `Cash on delivery is available up to ${formatINR(PAYMENT.codMaxOrder)}`;
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
      return;
    }
    setReviewOpen(true);
  };

  if (lines.length === 0) {
    return (
      <div className="wrap checkout-empty">
        <p className="label muted">Checkout</p>
        <h1 className="h1">Your bag is empty</h1>
        <p className="muted">Add something from the menu to check out.</p>
        <Link to={{ name: 'menu' }} className="btn btn-primary btn-lg">
          Explore the menu
        </Link>
      </div>
    );
  }

  const blocked = totals.shortBy > 0 || conflicts.size > 0;

  return (
    <div className="checkout" ref={topRef}>
      <div className="wrap">
        <div className="checkout-head">
          <button type="button" className="text-btn" onClick={() => back({ name: 'menu' })}>
            <ArrowLeft size={16} strokeWidth={1.6} /> Back
          </button>
          <h1 className="h1">Checkout</h1>
          <p className="muted small">
            <Lock size={13} strokeWidth={1.6} /> Payment is not connected in this preview. Nothing will be charged.
          </p>
        </div>

        <div className="checkout-grid">
          <div className="checkout-main">
            <Step n={1} title="Delivery address">
              <div data-field="pin">
                <DeliveryCheck compact prepMinutes={prep} />
                {errors.pin && check?.status !== 'serviceable' && <p className="field-error">{errors.pin}</p>}
              </div>
              <div className="field-grid">
                <div data-field="house">
                  <Field id="house" label="House / flat no." error={errors.house}>
                    <input id="house" className="input" autoComplete="address-line1" value={form.house} onChange={set('house')} aria-invalid={!!errors.house} />
                  </Field>
                </div>
                <div data-field="street">
                  <Field id="street" label="Street and area" error={errors.street}>
                    <input id="street" className="input" autoComplete="address-line2" value={form.street} onChange={set('street')} aria-invalid={!!errors.street} />
                  </Field>
                </div>
                <div className="span-2">
                  <Field id="landmark" label="Landmark" hint="optional">
                    <input id="landmark" className="input" value={form.landmark} onChange={set('landmark')} />
                  </Field>
                </div>
                <div className="span-2">
                  <Field id="instructions" label="Instructions for the rider" hint="optional">
                    <textarea id="instructions" className="input textarea" rows={2} value={form.instructions} onChange={set('instructions')} maxLength={160} />
                  </Field>
                </div>
              </div>
            </Step>

            <Step n={2} title="Delivery time">
              <div data-field="slot">
                <SlotPicker error={errors.slot} />
              </div>
            </Step>

            <Step n={3} title="Contact">
              <div className="field-grid">
                <div className="span-2" data-field="name">
                  <Field id="name" label="Name" error={errors.name}>
                    <input id="name" className="input" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
                  </Field>
                </div>
                <div data-field="phone">
                  <Field id="phone" label="Mobile number" error={errors.phone}>
                    <div className="input-prefix">
                      <span className="num">+91</span>
                      <input
                        id="phone"
                        className="input"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={11}
                        value={form.phone}
                        onChange={(e) => {
                          updateCheckout({ phone: e.target.value.replace(/[^\d ]/g, '') });
                          if (errors.phone) setErrors((x) => ({ ...x, phone: undefined }));
                        }}
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                  </Field>
                </div>
                <div data-field="email">
                  <Field id="email" label="Email" hint="optional, for the receipt" error={errors.email}>
                    <input id="email" className="input" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} />
                  </Field>
                </div>
              </div>
            </Step>

            <Step n={4} title="Payment">
              <div className="pay-list" role="radiogroup" aria-label="Payment method" data-field="payment">
                {methods.map((m) => {
                  const disabled = m.id === 'cod' && codBlocked;
                  const on = form.payment === m.id;
                  return (
                    <label key={m.id} className={`pay${on ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={on}
                        disabled={disabled}
                        onChange={() => {
                          updateCheckout({ payment: m.id });
                          setErrors((x) => ({ ...x, payment: undefined }));
                        }}
                      />
                      <span className="pay-icon">{payIcons[m.id]}</span>
                      <span className="pay-text">
                        <span>{m.label}</span>
                        <span className="small muted">{disabled ? `Available on orders up to ${formatINR(PAYMENT.codMaxOrder)}` : m.detail}</span>
                      </span>
                      <span className="opt-mark" aria-hidden />
                    </label>
                  );
                })}
              </div>
              {errors.payment && <p className="field-error">{errors.payment}</p>}
              <p className="small muted pay-note">
                No card, UPI or bank details are collected on this site. Once a payment provider is connected, you will complete payment on its secure page.
              </p>
            </Step>
          </div>

          <aside className="checkout-side">
            <div className="summary">
              <div className="summary-head">
                <h2 className="h3">Order summary</h2>
                <button type="button" className="text-btn underline small" onClick={() => setUI({ cartOpen: true })}>
                  Edit bag
                </button>
              </div>
              <ul className="summary-lines">
                {lines.map((l) => {
                  const p = productById.get(l.productId)!;
                  return (
                    <li key={l.key}>
                      <span className="summary-img">
                        <Picture name={p.image} sizes="56px" />
                      </span>
                      <span className="summary-text">
                        <span className="small">
                          {l.qty} × {p.name}
                        </span>
                        <span className="small muted">{variantOf(p, l.variantId).label}</span>
                        {conflicts.get(l.key) && <span className="small stop-text">{conflicts.get(l.key)}</span>}
                      </span>
                      <span className="small num">{formatINR(unitPrice(l) * l.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <TotalsTable totals={totals} />
              <MinimumBar shortBy={totals.shortBy} subtotal={totals.subtotal} />
              <button type="button" className="btn btn-primary btn-block btn-lg summary-cta" disabled={blocked} onClick={proceed}>
                Review order
                <span className="btn-split num">{formatINR(totals.total)}</span>
              </button>
              <p className="small muted">Sample prices, fees and taxes for review.</p>
            </div>
          </aside>
        </div>
      </div>

      <div className="checkout-mbar mobile-only">
        <div>
          <span className="small muted">To pay</span>
          <strong className="num">{formatINR(totals.total)}</strong>
        </div>
        <button type="button" className="btn btn-primary btn-lg" disabled={blocked} onClick={proceed}>
          Review order
        </button>
      </div>

      <Sheet open={reviewOpen} onClose={() => setReviewOpen(false)} label="Review your order" desktop="dialog" title={<span className="h3">Review your order</span>}>
        <div className="review">
          <dl className="review-list">
            <div>
              <dt className="label muted">Deliver to</dt>
              <dd>
                {form.name}
                <br />
                {form.house}, {form.street}
                {form.landmark && `, near ${form.landmark}`}
                <br />
                <span className="num">
                  {check?.pin ?? ''} {check?.area ? `· ${check.area}` : ''}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label muted">When</dt>
              <dd>{slotLabel}</dd>
            </div>
            <div>
              <dt className="label muted">Contact</dt>
              <dd className="num">
                +91 {form.phone}
                {form.email && (
                  <>
                    <br />
                    {form.email}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="label muted">Payment</dt>
              <dd>{PAYMENT.methods.find((m) => m.id === form.payment)?.label}</dd>
            </div>
          </dl>
          <TotalsTable totals={totals} />
          <div className="notice" role="note">
            <ShieldAlert size={20} strokeWidth={1.4} aria-hidden />
            <p>
              <strong>Payment is not connected yet.</strong> This preview stops here: no order is placed and nothing is charged. When a payment provider
              is integrated, this button will hand off to its secure page.
            </p>
          </div>
          <button type="button" className="btn btn-block btn-lg" disabled aria-describedby="pay-off">
            <Lock size={16} strokeWidth={1.6} /> Pay {formatINR(totals.total)} — not connected
          </button>
          <p id="pay-off" className="small muted center">
            Payment integration pending client confirmation.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="step">
      <h2 className="step-title">
        <span className="step-n num">{n}</span>
        {title}
      </h2>
      <div className="step-body">{children}</div>
    </section>
  );
}
