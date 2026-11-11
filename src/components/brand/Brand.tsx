import { WORDMARK_CAP, WORDMARK_PATH, WORDMARK_W } from './wordmarkPath';

/**
 * DARK BITES identity — the original lips-and-chocolate illustration, redrawn as clean vector
 * art (public/brand/*.svg), paired with a Canela wordmark.
 *   <BrandSymbol>    the lips mark alone
 *   <BrandWordmark>  "DARK BITES" alone
 *   <BrandLockup>    primary horizontal logo: mark + wordmark, optically aligned
 *   <BrandBadge>     the complete original circular logo, for footer / story
 * tone="ink" for light backgrounds, tone="light" for espresso.
 */
export type BrandTone = 'ink' | 'light';

const base = `${import.meta.env.BASE_URL}brand/`;
/** Width / height of the lips mark (viewBox of darkbites-symbol.svg). */
const MARK_RATIO = 1.3;
const WORD_FILL = { ink: '#211917', light: '#F6F2EC' } as const;

export function BrandSymbol({ height = 28, tone = 'ink' }: { height?: number; tone?: BrandTone }) {
  return (
    <img
      className="brand-symbol"
      src={`${base}darkbites-symbol${tone === 'light' ? '-light' : ''}.svg`}
      width={Math.round(height * MARK_RATIO)}
      height={height}
      alt=""
      aria-hidden
      decoding="async"
    />
  );
}

export function BrandWordmark({ height = 18, tone = 'ink' }: { height?: number; tone?: BrandTone }) {
  const width = (height * WORDMARK_W) / WORDMARK_CAP;
  return (
    <svg viewBox={`0 ${-WORDMARK_CAP} ${WORDMARK_W} ${WORDMARK_CAP}`} width={width} height={height} aria-hidden className="brand-wordmark">
      <path d={WORDMARK_PATH} fill={WORD_FILL[tone]} />
    </svg>
  );
}

/** Primary horizontal logo. `size` is the mark height; the wordmark cap height is ~0.53 of it. */
export function BrandLockup({ size = 30, tone = 'ink' }: { size?: number; tone?: BrandTone }) {
  return (
    <span className="brand" role="img" aria-label="DARK BITES">
      <BrandSymbol height={size} tone={tone} />
      <BrandWordmark height={Math.round(size * 0.53 * 10) / 10} tone={tone} />
    </span>
  );
}

export function BrandBadge({ width = 220, tone = 'ink' }: { width?: number; tone?: BrandTone }) {
  return (
    <img
      className="brand-badge"
      src={`${base}darkbites-logo${tone === 'light' ? '-light' : ''}.svg`}
      width={width}
      height={Math.round(width * 0.995)}
      alt="DARK BITES — Bakery, Confectionery, Café"
      loading="lazy"
      decoding="async"
    />
  );
}
