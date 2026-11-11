import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DeliveryCheck } from '../components/delivery/DeliveryCheck';
import { AddControl } from '../components/product/AddControl';
import { ProductCard, ProductRow } from '../components/product/ProductCard';
import { FramedPicture, Picture } from '../components/ui/Picture';
import { Link } from '../components/ui/Link';
import { StockTag } from '../components/ui/StockTag';
import { BRAND, MERCHANDISING } from '../config/business';
import { categories, fromPrice, productById, products } from '../data/products';
import { openProduct } from '../lib/actions';
import { formatINR } from '../lib/format';
import { href } from '../lib/router';
import { useAvailability, useStockRecord } from '../store/inventory';
import { setUI } from '../store/ui';

const get = (id: string) => productById.get(id)!;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Homepage — product-first editorial.
 * 1 Hero · 2 Menu discovery · 3 Signature cheesecakes · 4 Brownies & desserts ·
 * 5 Savoury (burgers, pizza, sides) · 6 Cakes · 7 Baker · 8 Recognition · 9 Delivery
 * The hero dish (MERCHANDISING.heroProduct) is not repeated further down the page.
 */
export function Home() {
  return (
    <>
      <Hero />
      <MenuDiscovery />
      <Signature />
      <Brownies />
      <Savoury />
      <Cakes />
      <Baker />
      <Recognition />
      <DeliveryBlock />
    </>
  );
}

function SectionIndex({ n, label }: { n: string; label: string }) {
  return (
    <p className="label index num">
      <span>{n}</span>
      <span>{label}</span>
    </p>
  );
}

/* ——— 1. Hero ——— */
function Hero() {
  const p = get(MERCHANDISING.heroProduct);
  const still = useReducedMotion();
  const rise = (i: number) =>
    still ? {} : { initial: { y: '105%' }, animate: { y: '0%' }, transition: { duration: 0.9, delay: 0.06 + i * 0.08, ease } };
  return (
    <section className="h-hero" aria-label="DARK BITES">
      <div className="wrap h-hero-grid">
        <div className="h-hero-text">
          <p className="label h-eyebrow">{BRAND.descriptor}</p>
          <h1 className="h-hero-title" aria-label="Dessert and savoury, from Deoria.">
            <span className="h-line" aria-hidden>
              <motion.span {...rise(0)}>Dessert &amp; savoury,</motion.span>
            </span>
            <span className="h-line" aria-hidden>
              <motion.span className="h-accent" {...rise(1)}>
                from {BRAND.city}.
              </motion.span>
            </span>
          </h1>
          <motion.div
            className="h-hero-copy"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
          >
            <p className="lede">Cheesecakes, brownies, cakes, pizza and burgers — made by Aryaman Srivastava.</p>
            <div className="h-ctas">
              <motion.span whileTap={{ scale: 0.97 }} className="h-cta-wrap">
                <Link to={{ name: 'menu' }} className="btn btn-primary btn-lg">
                  Explore the menu <ArrowRight size={17} strokeWidth={1.5} />
                </Link>
              </motion.span>
              <button type="button" className="text-btn underline" onClick={() => setUI({ deliveryOpen: true })}>
                Check delivery availability
              </button>
            </div>
          </motion.div>
          <Link to={{ name: 'story' }} className="h-credit">
            <span className="h-credit-img">
              <Picture name="aryaman-plated" sizes="44px" />
            </span>
            <span className="h-credit-text">
              <span>Aryaman Srivastava</span>
              <span className="small muted">Founder and baker · Best Plated Dessert Student Award, 2022</span>
            </span>
          </Link>
        </div>

        <motion.figure
          className="h-hero-photo"
          initial={still ? false : { clipPath: 'inset(10% 0% 0% 0%)', opacity: 0.5 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease }}
        >
          <a
            href={href({ name: 'product', id: p.id })}
            className="h-photo-link"
            onClick={(e) => {
              e.preventDefault();
              openProduct(p, 'hero');
            }}
            aria-label={`${p.name}, ${formatINR(fromPrice(p))} — view details`}
          >
            <motion.div layoutId={`hero:${p.id}`}>
              <Picture name={p.image} sizes="(min-width: 900px) 42vw, 100vw" priority />
            </motion.div>
            <figcaption className="h-coverline">
              <span className="h-coverline-no num">Nº 01</span>
              <span className="h-coverline-dish">{p.name}</span>
              <span className="h-coverline-price num">
                {formatINR(fromPrice(p))}
                <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />
              </span>
            </figcaption>
          </a>
        </motion.figure>
      </div>
    </section>
  );
}

