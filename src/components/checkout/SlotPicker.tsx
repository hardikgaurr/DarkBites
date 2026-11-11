import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SLOTS } from '../../config/business';
import { formatClock } from '../../lib/format';
import { buildSlotDays, estimateEta, isKitchenOpen } from '../../services/delivery';
import { useCartNoticeHours, useCartPrepMinutes } from '../../store/cart';
import { setSlot, useServiceCheck, useSlot } from '../../store/delivery';

const reasonText = { past: 'Too soon', full: 'Full', notice: 'Needs notice' } as const;

export function SlotPicker({ error }: { error?: string }) {
  const notice = useCartNoticeHours();
  const prep = useCartPrepMinutes();
  const check = useServiceCheck();
  const slot = useSlot();
  const [now, setNow] = useState(() => new Date());

  // Refresh once a minute so slots that become too soon disable themselves.
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const days = useMemo(() => buildSlotDays(now, notice), [now, notice]);
  const firstDayWithSlots = days.findIndex((d) => d.slots.some((s) => !s.disabledReason));
  const [dayIndex, setDayIndex] = useState(() => (slot?.kind === 'slot' ? slot.dayIndex : Math.max(0, firstDayWithSlots)));
  const asapAllowed = SLOTS.allowAsap && isKitchenOpen(now) && notice === 0;
  const eta = check?.status === 'serviceable' ? estimateEta(check.distanceKm ?? 3, prep) : null;

  // Drop a selection that is no longer valid (notice changed, slot passed).
  useEffect(() => {
    if (slot?.kind === 'asap' && !asapAllowed) setSlot(null);
    if (slot?.kind === 'slot') {
      const s = days[slot.dayIndex]?.slots.find((x) => x.id === slot.id);
      if (!s || s.disabledReason) setSlot(null);
    }
  }, [days, asapAllowed, slot]);

  const day = days[dayIndex];

  return (
    <div className="slots">
      {SLOTS.allowAsap && (
        <button
          type="button"
          className={`asap${slot?.kind === 'asap' ? ' is-on' : ''}`}
          disabled={!asapAllowed}
          onClick={() => setSlot({ kind: 'asap' })}
          aria-pressed={slot?.kind === 'asap'}
        >
          <Zap size={18} strokeWidth={1.5} aria-hidden />
          <span className="asap-text">
            <strong>As soon as possible</strong>
            <span className="small muted">
              {!isKitchenOpen(now)
                ? 'The kitchen is closed right now — schedule a slot'
                : notice > 0
                  ? `Your bag has an item that needs ${notice} hours’ notice`
                  : eta
                    ? `Arrives in about ${eta[0]}–${eta[1]} min`
                    : 'Check your PIN for an arrival estimate'}
            </span>
          </span>
        </button>
      )}

      <div className="slot-days" role="tablist" aria-label="Delivery day">
        {days.map((d) => {
          const open = d.slots.filter((s) => !s.disabledReason).length;
          return (
            <button
              key={d.index}
              type="button"
              role="tab"
              aria-selected={d.index === dayIndex}
              className={`slot-day${d.index === dayIndex ? ' is-on' : ''}`}
              onClick={() => setDayIndex(d.index)}
            >
              <span>{d.label}</span>
              <span className="small muted num">{open ? `${open} slots` : 'No slots'}</span>
              {d.index === dayIndex && <motion.span layoutId="slot-day-ind" className="slot-day-ind" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </button>
          );
        })}
      </div>

      <div className="slot-grid" role="radiogroup" aria-label={`Slots for ${day.sub}`}>
        {day.slots.map((s) => {
          const on = slot?.kind === 'slot' && slot.id === s.id;
          const left = s.capacity - s.booked;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={!!s.disabledReason}
              className={`slot${on ? ' is-on' : ''}`}
              onClick={() => setSlot({ kind: 'slot', id: s.id, dayIndex: s.dayIndex, start: s.start, end: s.end })}
            >
              <span className="num">
                {formatClock(s.start)} – {formatClock(s.end)}
              </span>
              <span className="slot-sub small">
                {s.disabledReason ? reasonText[s.disabledReason] : left <= 2 ? `${left} left` : 'Available'}
              </span>
            </button>
          );
        })}
      </div>
      {notice > 0 && <p className="small muted">Slots within {notice} hours are disabled because your bag contains a whole cake.</p>}
      <p className="small muted">Sample slots with simulated capacity — not live availability.</p>
      {error && !slot && <p className="field-error">{error}</p>}
    </div>
  );
}
