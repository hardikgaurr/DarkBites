import { createStore, readStorage, useStore, writeStorage } from '../lib/store';
import type { ServiceCheck } from '../services/delivery';

export type SlotChoice = { kind: 'asap' } | { kind: 'slot'; id: string; dayIndex: number; start: number; end: number } | null;

interface DeliveryState {
  check: ServiceCheck | null;
  slot: SlotChoice;
}

const KEY = 'darkbites.delivery.v1';
export const deliveryStore = createStore<DeliveryState>({ check: readStorage<ServiceCheck | null>(KEY, null), slot: null });
deliveryStore.subscribe(() => writeStorage(KEY, deliveryStore.get().check));

export const setServiceCheck = (check: ServiceCheck | null) => deliveryStore.set((s) => ({ ...s, check }));
export const setSlot = (slot: SlotChoice) => deliveryStore.set((s) => ({ ...s, slot }));
export const useServiceCheck = () => useStore(deliveryStore, (s) => s.check);
export const useSlot = () => useStore(deliveryStore, (s) => s.slot);
