import type { MediaKey } from './media';

/**
 * CATALOGUE — built only from the products the client photographed.
 *
 * Names and photographs are the client's. Descriptions describe what is
 * visible in each photograph and avoid unverified ingredient claims.
 * Prices, variants and add-ons are DEMO DATA (`demo: true`) until confirmed.
 */

export type CategoryId = 'cheesecakes' | 'brownies' | 'cookies' | 'cakes' | 'pizza' | 'burgers' | 'sides';

export interface Category {
  id: CategoryId;
  name: string;
  /** Short line used in the category rail. */
  line: string;
  /** Category image. Stock photos here represent the category, not a specific product. */
  cover: MediaKey;
  /** Broad family, used to group the menu-discovery rail. */
  family: 'sweet' | 'savoury';
}

export const categories: Category[] = [
  { id: 'cheesecakes', name: 'Cheesecakes', line: 'Biscoff, Nutella, blueberry', cover: 'stock-chocolate-cheesecake', family: 'sweet' },
  { id: 'brownies', name: 'Brownies & desserts', line: 'Plated, or by the box', cover: 'stock-brownie-stack', family: 'sweet' },
  { id: 'cookies', name: 'Cookies', line: 'The Nutella Cookie Tub', cover: 'stock-cookie-dessert', family: 'sweet' },
  { id: 'cakes', name: 'Cakes', line: 'Slices and whole cakes', cover: 'stock-chocolate-cake', family: 'sweet' },
  { id: 'pizza', name: 'Pizza', line: 'From the oven', cover: 'stock-pizza-red', family: 'savoury' },
  { id: 'burgers', name: 'Burgers', line: 'Soft buns, melted cheese', cover: 'stock-burger', family: 'savoury' },
  { id: 'sides', name: 'Garlic bread & savoury sides', line: 'Garlic bread, cheesy rolls', cover: 'garlic-bread', family: 'savoury' },
];

export interface Variant {
  id: string;
  label: string;
  /** Optional clarifier, e.g. "serves 6–8". */
  hint?: string;
  price: number;
  /** Hours of notice the kitchen needs for this variant (whole cakes etc.). */
  noticeHours?: number;
}

export type AddOn =
  | { id: string; kind: 'toggle'; label: string; price: number }
  | { id: string; kind: 'text'; label: string; price: number; maxLength: number; placeholder: string };

export type DietaryTag = 'vegetarian' | 'eggless' | 'gluten-free' | 'contains-nuts' | 'contains-dairy' | 'contains-gluten';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  /** One-line summary for cards. */
  short: string;
  description: string;
  /** Listing image (cards, rows, search). */
  image: MediaKey;
  /** Product-detail gallery, in order. The first item should match `image` for a seamless transition. */
  gallery: MediaKey[];
  /** Optional image to show when a particular variant is selected (e.g. a box of brownies). */
  variantImages?: Record<string, MediaKey>;
  /** Image carries baked-in promotional typography: never overlay text, never use as a tiny thumbnail. */
  campaignArtwork?: boolean;
  variants: Variant[];
  addOns: AddOn[];
  /**
   * Dietary claims and allergens are shown ONLY when `verified` is true.
   * Nothing here has been verified by the client yet, so the UI shows a
   * "pending confirmation" state instead of guessing.
   */
  dietary: { verified: boolean; tags: DietaryTag[] };
  allergens: { verified: boolean; list: string[] };
  /** Minutes the kitchen needs before dispatch (DEMO). */
  prepMinutes: number;
  keywords: string[];
  demo: true;
}

const pending = { dietary: { verified: false, tags: [] as DietaryTag[] }, allergens: { verified: false, list: [] as string[] } };

const iceCream: AddOn = { id: 'scoop', kind: 'toggle', label: 'Extra scoop of vanilla ice cream', price: 60 };
const cakeMessage: AddOn = { id: 'message', kind: 'text', label: 'Message on the cake', price: 0, maxLength: 28, placeholder: 'Happy birthday, Riya' };
const candles: AddOn = { id: 'candles', kind: 'toggle', label: 'Candles', price: 20 };

