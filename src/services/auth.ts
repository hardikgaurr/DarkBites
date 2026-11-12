/**
 * Auth service — MOCK.
 *
 * Everything here runs in the browser so the site can be demoed without a backend.
 * The function signatures match what a real provider exposes (Supabase Auth, Firebase
 * Auth, or your own API), so going live means replacing the bodies of these functions,
 * not the screens that call them.
 *
 * Going live checklist:
 *  - Passwords are hashed and verified on the server, never in the browser.
 *  - Google sign-in uses Google Identity Services with a real OAuth client ID
 *    (set GOOGLE_CLIENT_ID), and the ID token is verified on the server.
 *  - Rate limiting and lockout happen on the server (the client-side limit below is UX only).
 */

export type AuthProvider = 'password' | 'google';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider: AuthProvider;
  createdAt: string;
}

export type AuthErrorCode = 'invalid_credentials' | 'email_taken' | 'rate_limited' | 'google_cancelled' | 'unavailable';

export class AuthError extends Error {
  code: AuthErrorCode;
  retryAfter?: number;
  constructor(code: AuthErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/** Demo account shown on the sign-in screen. */
export const DEMO_ACCOUNT = {
  name: 'Demo Customer',
  email: 'demo@darkbites.in',
  password: 'DarkBites@2026',
  phone: '9876543210',
} as const;

/** Leave empty while Google sign-in is simulated. */
export const GOOGLE_CLIENT_ID = '';
export const isAuthDemo = true;

const ACCOUNTS_KEY = 'darkbites.accounts.v1';
const SALT = 'darkbites:v1:';

interface StoredAccount extends User {
  passHash?: string;
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const latency = () => wait(650 + Math.random() * 450);
export const normaliseEmail = (e: string) => e.trim().toLowerCase();

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + text);
  if (window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Insecure contexts (plain http on a LAN IP) have no SubtleCrypto. Demo only.
  let h = 2166136261;
  for (const b of data) h = Math.imul(h ^ b, 16777619);
  return `fnv-${(h >>> 0).toString(16)}`;
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}
function writeAccounts(list: StoredAccount[]) {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — the account lives for this visit only */
  }
}

const uid = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`);

const strip = ({ passHash: _h, ...user }: StoredAccount): User => {
  void _h;
  return user;
};

async function ensureDemoAccount(): Promise<StoredAccount[]> {
  const list = readAccounts();
  if (list.some((a) => a.email === DEMO_ACCOUNT.email)) return list;
  const demo: StoredAccount = {
    id: 'demo',
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    phone: DEMO_ACCOUNT.phone,
    provider: 'password',
    createdAt: '2026-01-01T00:00:00.000Z',
    passHash: await hash(DEMO_ACCOUNT.password),
  };
  const next = [...list, demo];
  writeAccounts(next);
  return next;
}

/* Client-side throttle: 5 wrong attempts locks that email for 30 seconds. */
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;
const attempts = new Map<string, { count: number; until: number }>();

function assertNotLocked(email: string) {
  const a = attempts.get(email);
  if (a && a.until > Date.now()) {
    const s = Math.ceil((a.until - Date.now()) / 1000);
    throw new AuthError('rate_limited', `Too many attempts. Try again in ${s} seconds.`, s);
  }
}
function recordFailure(email: string) {
  const a = attempts.get(email) ?? { count: 0, until: 0 };
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.count = 0;
    a.until = Date.now() + LOCK_MS;
  }
  attempts.set(email, a);
}

export async function signInWithPassword(emailRaw: string, password: string): Promise<User> {
  const email = normaliseEmail(emailRaw);
  assertNotLocked(email);
  await latency();
  const list = await ensureDemoAccount();
  const acc = list.find((a) => a.email === email);
  // One message for both cases, so the form never reveals which emails have accounts.
  if (!acc || !acc.passHash || acc.passHash !== (await hash(password))) {
    recordFailure(email);
    throw new AuthError('invalid_credentials', 'That email and password don’t match. Check them and try again.');
  }
  attempts.delete(email);
  return strip(acc);
}

export async function signUp(input: { name: string; email: string; phone?: string; password: string }): Promise<User> {
  const email = normaliseEmail(input.email);
  await latency();
  const list = await ensureDemoAccount();
  if (list.some((a) => a.email === email)) {
    throw new AuthError('email_taken', 'An account with this email already exists. Sign in instead.');
  }
  const acc: StoredAccount = {
    id: uid(),
    name: input.name.trim().replace(/\s+/g, ' '),
    email,
    phone: input.phone?.replace(/\D/g, '').slice(-10) || undefined,
    provider: 'password',
    createdAt: new Date().toISOString(),
    passHash: await hash(input.password),
  };
  writeAccounts([...list, acc]);
  return strip(acc);
}

/**
 * Simulated Google sign-in. With a real client ID this becomes:
 * google.accounts.id / oauth2 popup → ID token → POST to your server → verified user.
 */
export async function signInWithGoogle(): Promise<User> {
  await wait(900);
  const email = 'guest.demo@gmail.com';
  const list = readAccounts();
  const existing = list.find((a) => a.email === email);
  if (existing) return strip(existing);
  const acc: StoredAccount = { id: uid(), name: 'Guest Demo', email, provider: 'google', createdAt: new Date().toISOString() };
  writeAccounts([...list, acc]);
  return acc;
}

/** Always resolves the same way, so it never reveals whether an email is registered. */
export async function requestPasswordReset(emailRaw: string): Promise<void> {
  void normaliseEmail(emailRaw);
  await latency();
}
