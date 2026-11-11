import { useState, type CSSProperties } from 'react';
import { media, type MediaKey } from '../../data/media';

interface Props {
  name: MediaKey;
  /** `sizes` attribute — tells the browser which width to fetch. */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Letterbox tone around a contained image. Defaults to the photo's own edge colour. */
  tone?: string;
  style?: CSSProperties;
}

const base = `${import.meta.env.BASE_URL}media/`;
const srcset = (key: string, widths: readonly number[], ext: string) =>
  widths.map((w) => `${base}${key}-${w}.${ext} ${w}w`).join(', ');

/**
 * Renders a client photograph intact: intrinsic aspect ratio, never cropped,
 * never stretched. AVIF with WebP fallback, responsive widths, lazy by default.
 */
export function Picture({ name, sizes, priority, className, tone, style }: Props) {
  const m = media[name];
  const [loaded, setLoaded] = useState(false);
  return (
    <span
      className={`pic${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: `${m.w} / ${m.h}`, background: tone ?? m.edge, ...style }}
    >
      <picture>
        <source type="image/avif" srcSet={srcset(m.key, m.widths, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcset(m.key, m.widths, 'webp')} sizes={sizes} />
        <img
          src={`${base}${m.key}-${m.widths[0]}.webp`}
          alt={m.alt}
          width={m.w}
          height={m.h}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority is valid HTML, not yet in React 18 types
          fetchpriority={priority ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          ref={(el) => {
            if (el?.complete && el.naturalWidth) setLoaded(true);
          }}
        />
      </picture>
    </span>
  );
}

/** Contain an image inside a frame of a fixed ratio, with a designed background. Never crops. */
export function FramedPicture({ name, sizes, ratio, tone, className, priority }: Props & { ratio: string }) {
  const m = media[name];
  return (
    <span className={`frame${className ? ` ${className}` : ''}`} style={{ aspectRatio: ratio, background: tone ?? m.edge }}>
      <Picture name={name} sizes={sizes} tone="transparent" priority={priority} className="frame-pic" />
    </span>
  );
}
