import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle, LocateFixed, MapPin, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { KITCHEN } from '../../config/business';
import { checkCurrentLocation, checkPin, estimateEta, isValidPin, type ServiceCheck } from '../../services/delivery';
import { setServiceCheck, useServiceCheck } from '../../store/delivery';

export function serviceMessage(c: ServiceCheck, prepMinutes = 15): { tone: 'ok' | 'warn' | 'stop'; title: string; detail: string } {
  switch (c.status) {
    case 'serviceable': {
      const [a, b] = estimateEta(c.distanceKm ?? 3, prepMinutes);
      return {
        tone: 'ok',
        title: c.source === 'location' ? 'Delivers to your location' : `Delivers to ${c.pin}${c.area ? ` · ${c.area}` : ''}`,
        detail: `${(c.distanceKm ?? 0) < 1 ? 'Under 1 km' : `About ${c.distanceKm} km`} from the kitchen. Estimated arrival ${a}–${b} min after the order is placed.`,
      };
    }
    case 'out_of_range':
      return {
        tone: 'stop',
        title: `Outside the delivery area${c.area ? ` · ${c.area}` : ''}`,
        detail: `${c.distanceKm} km away. The kitchen currently delivers within ${KITCHEN.serviceRadiusKm} km of Deoria.`,
      };
    case 'unknown_pin':
      return { tone: 'warn', title: `We couldn’t confirm ${c.pin}`, detail: 'This PIN is not in the preview’s delivery list. Try 274001 (Deoria).' };
    default:
      return { tone: 'warn', title: 'Check the PIN code', detail: 'Indian PIN codes have six digits and do not start with 0.' };
  }
}

interface Props {
  prepMinutes?: number;
  compact?: boolean;
  tone?: 'light' | 'dark';
  autoFocus?: boolean;
}

export function DeliveryCheck({ prepMinutes = 15, compact, tone = 'light', autoFocus }: Props) {
  const current = useServiceCheck();
  const [pin, setPin] = useState(current?.pin ?? '');
  const [busy, setBusy] = useState<'pin' | 'loc' | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    setLocError(null);
    if (!isValidPin(pin)) {
      setServiceCheck({ status: 'invalid', pin, source: 'pin' });
      return;
    }
    setBusy('pin');
    const res = await checkPin(pin);
    setServiceCheck(res);
    setBusy(null);
  };

  const locate = async () => {
    setLocError(null);
    setBusy('loc');
    try {
      const res = await checkCurrentLocation();
      setServiceCheck(res);
    } catch {
      setLocError('Location isn’t available here. Enter your PIN code instead.');
    } finally {
      setBusy(null);
    }
  };

  const msg = current ? serviceMessage(current, prepMinutes) : null;

  return (
    <div className={`dcheck dcheck-${tone}${compact ? ' is-compact' : ''}`}>
      <form className="dcheck-form" onSubmit={submit} noValidate>
        <label className="dcheck-field">
          <MapPin size={18} strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Delivery PIN code</span>
          <input
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Delivery PIN code"
            value={pin}
            autoFocus={autoFocus}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-invalid={touched && current?.status === 'invalid'}
          />
          {pin && (
            <button type="button" className="icon-btn sm" aria-label="Clear PIN" onClick={() => setPin('')}>
              <X size={16} strokeWidth={1.6} />
            </button>
          )}
        </label>
        <button type="submit" className={`btn ${tone === 'dark' ? 'btn-light' : 'btn-primary'}`} disabled={busy !== null || pin.length === 0}>
          {busy === 'pin' ? <LoaderCircle size={16} className="spin" /> : 'Check'}
        </button>
      </form>
      <button type="button" className="dcheck-locate" onClick={locate} disabled={busy !== null}>
        {busy === 'loc' ? <LoaderCircle size={15} className="spin" /> : <LocateFixed size={15} strokeWidth={1.6} />}
        Use my current location
      </button>
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {locError ? (
            <motion.p key="loc" className="dcheck-result tone-warn" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="dcheck-detail">{locError}</span>
            </motion.p>
          ) : (
            msg && (
              <motion.div
                key={`${current?.status}-${current?.pin}-${current?.source}`}
                className={`dcheck-result tone-${msg.tone}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="dcheck-icon">{msg.tone === 'ok' ? <Check size={14} strokeWidth={2} /> : <X size={14} strokeWidth={2} />}</span>
                <span>
                  <strong>{msg.title}</strong>
                  <span className="dcheck-detail">{msg.detail}</span>
                </span>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
