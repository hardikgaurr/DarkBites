import { Settings2 } from 'lucide-react';
import { BRAND, PREVIEW_NOTICE } from '../../config/business';
import { categories } from '../../data/products';
import { setUI } from '../../store/ui';
import { FullLogo } from '../navigation/Brand';
import { Link } from '../ui/Link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <FullLogo tone="light" width={168} />
          <p className="small footer-muted">
            {BRAND.descriptor}
            <br />
            {BRAND.city}, {BRAND.region}
          </p>
        </div>
        <nav className="footer-col" aria-label="Menu categories">
          <h2 className="label footer-muted">Menu</h2>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={{ name: 'menu', category: c.id }}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="About">
          <h2 className="label footer-muted">DARK BITES</h2>
          <ul>
            <li>
              <Link to={{ name: 'story' }}>Our story</Link>
            </li>
            <li>
              <Link to={{ name: 'box' }}>Dessert box</Link>
            </li>
            <li>
              <button type="button" className="text-link" onClick={() => setUI({ deliveryOpen: true })}>
                Delivery areas
              </button>
            </li>
          </ul>
        </nav>
        <div className="footer-col">
          <h2 className="label footer-muted">Contact</h2>
          <ul className="footer-contact">
            <li>{BRAND.phone ?? <span className="placeholder">Phone number — to be added</span>}</li>
            <li>{BRAND.email ?? <span className="placeholder">Email — to be added</span>}</li>
            <li>{BRAND.instagram ?? <span className="placeholder">Instagram handle — to be added</span>}</li>
            <li>{BRAND.addressLine ?? <span className="placeholder">Café address, {BRAND.city} — to be added</span>}</li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-base">
        <p className="small footer-muted footer-notice">{PREVIEW_NOTICE}</p>
        <button type="button" className="demo-btn small" onClick={() => setUI({ demoOpen: true })}>
          <Settings2 size={14} strokeWidth={1.6} /> Preview controls
        </button>
        <p className="small footer-muted">© {new Date().getFullYear()} DARK BITES · Some menu photographs are representative.</p>
      </div>
    </footer>
  );
}
