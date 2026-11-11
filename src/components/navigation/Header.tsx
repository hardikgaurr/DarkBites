import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ChevronDown, MapPin, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '../../config/business';
import type { Route } from '../../lib/router';
import { useCartCount } from '../../store/cart';
import { useServiceCheck } from '../../store/delivery';
import { setUI, useUI } from '../../store/ui';
import { Link } from '../ui/Link';
import { HeaderBrand } from './Brand';

const links: { label: string; to: Route }[] = [
  { label: 'Home', to: { name: 'home' } },
  { label: 'Menu', to: { name: 'menu' } },
  { label: 'Cheesecakes', to: { name: 'menu', category: 'cheesecakes' } },
  { label: 'Cakes', to: { name: 'menu', category: 'cakes' } },
  { label: 'Pizza', to: { name: 'menu', category: 'pizza' } },
  { label: 'Burgers', to: { name: 'menu', category: 'burgers' } },
  { label: 'Our story', to: { name: 'story' } },
];

/**
 * Header priority (mobile): brand → delivery location → search → bag.
 * Always solid; a hairline appears once the page scrolls.
 */
export function Header({ route }: { route: Route; overHero?: boolean }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 4;
    if (next !== scrolled) setScrolled(next);
  });
  const count = useCartCount();
  const check = useServiceCheck();
  const pulse = useUI((s) => s.cartPulse);
  const active = (to: Route) =>
    to.name === route.name && (to.name !== 'menu' || (route.name === 'menu' && to.category === route.category));

  const place =
    check?.status === 'serviceable'
      ? check.source === 'location'
        ? 'Current location'
        : `${check.pin}`
      : check?.status === 'out_of_range'
        ? 'Out of area'
        : BRAND.city;

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-inner wrap">
        <Link to={{ name: 'home' }} className="header-brand" aria-label="DARK BITES — home">
          <HeaderBrand />
        </Link>

        <nav className="header-nav" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className={`header-link${active(l.to) ? ' is-active' : ''}`} aria-current={active(l.to) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="loc" onClick={() => setUI({ deliveryOpen: true })} aria-label={`Delivery location: ${place}. Change`}>
            <MapPin size={16} strokeWidth={1.6} aria-hidden />
            <span className="loc-text">
              <span className="loc-kicker">Deliver to</span>
              <span className={`loc-place num${check?.status === 'out_of_range' ? ' is-warn' : ''}`}>
                {place}
                <ChevronDown size={14} strokeWidth={1.6} aria-hidden />
              </span>
            </span>
          </button>
          <button type="button" className="icon-btn" onClick={() => setUI({ searchOpen: true })} aria-label="Search the menu">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button type="button" className="icon-btn bag-btn" onClick={() => setUI({ cartOpen: true })} aria-label={`Bag, ${count} items`}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <motion.span
                key={pulse}
                className="bag-count num"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 30 }}
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
