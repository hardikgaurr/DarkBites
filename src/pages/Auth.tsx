import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Eye, EyeOff, LogOut, MailCheck, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { GoogleButton } from '../components/auth/GoogleButton';
import { BrandSymbol } from '../components/brand/Brand';
import { Link } from '../components/ui/Link';
import { Picture } from '../components/ui/Picture';
import { navigate, type Route } from '../lib/router';
import {
  AuthError,
  DEMO_ACCOUNT,
  isAuthDemo,
  normaliseEmail,
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUp,
} from '../services/auth';
import { firstName, initials, returnAfterAuth, setSignedIn, signOut, useUser } from '../store/auth';
import { showToast } from '../store/ui';

/* ——— Validation ——— */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const validEmail = (v: string) => (!v.trim() ? 'Enter your email address' : EMAIL_RE.test(v.trim()) ? undefined : 'Enter a valid email, like name@example.com');

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  if (pw.length < 8) s = Math.min(s, 1);
  const score = s as 0 | 1 | 2 | 3 | 4;
  return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score]! };
}

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'agree', string>>;

/** Focus the first invalid field in DOM order. */
function focusFirstError(form: HTMLFormElement | null) {
  window.requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

/* ——— Pieces ——— */

function Field({
  id,
  label,
  error,
  hint,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`au-field${error ? ' has-error' : ''}`}>
      <div className="au-field-top">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {aside}
      </div>
      {children}
      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <motion.p key="e" className="au-msg is-error" id={`${id}-msg`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertCircle size={14} strokeWidth={1.8} aria-hidden /> {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="h" className="au-msg" id={`${id}-msg`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  autoComplete: 'current-password' | 'new-password';
}) {
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.('CapsLock') ?? false);
  return (
    <>
      <div className="au-pw">
        <input
          id={id}
          name={id}
          className="input"
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setCaps(false);
            onBlur?.();
          }}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required
        />
        <button type="button" className="au-pw-toggle" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}>
          {shown ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
        </button>
      </div>
      {caps && (
        <p className="au-msg is-warn" role="status">
          Caps Lock is on
        </p>
      )}
    </>
  );
}

function SubmitButton({ busy, children, busyLabel }: { busy: boolean; children: ReactNode; busyLabel: string }) {
  return (
    <button type="submit" className="btn btn-primary btn-lg btn-block au-submit" disabled={busy} aria-busy={busy || undefined}>
      {busy ? (
        <>
          <span className="spinner" aria-hidden /> {busyLabel}
        </>
      ) : (
        <>
          {children} <ArrowRight size={17} strokeWidth={1.7} aria-hidden />
        </>
      )}
    </button>
  );
}

function FormAlert({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <motion.div className="au-alert" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AlertCircle size={18} strokeWidth={1.6} aria-hidden />
      <div>
        <p>{children}</p>
        {action}
      </div>
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="au-or" role="separator" aria-label="or">
      <span>or with email</span>
    </div>
  );
}

const unexpected = 'Something went wrong on our side. Please try again in a moment.';

function useGoogle(onError: (msg: string) => void) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      const user = await signInWithGoogle();
      setSignedIn(user, true);
      showToast({ title: `Signed in as ${firstName(user)}`, detail: isAuthDemo ? 'Google sign-in · demo account' : 'Signed in with Google' });
      returnAfterAuth();
    } catch (e) {
      onError(e instanceof AuthError ? e.message : unexpected);
      setBusy(false);
    }
  };
  return { busy, run };
}

/* ——— Sign in ——— */

