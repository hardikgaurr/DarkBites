import { KITCHEN, PIN_DIRECTORY } from '../../config/business';
import { setUI, useUI } from '../../store/ui';
import { DeliveryCheck } from '../delivery/DeliveryCheck';
import { Sheet } from '../ui/Sheet';

export function DeliverySheet() {
  const open = useUI((s) => s.deliveryOpen);
  return (
    <Sheet open={open} onClose={() => setUI({ deliveryOpen: false })} label="Delivery location" desktop="dialog" title={<span className="h3">Where should we deliver?</span>}>
      <div className="dsheet">
        <DeliveryCheck autoFocus />
        <div className="dsheet-note">
          <p className="label muted">Preview delivery rules</p>
          <p className="small muted">
            Deliveries within {KITCHEN.serviceRadiusKm} km of the Deoria kitchen, {KITCHEN.openHour} am – {KITCHEN.closeHour - 12} pm. Sample PIN codes:{' '}
            {Object.entries(PIN_DIRECTORY)
              .map(([pin, e]) => `${pin} (${e.area})`)
              .join(', ')}
            .
          </p>
        </div>
      </div>
    </Sheet>
  );
}
