import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { setUI, useUI } from '../../store/ui';

export function ToastHost() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="toast-host" aria-live="polite" aria-atomic>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 40 }}
          >
            <span className="toast-icon">
              <Check size={14} strokeWidth={2} />
            </span>
            <span className="toast-text">
              <strong>{toast.title}</strong>
              {toast.detail && <span>{toast.detail}</span>}
            </span>
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action?.run();
                  setUI({ toast: null });
                }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
