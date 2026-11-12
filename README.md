# DARK BITES — website

Premium, mobile-first bakery and food-commerce frontend for DARK BITES, Deoria. Built with React 18, TypeScript and Vite, plus Framer Motion and Lucide icons. The fonts are Canela (display) and GT America (interface), self-hosted in `src/assets/fonts`.

```
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build → dist/
npm run preview   # serve the production build
```

The checkout stops at order review. No payment gateway is connected and no card, UPI or bank details are collected.

## Where things live

| Path | What |
|---|---|
| `src/config/business.ts` | Every unconfirmed business rule: minimum order, fees, GST, delivery radius, PIN codes, slots, payment methods, subscription, hero product, featured lists |
| `src/data/products.ts` | 7 categories and 12 products, with variants, add-ons, galleries and variant photos. Prices are **demo data**. Dietary claims show only when `verified: true` |
| `src/data/media.ts` | Every image, with origin (client / stock), credit, size and alt text |
| `src/services/` | Integration points: inventory, delivery/ETA/slots, payments (mock implementations) |
| `src/store/` | Cart, inventory, delivery, checkout and UI state |
| `src/components/brand/` | Logo components (redrawn original lips logo + Canela wordmark) |
| `src/pages/` | Home, Menu, Checkout, Story, Box |
| `src/styles/` | `tokens.css` (palette, type, spacing) → base → components → pages → chrome (header/nav/footer) → home → catalogue → theme |
| `public/brand/` | Logo SVGs, light and dark |
| `public/media/` | Optimised photos (AVIF/WebP), favicons, video derivatives |
| `media-source/` | Untouched original client and stock photographs |

Routes are hash based: `#menu`, `#menu-burgers`, `#p-classic-burger`, `#checkout`, `#story`, `#box`.

Footer → **Preview controls** changes stock live, to demonstrate the sold-out, low-stock and paused states.

See `ASSET_MANIFEST.md` for photo sources, licences and placement.

## Sign in / create account (demo)

- Routes: `#login`, `#signup`, `#account`. Desktop: account icon in the header. Phones: "Sign in" in the bottom nav.
- Demo account: `demo@darkbites.in` / `DarkBites@2026` (or tap "Fill in demo details").
- "Continue with Google" is simulated and signs in a demo Google user.
- Everything runs in the browser (`src/services/auth.ts`). To go live, replace the bodies of
  `signInWithPassword`, `signUp`, `signInWithGoogle` and `requestPasswordReset` with a real
  provider (Supabase Auth or Firebase Auth), and set `GOOGLE_CLIENT_ID`.
- Signing in fills the checkout name, email and phone if they are empty.
