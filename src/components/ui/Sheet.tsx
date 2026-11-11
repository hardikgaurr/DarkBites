import { AnimatePresence, motion, useDragControls, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEscape, useMediaQuery, useScrollLock } from './useScrollLock';

export type DesktopMode = 'drawer' | 'dialog' | 'sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Rendered in the draggable header zone (mobile). */
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  desktop?: DesktopMode;
  className?: string;
  /** Hide the default title row (used when the content provides its own drag zone). */
  bare?: boolean;
  /** Extra drag zone rendered above body content (e.g. a product photo). */
  dragZone?: ReactNode;
  tone?: 'light' | 'dark';
}

const spring = { type: 'spring' as const, stiffness: 420, damping: 42, mass: 0.9 };

export function Sheet(props: Props) {
  return createPortal(<AnimatePresence>{props.open && <SheetInner key="sheet" {...props} />}</AnimatePresence>, document.body);
}

function SheetInner({ onClose, label, title, children, footer, desktop = 'drawer', className, bare, dragZone, tone = 'light' }: Props) {
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const mode: DesktopMode | 'mobile' = isDesktop ? desktop : 'mobile';
  const controls = useDragControls();
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 420], [1, 0]);
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(true);
  useEscape(true, onClose);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);
    return () => {
      window.clearTimeout(t);
      prev?.focus?.({ preventScroll: true });
    };
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 650) onClose();
  };

  const motionProps =
    mode === 'mobile' || mode === 'sheet'
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
      : mode === 'drawer'
        ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
        : { initial: { opacity: 0, y: 24, scale: 0.985 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.99 } };

  const draggable = mode === 'mobile';
  const startDrag = (e: React.PointerEvent) => draggable && controls.start(e);

  return (
    <div className={`sheet-root mode-${mode}`} role="presentation">
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      >
        <motion.div className="sheet-backdrop-fill" style={{ opacity: backdropOpacity }} />
      </motion.div>
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`sheet sheet-${tone}${className ? ` ${className}` : ''}`}
        {...motionProps}
        transition={spring}
        drag={draggable ? 'y' : false}
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.02, bottom: 0.85 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={draggable ? { y: dragY } : undefined}
      >
        {!bare && (
          <div className="sheet-head" onPointerDown={startDrag}>
            <span className="sheet-handle" aria-hidden />
            <div className="sheet-title">{title ?? <span className="label">{label}</span>}</div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}
        {bare && (
          <>
            <div className="sheet-grab" onPointerDown={startDrag}>
              <span className="sheet-handle" aria-hidden />
            </div>
            <button type="button" className="icon-btn sheet-close-float" onClick={onClose} aria-label="Close">
              <X size={20} strokeWidth={1.5} />
            </button>
          </>
        )}
        <div className="sheet-body">
          {dragZone && (
            <div className="sheet-dragzone" onPointerDown={startDrag}>
              {dragZone}
            </div>
          )}
          {children}
        </div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </motion.div>
    </div>
  );
}
