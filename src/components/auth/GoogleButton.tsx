import { useId } from 'react';

/**
 * Google "G" — the current four-colour gradient mark used on Sign in with Google buttons.
 * Drawn from the standard G geometry; the colour seams are softened to match the
 * gradient version. Size and colours must not be changed (Google branding guidelines).
 * Before verification with Google, you may swap this for the SVG in Google's
 * official asset bundle (developers.google.com/identity/branding-guidelines).
 */
export function GoogleMark({ size = 20 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden focusable="false" className="g-mark">
      <defs>
        <clipPath id={`${id}-g`}>
          <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </clipPath>
        <filter id={`${id}-b`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-g)`}>
        <g filter={`url(#${id}-b)`}>
          <path fill="#4285F4" d="M24 24 60 9v51H44z" />
          <path fill="#EA4335" d="M24 24-12 12v-24h72v21z" />
          <path fill="#FBBC05" d="M24 24-12 12v24z" />
          <path fill="#34A853" d="M24 24-12 36v24h56z" />
        </g>
        <rect x="24" y="19.6" width="30" height="9.8" fill="#4285F4" />
      </g>
    </svg>
  );
}

type Label = 'Continue with Google' | 'Sign in with Google' | 'Sign up with Google';

/** Custom Sign in with Google button, built to Google's light-theme spec. */
export function GoogleButton({ label, loading, disabled, onClick }: { label: Label; loading?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="g-btn" onClick={onClick} disabled={disabled || loading} aria-busy={loading || undefined}>
      <span className="g-btn-state" aria-hidden />
      <span className="g-btn-icon">{loading ? <span className="spinner spinner-g" aria-hidden /> : <GoogleMark />}</span>
      <span className="g-btn-label">{loading ? 'Connecting to Google…' : label}</span>
    </button>
  );
}
