import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { PRICING } from '../../config/business';
import { productById } from '../../data/products';
import { formatINR } from '../../lib/format';
import { unitPrice, variantOf } from '../../lib/pricing';
import { navigate } from '../../lib/router';
import { setLineQty, stockFor, unitsInCart, useCartLines, useStockConflicts, useTotals, type CartLine } from '../../store/cart';
import { setUI, useUI } from '../../store/ui';
import { Picture } from '../ui/Picture';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';
import { MinimumBar } from './MinimumBar';
import { TotalsTable } from './TotalsTable';

export function CartSheet() {
  const open = useUI((s) => s.cartOpen);
  const lines = useCartLines();
  const totals = useTotals();
  const conflicts = useStockConflicts();
  const close = () => setUI({ cartOpen: false });
  const blocked = totals.shortBy > 0 || conflicts.size > 0;

  return (
    <Sheet
      open={open}
      onClose={close}
      label="Your bag"
      desktop="drawer"
      className="cart-sheet"
      title={
        <span className="cart-title">
          <span className="h3">Your bag</span>
          <span className="label muted num">{totals.items ? `${totals.items} item${totals.items > 1 ? 's' : ''}` : ''}</span>
        </span>
      }
      footer={
        lines.length > 0 ? (
          <div className="cart-foot">
            <MinimumBar shortBy={totals.shortBy} subtotal={totals.subtotal} />
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              disabled={blocked}
              onClick={() => {
                close();
                navigate({ name: 'checkout' });
              }}
            >
              <span>Checkout</span>
              <span className="btn-split num">
                {formatINR(totals.total)} <ArrowRight size={17} strokeWidth={1.6} />
              </span>
            </button>
            {conflicts.size > 0 && <p className="small stop-text">Some items changed availability. Update them to continue.</p>}
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="empty">
          <ShoppingBag size={28} strokeWidth={1.2} />
          <p className="h3">Your bag is empty</p>
          <p className="muted">Cheesecakes, brownies, cakes and pizza — all from one kitchen in Deoria.</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              close();
              navigate({ name: 'menu' });
            }}
          >
            Explore the menu
          </button>
        </div>
      ) : (
        <>
          <ul className="cart-lines">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li
                  key={l.key}
                  layout="position"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                >
                  <CartLineView line={l} conflict={conflicts.get(l.key)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="cart-sum">
            <TotalsTable totals={totals} />
            {totals.freeDeliveryIn > 0 && (
              <p className="small muted">
                Add <span className="num">{formatINR(totals.freeDeliveryIn)}</span> more for free delivery (orders above{' '}
                {formatINR(PRICING.freeDeliveryAbove)}).
              </p>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}

function CartLineView({ line, conflict }: { line: CartLine; conflict?: string }) {
  const p = productById.get(line.productId)!;
  const v = variantOf(p, line.variantId);
  const extras = p.addOns.filter((a) => (a.kind === 'text' ? !!line.message : line.addOnIds.includes(a.id)));
  const unit = unitPrice(line);
  const max = line.qty + Math.max(0, stockFor(p.id) - unitsInCart(p.id));
  return (
    <div className={`cline${conflict ? ' has-conflict' : ''}`}>
      <button
        type="button"
        className="cline-media"
        onClick={() => {
          setUI({ cartOpen: false, productOrigin: null });
          navigate({ name: 'product', id: p.id });
        }}
        aria-label={`View ${p.name}`}
      >
        <Picture name={p.image} sizes="88px" />
      </button>
      <div className="cline-body">
        <p className="cline-name">{p.name}</p>
        <p className="cline-meta small muted">
          {v.label}
          {extras.map((a) => (a.kind === 'text' ? ` · “${line.message}”` : ` · ${a.label}`)).join('')}
        </p>
        {conflict && <p className="small stop-text">{conflict}</p>}
        <div className="cline-row">
          <QtyStepper size="sm" value={line.qty} max={max} removable onChange={(n) => setLineQty(line.key, n)} label={p.name} />
          <span className="cline-price num">{formatINR(unit * line.qty)}</span>
        </div>
      </div>
    </div>
  );
}