function SignIn({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'form' | 'forgot' | 'sent'>('form');
  const formRef = useRef<HTMLFormElement>(null);
  const google = useGoogle(setFormError);

  const validate = (): Errors => ({
    email: validEmail(email),
    password: password ? undefined : 'Enter your password',
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const errs = validate();
    setErrors(errs);
    if (errs.email || errs.password) return focusFirstError(formRef.current);
    setBusy(true);
    try {
      const user = await signInWithPassword(email, password);
      setSignedIn(user, remember);
      showToast({ title: `Welcome back, ${firstName(user)}` });
      returnAfterAuth();
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : unexpected);
      setPassword('');
      setBusy(false);
      window.requestAnimationFrame(() => document.getElementById('login-password')?.focus());
    }
  };

  const sendReset = async (e: FormEvent) => {
    e.preventDefault();
    const err = validEmail(email);
    setErrors({ email: err });
    if (err) return focusFirstError(formRef.current);
    setBusy(true);
    await requestPasswordReset(email);
    setBusy(false);
    setView('sent');
  };

  if (view === 'sent') {
    return (
      <motion.div key="sent" className="au-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <span className="au-done-icon">
          <MailCheck size={22} strokeWidth={1.5} />
        </span>
        <h2 className="h3">Check your inbox</h2>
        <p className="muted">
          If an account exists for <strong className="au-strong">{normaliseEmail(email)}</strong>, we’ve sent a link to reset the password. It expires in 30 minutes.
        </p>
        {isAuthDemo && <p className="au-demo-note">Demo: email sending isn’t connected yet, so no message was sent.</p>}
        <button type="button" className="btn btn-outline btn-lg btn-block" onClick={() => setView('form')}>
          <ArrowLeft size={17} strokeWidth={1.7} aria-hidden /> Back to sign in
        </button>
      </motion.div>
    );
  }

  if (view === 'forgot') {
    return (
      <motion.form key="forgot" ref={formRef} className="au-form" onSubmit={sendReset} noValidate initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="au-sub">
          <h2 className="h3">Reset your password</h2>
          <p className="muted">Enter the email you signed up with and we’ll send you a reset link.</p>
        </div>
        <Field id="reset-email" label="Email" error={errors.email}>
          <input
            id="reset-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? 'reset-email-msg' : undefined}
            autoFocus
          />
        </Field>
        <SubmitButton busy={busy} busyLabel="Sending link…">
          Send reset link
        </SubmitButton>
        <button type="button" className="au-textbtn au-center" onClick={() => { setErrors({}); setView('form'); }}>
          <ArrowLeft size={15} strokeWidth={1.7} aria-hidden /> Back to sign in
        </button>
      </motion.form>
    );
  }

  return (
    <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <GoogleButton label="Continue with Google" loading={google.busy} disabled={busy} onClick={google.run} />
      <Divider />
      <form ref={formRef} className="au-form" onSubmit={submit} noValidate aria-describedby={formError ? 'login-alert' : undefined}>
        <AnimatePresence>{formError && <div id="login-alert"><FormAlert>{formError}</FormAlert></div>}</AnimatePresence>
        <Field id="login-email" label="Email" error={errors.email}>
          <input
            id="login-email"
            name="email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((s) => ({ ...s, email: undefined }));
            }}
            onBlur={() => email && setErrors((s) => ({ ...s, email: validEmail(email) }))}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? 'login-email-msg' : undefined}
            required
          />
        </Field>
        <Field
          id="login-password"
          label="Password"
          error={errors.password}
          aside={
            <button type="button" className="au-textbtn" onClick={() => { setErrors({}); setFormError(null); setView('forgot'); }}>
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setErrors((s) => ({ ...s, password: undefined }));
            }}
            invalid={!!errors.password}
            describedBy={errors.password ? 'login-password-msg' : undefined}
            autoComplete="current-password"
          />
        </Field>
        <label className="au-check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span className="au-box" aria-hidden>
            <Check size={13} strokeWidth={2.4} />
          </span>
          <span>Keep me signed in for 30 days</span>
        </label>
        <SubmitButton busy={busy} busyLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      {isAuthDemo && (
        <div className="au-demo">
          <div className="au-demo-head">
            <Sparkles size={15} strokeWidth={1.6} aria-hidden />
            <span className="label">Demo account</span>
          </div>
          <dl>
            <div>
              <dt>Email</dt>
              <dd className="num">{DEMO_ACCOUNT.email}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd className="num">{DEMO_ACCOUNT.password}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="au-textbtn"
            onClick={() => {
              setEmail(DEMO_ACCOUNT.email);
              setPassword(DEMO_ACCOUNT.password);
              setErrors({});
              setFormError(null);
            }}
          >
            Fill in demo details
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ——— Create account ——— */

function SignUp({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<{ msg: string; taken?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const google = useGoogle((msg) => setFormError({ msg }));
  const strength = passwordStrength(password);

  const phoneDigits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  const validate = (): Errors => ({
    name: name.trim().length < 2 ? 'Enter your full name' : undefined,
    email: validEmail(email),
    phone: phoneDigits && !/^[6-9]\d{9}$/.test(phoneDigits) ? 'Enter a 10-digit Indian mobile number' : undefined,
    password:
      password.length < 8
        ? 'Use at least 8 characters'
        : !/[A-Za-z]/.test(password) || !/\d/.test(password)
          ? 'Use at least one letter and one number'
          : undefined,
    agree: agree ? undefined : 'Please accept the terms to continue',
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return focusFirstError(formRef.current);
    setBusy(true);
    try {
      const user = await signUp({ name, email, phone: phoneDigits || undefined, password });
      setSignedIn(user, true);
      showToast({ title: `Welcome to DARK BITES, ${firstName(user)}`, detail: 'Your account is ready.' });
      returnAfterAuth();
    } catch (err) {
      if (err instanceof AuthError) setFormError({ msg: err.message, taken: err.code === 'email_taken' });
      else setFormError({ msg: unexpected });
      setBusy(false);
    }
  };

  const blur = (k: keyof Errors) => () => {
    const v = validate()[k];
    setErrors((s) => ({ ...s, [k]: v }));
  };
  const clear = (k: keyof Errors) => errors[k] && setErrors((s) => ({ ...s, [k]: undefined }));

  return (
    <motion.div key="signup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <GoogleButton label="Sign up with Google" loading={google.busy} disabled={busy} onClick={google.run} />
      <Divider />
      <form ref={formRef} className="au-form" onSubmit={submit} noValidate>
        <AnimatePresence>
          {formError && (
            <FormAlert
              action={
                formError.taken ? (
                  <Link to={{ name: 'login' }} className="au-link">
                    Sign in with {normaliseEmail(email)}
                  </Link>
                ) : undefined
              }
            >
              {formError.msg}
            </FormAlert>
          )}
        </AnimatePresence>
        <Field id="su-name" label="Full name" error={errors.name}>
          <input
            id="su-name"
            className="input"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={name}
            onChange={(e) => { setName(e.target.value); clear('name'); }}
            onBlur={() => name && blur('name')()}
            aria-invalid={!!errors.name || undefined}
            aria-describedby={errors.name ? 'su-name-msg' : undefined}
            required
          />
        </Field>
        <Field id="su-email" label="Email" error={errors.email}>
          <input
            id="su-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clear('email'); }}
            onBlur={() => email && blur('email')()}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? 'su-email-msg' : undefined}
            required
          />
        </Field>
        <Field id="su-phone" label="Mobile number" error={errors.phone} hint="For order updates on WhatsApp" aside={<span className="au-opt">Optional</span>}>
          <div className="input-prefix">
            <span className="num">+91</span>
            <input
              id="su-phone"
              className="input num"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              enterKeyHint="next"
              maxLength={14}
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/[^\d\s-]/g, '')); clear('phone'); }}
              onBlur={() => phone && blur('phone')()}
              aria-invalid={!!errors.phone || undefined}
              aria-describedby="su-phone-msg"
            />
          </div>
        </Field>
        <Field
          id="su-password"
          label="Create a password"
          error={errors.password}
          hint={password ? undefined : 'At least 8 characters, with a letter and a number'}
        >
          <PasswordInput
            id="su-password"
            value={password}
            onChange={(v) => { setPassword(v); clear('password'); }}
            invalid={!!errors.password}
            describedBy="su-password-msg su-strength"
            autoComplete="new-password"
          />
          {password && (
            <div className="au-strength" data-score={strength.score} id="su-strength" aria-live="polite">
              <span className="au-strength-bars" aria-hidden>
                {[1, 2, 3, 4].map((i) => (
                  <i key={i} className={i <= strength.score ? 'on' : ''} />
                ))}
              </span>
              <span className="au-strength-label">Password strength: {strength.label}</span>
            </div>
          )}
        </Field>
        <div className={`au-field${errors.agree ? ' has-error' : ''}`}>
          <label className="au-check">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => { setAgree(e.target.checked); clear('agree'); }}
              aria-invalid={!!errors.agree || undefined}
              aria-describedby={errors.agree ? 'su-agree-msg' : undefined}
            />
            <span className="au-box" aria-hidden>
              <Check size={13} strokeWidth={2.4} />
            </span>
            <span>
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>
          {errors.agree && (
            <p className="au-msg is-error" id="su-agree-msg">
              <AlertCircle size={14} strokeWidth={1.8} aria-hidden /> {errors.agree}
            </p>
          )}
        </div>
        <SubmitButton busy={busy} busyLabel="Creating your account…">
          Create account
        </SubmitButton>
      </form>
    </motion.div>
  );
}