/* ——— 2. Menu discovery ——— */
function MenuDiscovery() {
  const count = (id: string) => products.filter((p) => p.category === id).length;
  return (
    <section className="section tight h-discover">
      <div className="wrap">
        <div className="section-head split">
          <div className="section-head">
            <SectionIndex n="01" label="The menu" />
            <h2 className="h2">What are you craving?</h2>
          </div>
          <Link to={{ name: 'menu' }} className="text-btn underline section-aside">
            See the full menu
          </Link>
        </div>
      </div>
      <ul className="h-cats">
        {categories.map((c) => (
          <li key={c.id}>
            <Link to={{ name: 'menu', category: c.id }} className={`h-cat fam-${c.family}`}>
              <FramedPicture name={c.cover} ratio="3 / 4" sizes="(min-width: 900px) 13vw, 36vw" />
              <span className="h-cat-name">{c.name}</span>
              <span className="h-cat-count small muted num">
                {count(c.id)} {count(c.id) === 1 ? 'item' : 'items'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ——— 3. Signature cheesecakes ——— */
function Signature() {
  const items = MERCHANDISING.signature.map(get);
  return (
    <section className="section paper">
      <div className="wrap">
        <div className="section-head split">
          <div className="section-head">
            <SectionIndex n="02" label="Signature" />
            <h2 className="h2">
              Three <em>cheesecakes</em>
            </h2>
          </div>
          <p className="muted section-aside">Each on a biscuit base, by the slice or as a whole 6-inch cake.</p>
        </div>
      </div>
      <div className="h-sig">
        {items.map((p, i) => (
          <div className={`h-sig-item h-sig-${i}`} key={p.id}>
            <ProductCard product={p} origin="signature" sizes="(min-width: 900px) 30vw, 78vw" priority={i === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ——— 4. Brownies & desserts ——— */
function Brownies() {
  const brownie = get('brownie-vanilla');
  const rest = ['biscoff-brownie', 'nutella-cookie-tub'].map(get);
  return (
    <section className="section dark h-brownies">
      <div className="wrap h-brownies-grid">
        <a
          href={href({ name: 'product', id: brownie.id })}
          className="h-brownies-photo"
          onClick={(e) => {
            e.preventDefault();
            openProduct(brownie, null);
          }}
          aria-label="Brownies — view the box of four"
        >
          <Picture name="stock-brownie-stack" sizes="(min-width: 900px) 34vw, 70vw" />
        </a>
        <div className="h-brownies-text">
          <SectionIndex n="03" label="Brownies & desserts" />
          <h2 className="h1">
            Brownies, <em>plated</em> or by the box
          </h2>
          <p className="on-dark-body">
            Served warm with vanilla ice cream and chocolate sauce, or packed four to a box. The Biscoff Brownie and the Nutella Cookie Tub sit
            alongside.
          </p>
          <div className="h-brownies-actions">
            <button type="button" className="btn btn-light" onClick={() => openProduct(brownie, null)}>
              Brownies from {formatINR(fromPrice(brownie))}
            </button>
            <Link to={{ name: 'menu', category: 'brownies' }} className="text-btn underline">
              All desserts
            </Link>
          </div>
        </div>
      </div>
      <div className="h-rail">
        {rest.map((p) => (
          <div className="h-rail-item" key={p.id}>
            <ProductCard product={p} origin="desserts" tone="dark" sizes="(min-width: 900px) 24vw, 62vw" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ——— 5. Savoury ——— */
function Savoury() {
  const lead = get(MERCHANDISING.savouryLead);
  const others = ['pizza-jalapeno-pineapple', 'garlic-bread', 'cheesy-herb-rolls'].map(get);
  const a = useAvailability(lead.id);
  const rec = useStockRecord(lead.id);
  return (
    <section className="section h-savoury">
      <div className="wrap">
        <div className="section-head split">
          <div className="section-head">
            <SectionIndex n="04" label="Savoury" />
            <h2 className="h2">
              Burgers, pizza <em>&amp;</em> sides
            </h2>
          </div>
          <Link to={{ name: 'menu', category: 'burgers' }} className="text-btn underline section-aside">
            Savoury menu
          </Link>
        </div>
        <div className="h-savoury-grid">
          <article className="h-burger">
            <a
              href={href({ name: 'product', id: lead.id })}
              className="h-burger-photo"
              onClick={(e) => {
                e.preventDefault();
                openProduct(lead, 'savoury-lead');
              }}
              aria-label={`${lead.name} — view details`}
            >
              <motion.div layoutId={`savoury-lead:${lead.id}`}>
                <Picture name={lead.image} sizes="(min-width: 900px) 40vw, 100vw" />
              </motion.div>
            </a>
            <div className="h-burger-meta">
              <div>
                <p className="label muted">New on the menu</p>
                <h3 className="h3">{lead.name}</h3>
                <p className="muted small">{lead.short}</p>
              </div>
              <div className="h-burger-buy">
                <span className="num h-burger-price">
                  from {formatINR(fromPrice(lead))}
                  <StockTag value={a} stock={rec?.stock} quiet />
                </span>
                <AddControl product={lead} />
              </div>
            </div>
          </article>
          <div className="h-savoury-list">
            {others.map((p) => (
              <ProductRow key={p.id} product={p} origin="savoury" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— 6. Cakes ——— */
function Cakes() {
  const items = ['chocolate-cake', 'fresh-fruit-cake'].map(get);
  return (
    <section className="section paper">
      <div className="wrap h-cakes">
        <div className="h-cakes-intro">
          <SectionIndex n="05" label="Cakes" />
          <h2 className="h2">
            Slices and <em>whole cakes</em>
          </h2>
          <p className="muted">Whole cakes need a few hours’ notice. Add a message at no charge.</p>
          <figure className="h-cakes-photo">
            <Picture name="stock-chocolate-cake" sizes="(min-width: 900px) 28vw, 60vw" />
          </figure>
        </div>
        <div className="rows">
          {items.map((p, i) => (
            <ProductRow key={p.id} product={p} origin="rows" index={i} />
          ))}
          <Link to={{ name: 'menu', category: 'cakes' }} className="btn btn-outline h-cakes-cta">
            All cakes
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ——— 7. Baker ——— */
function Baker() {
  return (
    <section className="section baker">
      <div className="wrap baker-grid">
        <figure className="baker-portrait">
          <Picture name="aryaman-plated" sizes="(min-width: 900px) 40vw, 88vw" />
        </figure>
        <div className="baker-text">
          <SectionIndex n="06" label="The baker" />
          <h2 className="h1">
            Aryaman <em>Srivastava</em>
          </h2>
          <p className="lede">
            Aryaman trained at Truffle Nation Premium Baking School, where he received the Best Plated Dessert Student Award. DARK BITES is his bakery,
            confectionery and café in {BRAND.city}.
          </p>
          <Link to={{ name: 'story' }} className="text-btn underline">
            Behind DARK BITES <ArrowRight size={15} strokeWidth={1.6} />
          </Link>
          <figure className="baker-aside">
            <Picture name="aryaman-puppy" sizes="(min-width: 900px) 14vw, 36vw" />
            <figcaption className="small muted">Off the clock.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ——— 8. Recognition ——— */
function Recognition() {
  return (
    <section className="section tight recog">
      <div className="wrap recog-grid">
        <div className="recog-text">
          <SectionIndex n="07" label="Recognition" />
          <p className="recog-year num">2022</p>
          <h2 className="h2">
            Best Plated Dessert <em>Student Award</em>
          </h2>
          <p className="muted">Truffle Nation Premium Baking School · November 2022</p>
        </div>
        <figure className="recog-photo">
          <Picture name="award-2022" sizes="(min-width: 900px) 52vw, 100vw" />
          <figcaption className="small muted">Aryaman receiving the Best Plated Dessert Student Award, November 2022.</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ——— 9. Delivery ——— */
function DeliveryBlock() {
  return (
    <section className="section tight h-deliv">
      <div className="wrap deliv-grid">
        <div>
          <SectionIndex n="08" label="Delivery" />
          <h2 className="h2">Do we deliver to you?</h2>
          <p className="muted deliv-copy">Enter your PIN code to see the estimated arrival time. Same-day slots and scheduled delivery are chosen at checkout.</p>
        </div>
        <DeliveryCheck />
      </div>
    </section>
  );
}
