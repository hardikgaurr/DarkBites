import { createStore, useStore } from '../lib/store';
import { availabilityOf, inventoryService, type Availability, type StockRecord, type StockSnapshot } from '../services/inventory';

interface InventoryState {
  loaded: boolean;
  stock: StockSnapshot;
}

export const inventoryStore = createStore<InventoryState>({ loaded: false, stock: {} });

let started = false;
export function startInventory() {
  if (started) return;
  started = true;
  inventoryService.load().then((stock) => inventoryStore.set({ loaded: true, stock }));
  inventoryService.subscribe((patch) =>
    inventoryStore.set((s) => ({ ...s, stock: { ...s.stock, ...(patch as StockSnapshot) } })),
  );
}

/** Demo controls: change a product's stock and see every surface update. */
export function setStock(id: string, patch: Partial<StockRecord>) {
  inventoryStore.set((s) => ({ ...s, stock: { ...s.stock, [id]: { ...s.stock[id], ...patch } } }));
}

export const useInventoryLoaded = () => useStore(inventoryStore, (s) => s.loaded);
export const useStockRecord = (id: string) => useStore(inventoryStore, (s) => s.stock[id]);
export const useAvailability = (id: string): Availability =>
  useStore(inventoryStore, (s) => (s.loaded ? availabilityOf(s.stock[id]) : 'in_stock'));
export const canPurchase = (a: Availability) => a === 'in_stock' || a === 'low_stock';