/* ——— Signed in ——— */

function Account() {
  const user = useUser();
  if (!user) return null;
  const since = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return (
    <motion.div key="account" className="au-account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="au-profile">
        <span className="au-avatar" aria-hidden>
          {initials(user)}
        </span>
        <div className="au-profile-text">
          <strong>{user.name}</strong>
          <span className="muted num">{user.email}</span>
        </div>
      </div>
      <dl className="au-facts">
        <div>
          <dt>Signed in with</dt>
          <dd>{user.provider === 'google' ? 'Google' : 'Email and password'}</dd>
        </div>
        {user.phone && (
          <div>
            <dt>Mobile</dt>
            <dd className="num">+91 {user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</dd>
          </div>
        )}
        <div>
          <dt>Member since</dt>
          <dd>{since}</dd>
        </div>
      </dl>
      <div className="au-note">
        <ShieldCheck size={18} strokeWidth={1.5} aria-hidden />
        <p>Your details are filled in for you at checkout. Order history will appear here once online ordering opens.</p>
      </div>
      <div className="au-actions">
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => navigate({ name: 'menu' })}>
          Browse the menu <ArrowRight size={17} strokeWidth={1.7} aria-hidden />
        </button>
        <button
          type="button"
          className="btn btn-outline btn-lg btn-block"
          onClick={() => {
            signOut();
            showToast({ title: 'Signed out', detail: 'See you soon.' });
            navigate({ name: 'login' }, { replace: true });
          }}
        >
          <LogOut size={17} strokeWidth={1.6} aria-hidden /> Sign out
        </button>
      </div>
    </motion.div>
  );
}

