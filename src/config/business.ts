/**
 * BUSINESS CONFIGURATION — single source of truth for every rule that the
 * client (DARK BITES) still has to confirm.
 *
 * Everything in this file is DEMO DATA unless a field says `confirmed: true`.
 * Components must read business rules from here, never hard-code them.
 */

export const BRAND = {
  name: 'DARK BITES',
  descriptor: 'Bakery · Confectionery · Café',
  founder: 'Aryaman Srivastava',
  // "DARK BITES (DEORIA)" appears in the client's own reel, so the city is confirmed.
  city: 'Deoria',
  region: 'Uttar Pradesh',
  // Contact details still to be supplied by the client.
  phone: null as string | null,
  email: null as string | null,
  instagram: null as string | null,
  addressLine: null as string | null,
} as const;

/** Shown wherever demo data is visible. */
export const PREVIEW_NOTICE =
  'Preview build. Prices, stock, delivery areas, time slots and fees are sample data awaiting confirmation. Payments are not connected.';

export const PRICING = {
  currency: 'INR',
  locale: 'en-IN',
  /** DEMO: minimum cart value before checkout is allowed. */
  minimumOrder: 299,
  /** DEMO: flat delivery fee and the subtotal above which delivery is free. */
  deliveryFee: 40,
  freeDeliveryAbove: 999,
  /** DEMO: packaging charge per order. */
  packagingFee: 20,
  /** DEMO: GST rate applied to subtotal + packaging. Confirm with the client's accountant. */
  taxRate: 0.05,
  taxLabel: 'GST (5%)',
} as const;

export const KITCHEN = {
  /** DEMO: approximate kitchen location used for distance checks (Deoria city centre). */
  lat: 26.5024,
  lng: 83.7791,
  /** DEMO: maximum delivery distance. */
  serviceRadiusKm: 8,
  /** DEMO: courier speed used for the ETA estimate. */
  avgSpeedKmh: 18,
  handoverMinutes: 8,
  /** DEMO: opening hours (24h clock, local time). */
  openHour: 11,
  closeHour: 22,
} as const;

export interface PinEntry {
  area: string;
  lat: number;
  lng: number;
}

/**
 * DEMO: PIN directory. In production this is replaced by a geocoding API
 * (see services/delivery.ts → `resolvePin`).
 */
export const PIN_DIRECTORY: Record<string, PinEntry> = {
  '274001': { area: 'Deoria', lat: 26.5024, lng: 83.7791 },
  '274404': { area: 'Deoria (outskirts, sample)', lat: 26.556, lng: 83.83 },
  '273001': { area: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  '274402': { area: 'Kushinagar (sample)', lat: 26.7399, lng: 83.8878 },
};

export const SLOTS = {
  /** DEMO: slot length and capacity simulation. */
  lengthMinutes: 60,
  capacity: 6,
  /** Minimum gap between now and the start of a same-day slot. */
  leadMinutes: 45,
  /** How many days ahead can be scheduled. */
  daysAhead: 3,
  /** Allow "as soon as possible" when the kitchen is open. */
  allowAsap: true,
} as const;

export const PAYMENT = {
  /** None of these are connected. The checkout stops at method selection. */
  methods: [
    { id: 'upi', label: 'UPI', detail: 'Pay from any UPI app' },
    { id: 'card', label: 'Debit or credit card', detail: 'Entered on the payment provider’s secure page' },
    { id: 'netbanking', label: 'Net banking', detail: 'All major Indian banks' },
    { id: 'wallet', label: 'Wallets', detail: 'Supported wallets via the payment provider' },
    { id: 'cod', label: 'Cash on delivery', detail: 'Pay the rider in cash or UPI' },
  ],
  /** DEMO: toggles for the client to decide. */
  codEnabled: true,
  codMaxOrder: 1500,
  gatewayConnected: false,
} as const;

export type PaymentMethodId = (typeof PAYMENT.methods)[number]['id'];

export const SUBSCRIPTION = {
  /** The business model is not confirmed. The module renders as a preview only. */
  live: false,
  discount: 0.1,
  plans: [
    { id: 'weekly-box', name: 'Weekly dessert box', items: 4, note: 'Four desserts, one delivery a week' },
    { id: 'fortnightly', name: 'Fortnightly favourites', items: 6, note: 'Six desserts every other week' },
  ],
  frequencies: [
    { id: 'weekly', label: 'Weekly', perMonth: 4 },
    { id: 'fortnightly', label: 'Every 2 weeks', perMonth: 2 },
    { id: 'monthly', label: 'Monthly', perMonth: 1 },
  ],
  deliveryDays: ['Friday', 'Saturday', 'Sunday'],
} as const;

/** DEMO: which products appear under "Bestsellers" until real order data exists. */
export const MERCHANDISING = {
  /** Product photographed in the homepage hero. Not repeated in the section directly below it. */
  heroProduct: 'brownie-vanilla',
  /** Featured in the savoury section of the homepage. */
  savouryLead: 'classic-burger',
  bestsellers: ['biscoff-cheesecake', 'classic-burger', 'nutella-cookie-tub', 'pizza-jalapeno-pineapple'],
  signature: ['biscoff-cheesecake', 'nutella-cheesecake', 'blueberry-cheesecake'],
  lowStockThreshold: 4,
} as const;
