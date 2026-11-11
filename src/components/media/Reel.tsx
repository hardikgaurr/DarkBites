import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const base = `${import.meta.env.BASE_URL}media/`;

/** Only one reel plays at a time across the page. */
const players = new Set<HTMLVideoElement>();
function claim(v: HTMLVideoElement) {
  players.forEach((o) => o !== v && !o.paused && o.pause());
}

interface Props {
  /** File stem in /media, e.g. "reel-pizza" → reel-pizza-540.mp4 + reel-pizza-poster-*.webp */
  name: string;
  label: string;
  /** ambient: muted autoplay while on screen (unless reduced motion / data saver). click: poster until tapped. */
  mode: 'ambient' | 'click';
  /** Native aspect ratio of the footage. Both supplied reels are 9:16. */
  ratio?: string;
  caption?: string;
  priorityPoster?: boolean;
}

function prefersStill() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return reduce || !!conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
}

export function Reel({ name, label, mode, ratio = '9 / 16', caption, priorityPoster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // src attached
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const ambient = mode === 'ambient' && !prefersStill();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    players.add(v);
    return () => {
      players.delete(v);
    };
  }, []);

  // Attach the source only when the reel approaches the viewport; pause when it leaves.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = ref.current;
        if (!v) return;
        if (entry.isIntersecting) {
          if (ambient) {
            setArmed(true);
            requestAnimationFrame(() => {
              claim(v);
              v.play().catch(() => setPlaying(false));
            });
          }
        } else if (!v.paused) v.pause();
      },
      { rootMargin: '120px 0px', threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ambient]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (!armed) setArmed(true);
    if (v.paused) {
      claim(v);
      if (!ambient && !started) {
        // A deliberate tap on a click-to-play reel means the viewer wants sound.
        v.muted = false;
        setMuted(false);
      }
      requestAnimationFrame(() => v.play().catch(() => undefined));
    } else v.pause();
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) {
      claim(v);
      v.play().catch(() => undefined);
    }
  };

  return (
    <figure className="reel">
      <div ref={wrapRef} className={`reel-frame${started ? ' is-started' : ''}`} style={{ aspectRatio: ratio }}>
        <video
          ref={ref}
          className="reel-video"
          playsInline
          muted={muted}
          loop={ambient}
          preload="none"
          poster={`${base}${name}-poster-720.webp`}
          src={armed ? `${base}${name}-540.mp4` : undefined}
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          aria-label={label}
          data-priority={priorityPoster ? 'true' : undefined}
        />
        {!started && !ambient && (
          <button type="button" className="reel-cover" onClick={toggle} aria-label={`Play: ${label}`}>
            <span className="reel-play">
              <Play size={22} strokeWidth={1.6} fill="currentColor" />
            </span>
          </button>
        )}
        <div className="reel-controls">
          <button type="button" className="glass-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={16} strokeWidth={1.8} fill="currentColor" /> : <Play size={16} strokeWidth={1.8} fill="currentColor" />}
          </button>
          <button type="button" className="glass-btn" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Mute'}>
            {muted ? <VolumeX size={16} strokeWidth={1.8} /> : <Volume2 size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
      {caption && <figcaption className="reel-cap small">{caption}</figcaption>}
    </figure>
  );
}
