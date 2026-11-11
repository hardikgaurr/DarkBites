import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, House, Search, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { formatINR } from '../../lib/format';
import { navigate, type Route } from '../../lib/router';
import { useCartCount, useTotals } from '../../store/cart';
import { setUI, useUI } from '../../store/ui';

export function BottomNav({ route }: { route: Route }) {
  const count = useCartCount();
  const totals = useTotals();
  const pulse = useUI((s) => s.cartPulse);
  const cartOpen = useUI((s) => s.cartOpen);
  const showBar = count > 0 && route.name !== 'checkout' && !cartOpen;

  const item = (label: string, icon: React.ReactNode, on: boolean, run: () => void, extra?: React.ReactNode) => (
    <button type="button" className={`bnav-item${on ? ' is-on' : ''}`} onClick={run} aria-current={on ? 'page' : undefined}>
      <span className="bnav-icon">
        {icon}
        {extra}
      </span>
      <span className="bnav-label">{label}</span>
    </button>
  );

  return (
    <div className="bnav-wrap mobile-only">
      <AnimatePresence>
        {showBar && (
          <motion.button
            type="button"
            className="bagbar"
            onClick={() => setUI({ cartOpen: true })}
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 460, damping: 38 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="bagbar-left">
              <motion.span key={pulse} className="num" initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {count} {count === 1 ? 'item' : 'items'}
              </motion.span>
              <span className="bagbar-sep" aria-hidden />
              <span className="num">{formatINR(totals.subtotal)}</span>
            </span>
            <span className="bagbar-right">
              View bag <ArrowRight size={16} strokeWidth={1.7} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <nav className="bnav" aria-label="Main">
        {item('Home', <House size={21} strokeWidth={1.4} />, route.name === 'home', () => navigate({ name: 'home' }))}
        {item('Menu', <UtensilsCrossed size={21} strokeWidth={1.4} />, route.name === 'menu' || route.name === 'product', () => navigate({ name: 'menu' }))}
        {item('Search', <Search size={21} strokeWidth={1.4} />, false, () => setUI({ searchOpen: true }))}
        {item('Story', <BookOpen size={21} strokeWidth={1.4} />, route.name === 'story', () => navigate({ name: 'story' }))}
        {item(
          'Bag',
          <ShoppingBag size={21} strokeWidth={1.4} />,
          cartOpen,
          () => setUI({ cartOpen: true }),
          count > 0 ? (
            <motion.span key={pulse} className="bag-count num" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 16 }}>
              {count}
            </motion.span>
          ) : null,
        )}
      </nav>
    </div>
  );
}
