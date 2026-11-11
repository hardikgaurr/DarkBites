import { PRICING } from '../config/business';

const inr = new Intl.NumberFormat(PRICING.locale, { style: 'currency', currency: PRICING.currency, maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(Math.round(n));

export const pad = (n: number) => String(n).padStart(2, '0');

export function formatClock(minutesFromMidnight: number) {
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const m = minutesFromMidnight % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${pad(m)} ${suffix}`;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
