import { KITCHEN, PIN_DIRECTORY, SLOTS } from '../config/business';

/**
 * Delivery service seam: PIN resolution, distance, ETA and slot capacity.
 * Every function here is a local simulation driven by config/business.ts.
 * Replace `resolvePin` with a geocoder, `estimateEta` with a routing API and
 * `fetchSlots` with the scheduling backend when they exist.
 */

export type ServiceStatus = 'serviceable' | 'out_of_range' | 'unknown_pin' | 'invalid';

export interface ServiceCheck {
  status: ServiceStatus;
  pin?: string;
  area?: string;
  distanceKm?: number;
  source: 'pin' | 'location';
}

const toRad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const isValidPin = (pin: string) => /^[1-9][0-9]{5}$/.test(pin);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function checkPin(pin: string): Promise<ServiceCheck> {
  if (!isValidPin(pin)) return { status: 'invalid', pin, source: 'pin' };
  await wait(500);
  const entry = PIN_DIRECTORY[pin];
  if (!entry) return { status: 'unknown_pin', pin, source: 'pin' };
  const d = distanceKm(KITCHEN, entry);
  return {
    status: d <= KITCHEN.serviceRadiusKm ? 'serviceable' : 'out_of_range',
    pin,
    area: entry.area,
    distanceKm: Math.round(d * 10) / 10,
    source: 'pin',
  };
}

/** User-initiated only. Never called on page load. */
export function checkCurrentLocation(): Promise<ServiceCheck> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'));
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const d = distanceKm(KITCHEN, { lat: pos.coords.latitude, lng: pos.coords.longitude });
          resolve({
            status: d <= KITCHEN.serviceRadiusKm ? 'serviceable' : 'out_of_range',
            distanceKm: Math.round(d * 10) / 10,
            area: 'Your current location',
            source: 'location',
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 },
      );
    } catch (e) {
      reject(e);
    }
  });
}

const round5 = (n: number) => Math.ceil(n / 5) * 5;

/** Approximate arrival window in minutes from now. */
export function estimateEta(distance: number, prepMinutes: number): [number, number] {
  const travel = (distance / KITCHEN.avgSpeedKmh) * 60 + KITCHEN.handoverMinutes;
  const low = round5(prepMinutes + travel);
  return [low, low + 15];
}

export interface Slot {
  id: string;
  dayIndex: number;
  /** Minutes from midnight. */
  start: number;
  end: number;
  booked: number;
  capacity: number;
  disabledReason?: 'past' | 'full' | 'notice';
}

export interface SlotDay {
  index: number;
  date: Date;
  label: string;
  sub: string;
  slots: Slot[];
}

/** Deterministic pseudo-random capacity so the demo is stable between renders. */
function simulatedBookings(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const r = (h >>> 0) % 100;
  if (r < 14) return SLOTS.capacity; // full
  return r % (SLOTS.capacity - 1);
}

export function isKitchenOpen(now = new Date()) {
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= KITCHEN.openHour * 60 && m < KITCHEN.closeHour * 60 - SLOTS.leadMinutes;
}

export function buildSlotDays(now: Date, noticeHours: number): SlotDay[] {
  const days: SlotDay[] = [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  for (let i = 0; i < SLOTS.daysAhead; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const slots: Slot[] = [];
    for (let s = KITCHEN.openHour * 60; s + SLOTS.lengthMinutes <= KITCHEN.closeHour * 60; s += SLOTS.lengthMinutes) {
      const minutesUntil = i * 1440 + s - nowMin;
      const booked = simulatedBookings(`${date.toDateString()}-${s}`);
      let disabledReason: Slot['disabledReason'];
      if (minutesUntil < SLOTS.leadMinutes) disabledReason = 'past';
      else if (minutesUntil < noticeHours * 60) disabledReason = 'notice';
      else if (booked >= SLOTS.capacity) disabledReason = 'full';
      slots.push({ id: `${i}-${s}`, dayIndex: i, start: s, end: s + SLOTS.lengthMinutes, booked, capacity: SLOTS.capacity, disabledReason });
    }
    days.push({
      index: i,
      date,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayFmt.format(date).split(',')[0],
      sub: dayFmt.format(date),
      slots,
    });
  }
  return days;
}