/* ——— Page ——— */

const copy = {
  login: { kicker: 'Your account', title: <>Welcome <em>back.</em></>, lede: 'Sign in to check out faster and keep your details in one place.' },
  signup: { kicker: 'Join DARK BITES', title: <>Create your <em>account.</em></>, lede: 'Takes under a minute. Your details are filled in for you at checkout.' },
  account: { kicker: 'Your account', title: null, lede: '' },
};

export function Auth({ route }: { route: Route }) {
  const user = useUser();
  const mode: 'login' | 'signup' | 'account' = user ? 'account' : route.name === 'signup' ? 'signup' : 'login';
  const [email, setEmail] = useState('');

  // Keep the address bar honest when the page is opened directly: signed-in users see
  // #account, signed-out users never do. Runs on route changes only — after a sign-in
  // the page is leaving, and returnAfterAuth() decides where to go.
  const userRef = useRef(user);
  userRef.current = user;
  useEffect(() => {
    const u = userRef.current;
    if (u && route.name !== 'account') navigate({ name: 'account' }, { replace: true });
    if (!u && route.name === 'account') navigate({ name: 'login' }, { replace: true });
  }, [route.name]);

  const c = copy[mode];
  const title = mode === 'account' && user ? <>Hello, <em>{firstName(user)}.</em></> : c.title;

  return (
    <div className="au">
      <aside className="au-visual ink-bg" aria-hidden="true">
        <div className="au-visual-inner">
          <div className="au-visual-pic">
            <Picture name="stock-login-cocoa" sizes="(min-width: 900px) 34vw, 1px" />
          </div>
          <p className="au-visual-line h2">
            Your usual, <em>two taps away.</em>
          </p>
          <ul className="au-perks">
            <li>
              <Zap size={16} strokeWidth={1.5} /> Faster checkout with saved details
            </li>
            <li>
              <ShieldCheck size={16} strokeWidth={1.5} /> Your details stay private
            </li>
            <li>
              <Sparkles size={16} strokeWidth={1.5} /> First to hear about new bakes
            </li>
          </ul>
        </div>
      </aside>

      <section className="au-panel" aria-labelledby="au-title">
        <div className="au-panel-inner">
          <div className="au-kicker">
            <BrandSymbol height={18} />
            <span className="label">{c.kicker}</span>
          </div>
          <h1 className="h1 au-title" id="au-title">
            {title}
          </h1>
          {c.lede && <p className="lede muted au-lede">{c.lede}</p>}

          {mode !== 'account' && (
            <nav className="au-tabs" aria-label="Account">
              {(['login', 'signup'] as const).map((m) => (
                <Link key={m} to={{ name: m }} className={`au-tab${mode === m ? ' is-on' : ''}`} aria-current={mode === m ? 'page' : undefined}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                  {mode === m && <motion.span layoutId="au-tab-line" className="au-tab-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                </Link>
              ))}
            </nav>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {mode === 'login' && <SignIn key="login" email={email} setEmail={setEmail} />}
            {mode === 'signup' && <SignUp key="signup" email={email} setEmail={setEmail} />}
            {mode === 'account' && <Account key="account" />}
          </AnimatePresence>

          {mode !== 'account' && (
            <p className="au-foot muted">
              {mode === 'login' ? (
                <>
                  New here? <Link to={{ name: 'signup' }} className="au-link">Create an account</Link>
                </>
              ) : (
                <>
                  Already have an account? <Link to={{ name: 'login' }} className="au-link">Sign in</Link>
                </>
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
