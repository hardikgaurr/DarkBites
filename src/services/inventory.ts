import { MERCHANDISING } from '../config/business';
import { products } from '../data/products';

/**
 * Inventory service seam.
 * The mock below simulates a network round-trip and push updates. To go live,
 * implement `InventoryService` against the real stock API / websocket and swap
 * `inventoryService` — the store and UI do not change.
 */
export interface StockRecord {
  stock: number;
  /** Kitchen has paused the item (ingredient out, oven down…). */
  paused: boolean;
}
export type StockSnapshot = Record<string, StockRecord>;
export type Availability = 'in_stock' | 'low_stock' | 'sold_out' | 'unavailable';

export interface InventoryService {
  load(): Promise<StockSnapshot>;
  subscribe(onUpdate: (patch: Partial<StockSnapshot>) => void): () => void;
}

/** DEMO stock levels chosen to show every state. */
const DEMO_STOCK: StockSnapshot = Object.fromEntries(
  products.map((p) => [p.id, { stock: 14, paused: false }]),
);
DEMO_STOCK['blueberry-cheesecake'] = { stock: 3, paused: false };
DEMO_STOCK['fresh-fruit-cake'] = { stock: 2, paused: false };
DEMO_STOCK['garlic-bread'] = { stock: 0, paused: false };
DEMO_STOCK['biscoff-brownie'] = { stock: 8, paused: true };

export const mockInventoryService: InventoryService = {
  load: () => new Promise((resolve) => setTimeout(() => resolve(structuredClone(DEMO_STOCK)), 550)),
  subscribe: () => () => {},
};

export const inventoryService: InventoryService = mockInventoryService;

export function availabilityOf(r: StockRecord | undefined): Availability {
  if (!r) return 'unavailable';
  if (r.paused) return 'unavailable';
  if (r.stock <= 0) return 'sold_out';
  if (r.stock <= MERCHANDISING.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export const availabilityLabel: Record<Availability, string> = {
  in_stock: 'Available',
  low_stock: 'Few left',
  sold_out: 'Sold out today',
  unavailable: 'Temporarily unavailable',
};
