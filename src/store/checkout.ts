import type { PaymentMethodId } from '../config/business';
import { createStore, readStorage, useStore, writeStorage } from '../lib/store';

export interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  house: string;
  street: string;
  landmark: string;
  instructions: string;
  payment: PaymentMethodId | null;
}

const KEY = 'darkbites.checkout.v1';
const empty: CheckoutForm = { name: '', phone: '', email: '', house: '', street: '', landmark: '', instructions: '', payment: null };

// Only contact/address fields are remembered on this device, never payment data.
export const checkoutStore = createStore<CheckoutForm>({ ...empty, ...readStorage<Partial<CheckoutForm>>(KEY, {}), payment: null });
checkoutStore.subscribe(() => {
  const { payment: _p, ...rest } = checkoutStore.get();
  void _p;
  writeStorage(KEY, rest);
});

export const updateCheckout = (patch: Partial<CheckoutForm>) => checkoutStore.set((s) => ({ ...s, ...patch }));
export const useCheckout = () => useStore(checkoutStore, (s) => s);

export type FieldErrors = Partial<Record<keyof CheckoutForm | 'pin' | 'slot', string>>;

export function validateCheckout(f: CheckoutForm): FieldErrors {
  const e: FieldErrors = {};
  if (f.name.trim().length < 2) e.name = 'Enter the name for this order';
  const digits = f.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a 10-digit Indian mobile number';
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'This email address looks incomplete';
  if (f.house.trim().length < 2) e.house = 'Add a house or flat number';
  if (f.street.trim().length < 3) e.street = 'Add the street or area';
  if (!f.payment) e.payment = 'Choose how you would like to pay';
  return e;
}