export const products: Product[] = [
  {
    id: 'biscoff-cheesecake',
    name: 'Biscoff Cheesecake',
    category: 'cheesecakes',
    short: 'Biscoff spread, crumb and a Lotus biscuit',
    description: 'Cheesecake on a biscuit base, finished with piped Biscoff spread, Biscoff crumb and a whole Lotus biscuit.',
    image: 'stock-biscoff-cheesecake',
    gallery: ['stock-biscoff-cheesecake', 'biscoff-cheesecake'],
    variants: [
      { id: 'slice', label: 'Slice', price: 220 },
      { id: 'whole-6', label: 'Whole, 6 inch', hint: 'Serves 6–8', price: 1450, noticeHours: 4 },
    ],
    addOns: [],
    ...pending,
    prepMinutes: 10,
    keywords: ['lotus', 'biscoff', 'caramel', 'cheesecake', 'signature'],
    demo: true,
  },
  {
    id: 'nutella-cheesecake',
    name: 'Nutella Cheesecake',
    category: 'cheesecakes',
    short: 'Nutella drizzle and chopped hazelnuts',
    description: 'Cheesecake on a biscuit base, piped with Nutella and finished with chopped hazelnuts.',
    image: 'nutella-cheesecake',
    gallery: ['nutella-cheesecake'],
    campaignArtwork: true,
    variants: [
      { id: 'slice', label: 'Slice', price: 220 },
      { id: 'whole-6', label: 'Whole, 6 inch', hint: 'Serves 6–8', price: 1450, noticeHours: 4 },
    ],
    addOns: [],
    ...pending,
    prepMinutes: 10,
    keywords: ['nutella', 'hazelnut', 'chocolate', 'cheesecake', 'signature'],
    demo: true,
  },
  {
    id: 'blueberry-cheesecake',
    name: 'Blueberry Cheesecake',
    category: 'cheesecakes',
    short: 'Under a layer of blueberry topping',
    description: 'Cheesecake on a biscuit base, set under a thick layer of blueberry topping.',
    image: 'stock-berry-cheesecake',
    gallery: ['stock-berry-cheesecake', 'blueberry-cheesecake'],
    variants: [
      { id: 'slice', label: 'Slice', price: 200 },
      { id: 'whole-6', label: 'Whole, 6 inch', hint: 'Serves 6–8', price: 1350, noticeHours: 4 },
    ],
    addOns: [],
    ...pending,
    prepMinutes: 10,
    keywords: ['blueberry', 'berry', 'fruit', 'cheesecake'],
    demo: true,
  },
  {
    id: 'nutella-cookie-tub',
    name: 'Nutella Cookie Tub',
    category: 'cookies',
    short: 'A cookie baked in its own tub, with Nutella',
    description: 'A soft cookie baked in its own tub and made with Nutella. Eat it from the tub, ideally while it is still warm.',
    image: 'nutella-cookie-tub',
    gallery: ['nutella-cookie-tub'],
    campaignArtwork: true,
    variants: [{ id: 'tub', label: 'Single tub', price: 249 }],
    addOns: [iceCream],
    ...pending,
    prepMinutes: 15,
    keywords: ['cookie', 'nutella', 'tub', 'viral', 'chocolate'],
    demo: true,
  },
  {
    id: 'brownie-vanilla',
    name: 'Brownie with Vanilla Ice Cream',
    category: 'brownies',
    short: 'Chocolate sauce, vanilla ice cream',
    description: 'A chocolate brownie under a scoop of vanilla ice cream, with chocolate sauce poured over.',
    image: 'brownie-vanilla',
    gallery: ['brownie-vanilla', 'stock-brownie-stack'],
    variantImages: { 'box-4': 'stock-brownie-stack' },
    variants: [
      { id: 'plated', label: 'Plated, with ice cream', price: 179 },
      { id: 'box-4', label: 'Box of 4 brownies', hint: 'Without ice cream', price: 499 },
    ],
    addOns: [iceCream],
    ...pending,
    prepMinutes: 8,
    keywords: ['brownie', 'chocolate', 'ice cream', 'sundae', 'dessert'],
    demo: true,
  },
  {
    id: 'biscoff-brownie',
    name: 'Biscoff Brownie',
    category: 'brownies',
    short: 'Vanilla ice cream, Biscoff drizzle and crumb',
    description: 'A chocolate brownie under vanilla ice cream, Biscoff drizzle, Biscoff crumb and a Lotus biscuit.',
    image: 'biscoff-brownie',
    gallery: ['biscoff-brownie'],
    variants: [{ id: 'plated', label: 'Plated, with ice cream', price: 219 }],
    addOns: [iceCream],
    ...pending,
    prepMinutes: 8,
    keywords: ['brownie', 'biscoff', 'lotus', 'ice cream', 'dessert'],
    demo: true,
  },
  {
    id: 'chocolate-cake',
    name: 'Dark Chocolate Cake',
    category: 'cakes',
    short: 'Layered chocolate sponge, cocoa dusted',
    description: 'Layers of dark chocolate sponge and chocolate filling, finished with a dusting of cocoa.',
    image: 'chocolate-cake',
    gallery: ['chocolate-cake', 'stock-chocolate-cake'],
    variants: [
      { id: 'slice', label: 'Slice', price: 160 },
      { id: 'half-kg', label: 'Half kg', hint: 'Serves 4–6', price: 650, noticeHours: 4 },
      { id: 'one-kg', label: '1 kg', hint: 'Serves 8–12', price: 1200, noticeHours: 6 },
    ],
    addOns: [cakeMessage, candles],
    ...pending,
    prepMinutes: 10,
    keywords: ['chocolate', 'cake', 'truffle', 'birthday', 'cocoa'],
    demo: true,
  },
  {
    id: 'fresh-fruit-cake',
    name: 'Fresh Fruit Cake',
    category: 'cakes',
    short: 'Cream, kiwi, pomegranate, apple',
    description: 'Layers of sponge and whipped cream with kiwi, pomegranate, apple and pineapple through the middle and on top.',
    image: 'fresh-fruit-cake',
    gallery: ['fresh-fruit-cake'],
    variants: [
      { id: 'slice', label: 'Slice', price: 150 },
      { id: 'half-kg', label: 'Half kg', hint: 'Serves 4–6', price: 600, noticeHours: 4 },
      { id: 'one-kg', label: '1 kg', hint: 'Serves 8–12', price: 1100, noticeHours: 6 },
    ],
    addOns: [cakeMessage, candles],
    ...pending,
    prepMinutes: 10,
    keywords: ['fruit', 'cake', 'kiwi', 'pomegranate', 'cream', 'birthday'],
    demo: true,
  },
  {
    id: 'pizza-jalapeno-pineapple',
    name: 'Jalapeño & Pineapple Pizza',
    category: 'pizza',
    short: 'Cheese, jalapeño, pineapple, herbs',
    description: 'A tomato base with melted cheese, jalapeño and pineapple, finished with dried herbs.',
    image: 'pizza-jalapeno-pineapple',
    gallery: ['pizza-jalapeno-pineapple'],
    variants: [
      { id: 'regular', label: 'Regular, 7 inch', price: 249 },
      { id: 'medium', label: 'Medium, 10 inch', price: 399 },
    ],
    addOns: [
      { id: 'cheese', kind: 'toggle', label: 'Extra cheese', price: 50 },
      { id: 'jalapeno', kind: 'toggle', label: 'Extra jalapeño', price: 30 },
    ],
    ...pending,
    prepMinutes: 20,
    keywords: ['pizza', 'jalapeno', 'jalapeño', 'pineapple', 'savoury', 'cheese'],
    demo: true,
  },
  {
    id: 'garlic-bread',
    name: 'Cheesy Garlic Bread',
    category: 'sides',
    short: 'Melted cheese, garlic and herbs',
    description: 'Toasted bread with garlic, melted cheese and a scatter of herbs.',
    image: 'garlic-bread',
    gallery: ['garlic-bread'],
    variants: [
      { id: 'two', label: '2 pieces', price: 149 },
      { id: 'four', label: '4 pieces', price: 269 },
    ],
    addOns: [{ id: 'dip', kind: 'toggle', label: 'Cheese dip', price: 40 }],
    ...pending,
    prepMinutes: 12,
    keywords: ['garlic', 'bread', 'cheese', 'savoury', 'starter'],
    demo: true,
  },
  {
    // NEW — name, recipe and price to be confirmed by the client.
    id: 'classic-burger',
    name: 'Classic Burger',
    category: 'burgers',
    short: 'Soft bun, melted cheese, sauce',
    description: 'A soft, toasted bun with a crisp patty, melted cheese and a generous layer of sauce.',
    image: 'stock-burger',
    gallery: ['stock-burger'],
    variants: [
      { id: 'single', label: 'Single burger', price: 199 },
      { id: 'pair', label: 'Two burgers', price: 369 },
    ],
    addOns: [{ id: 'cheese', kind: 'toggle', label: 'Extra cheese slice', price: 30 }],
    ...pending,
    prepMinutes: 15,
    keywords: ['burger', 'bun', 'cheese', 'savoury', 'patty', 'fast food'],
    demo: true,
  },
  {
    // NEW — product name and price to be confirmed by the client. Not the same item as the garlic bread.
    id: 'cheesy-herb-rolls',
    name: 'Cheesy Herb Rolls',
    category: 'sides',
    short: 'Baked rolls with melted cheese and herbs',
    description: 'Golden baked bread rolls, split and filled with melted cheese, finished with fresh herbs.',
    image: 'stock-cheese-rolls',
    gallery: ['stock-cheese-rolls'],
    variants: [
      { id: 'four', label: '4 rolls', price: 169 },
      { id: 'eight', label: '8 rolls', price: 309 },
    ],
    addOns: [],
    ...pending,
    prepMinutes: 15,
    keywords: ['rolls', 'bread', 'cheese', 'herb', 'savoury', 'side', 'starter'],
    demo: true,
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));

export const fromPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
