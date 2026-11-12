import { createStore, useStore } from '../lib/store';
import { navigate, parseHash, toHash, type Route } from '../lib/router';
import type { User } from '../services/auth';
import { checkoutStore, updateCheckout } from './checkout';

const SESSION_KEY = 'darkbites.session.v1';
const RETURN_KEY = 'darkbites.returnTo';
const REMEMBER_DAYS = 30;

interface Session {
  user: User;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
}

/** "Remember me" keeps the session in localStorage for 30 days; otherwise it ends with the tab. */
function readSession(): User | null {
  for (const area of ['localStorage', 'sessionStorage'] as const) {
    try {
      const raw = window[area].getItem(SESSION_KEY);
      if (!raw) continue;
      const s = JSON.parse(raw) as Session;
      if (s.expiresAt > Date.now() && s.user?.email) return s.user;
      window[area].removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
  }
  return null;
}

function writeSession(user: User | null, remember: boolean) {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    if (!user) return;
    const session: Session = { user, expiresAt: Date.now() + REMEMBER_DAYS * 864e5 };
    (remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — signed in for this page view only */
  }
}

export const authStore = createStore<AuthState>({ user: readSession() });
export const useUser = () => useStore(authStore, (s) => s.user);

// Keep other tabs in sync when the user signs in or out elsewhere.
window.addEventListener('storage', (e) => {
  if (e.key === SESSION_KEY) authStore.set({ user: readSession() });
});

export function setSignedIn(user: User, remember: boolean) {
  writeSession(user, remember);
  authStore.set({ user });
  // Save typing at checkout: fill contact details that are still empty.
  const f = checkoutStore.get();
  updateCheckout({
    name: f.name || user.name,
    email: f.email || user.email,
    phone: f.phone || user.phone || '',
  });
}

export function signOut() {
  writeSession(null, false);
  authStore.set({ user: null });
}

/** Open the sign-in screen and remember where to come back to. */
export function openAuth(mode: 'login' | 'signup' = 'login', from?: Route) {
  const here = from ?? parseHash(window.location.hash);
  const auth = here.name === 'login' || here.name === 'signup' || here.name === 'account';
  if (!auth) {
    try {
      window.sessionStorage.setItem(RETURN_KEY, toHash(here));
    } catch {
      /* ignore */
    }
  }
  navigate({ name: authStore.get().user ? 'account' : mode });
}

/** After sign-in: back to where the user came from, or the account page. */
export function returnAfterAuth() {
  let hash: string | null = null;
  try {
    hash = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
  } catch {
    /* ignore */
  }
  navigate(hash !== null ? parseHash(hash) : { name: 'account' }, { replace: true });
}

export const firstName = (u: User) => u.name.split(' ')[0] || u.name;
export const initials = (u: User) =>
  u.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('') || u.email[0]!.toUpperCase();
