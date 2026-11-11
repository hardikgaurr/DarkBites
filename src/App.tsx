import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { CartSheet } from './components/cart/CartSheet';
import { DemoControls } from './components/layout/DemoControls';
import { DeliverySheet } from './components/layout/DeliverySheet';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/navigation/BottomNav';
import { Header } from './components/navigation/Header';
import { SearchOverlay } from './components/navigation/SearchOverlay';
import { ProductSheet } from './components/product/ProductSheet';
import { ToastHost } from './components/ui/Toast';
import { productById } from './data/products';
import { back, toHash, useRoute, type Route } from './lib/router';
import { startInventory } from './store/inventory';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';

// Secondary routes are code-split so the first paint only ships home + menu.
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const Story = lazy(() => import('./pages/Story').then((m) => ({ default: m.Story })));
const Box = lazy(() => import('./pages/Box').then((m) => ({ default: m.Box })));

const titles: Record<Route['name'], string> = {
  home: 'DARK BITES — Bakery · Confectionery · Café',
  menu: 'Menu — DARK BITES',
  product: 'DARK BITES',
  checkout: 'Checkout — DARK BITES',
  story: 'Aryaman Srivastava — DARK BITES',
  box: 'Dessert box — DARK BITES',
};

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />;
    case 'menu':
      return <Menu category={route.category} />;
    case 'checkout':
      return <Checkout />;
    case 'story':
      return <Story />;
    case 'box':
      return <Box />;
    default:
      return <Menu />;
  }
}

export function App() {
  const route = useRoute();
  // The product sheet opens over whichever page was underneath it.
  const baseRef = useRef<Route>(route.name === 'product' ? { name: 'menu' } : route);
  if (route.name !== 'product') baseRef.current = route;
  const base = baseRef.current;
  const baseKey = base.name === 'menu' ? 'menu' : toHash(base) || 'home';
  const product = route.name === 'product' ? (productById.get(route.id) ?? null) : null;

  useEffect(() => startInventory(), []);

  useEffect(() => {
    document.title = product ? `${product.name} — DARK BITES` : titles[base.name];
  }, [product, base.name]);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>
          Skip to content
        </a>
        <Header route={base} overHero={base.name === 'home'} />
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })}>
          <motion.main
            key={baseKey}
            id="main-content"
            tabIndex={-1}
            className={`page page-${base.name}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<div className="wrap page-loading"><span className="skel-line shimmer" style={{ width: '40%' }} /></div>}>
              <Page route={base} />
            </Suspense>
            {base.name !== 'checkout' && <Footer />}
          </motion.main>
        </AnimatePresence>
        <BottomNav route={route} />
        <ProductSheet product={product} onClose={() => back(base)} />
        <CartSheet />
        <SearchOverlay />
        <DeliverySheet />
        <DemoControls />
        <ToastHost />
      </LayoutGroup>
    </MotionConfig>
  );
}
