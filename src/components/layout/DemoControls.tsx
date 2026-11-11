import { products } from '../../data/products';
import { availabilityOf } from '../../services/inventory';
import { clearCart } from '../../store/cart';
import { setServiceCheck } from '../../store/delivery';
import { inventoryStore, setStock } from '../../store/inventory';
import { useStore } from '../../lib/store';
import { setUI, useUI } from '../../store/ui';
import { Picture } from '../ui/Picture';
import { QtyStepper } from '../ui/QtyStepper';
import { Sheet } from '../ui/Sheet';
import { StockTag } from '../ui/StockTag';

/** Reviewer-only panel: simulates inventory changes so every stock state can be seen live. */
export function DemoControls() {
  const open = useUI((s) => s.demoOpen);
  const stock = useStore(inventoryStore, (s) => s.stock);
  return (
    <Sheet open={open} onClose={() => setUI({ demoOpen: false })} label="Preview controls" desktop="drawer">
      <div className="demo">
        <p className="small muted">
          Simulates the inventory service. Changes apply instantly across the menu, product pages, bag and checkout. Not visible to customers.
        </p>
        <ul className="demo-list">
          {products.map((p) => {
            const r = stock[p.id];
            if (!r) return null;
            return (
              <li key={p.id} className="demo-row">
                <span className="demo-img">
                  <Picture name={p.image} sizes="48px" />
                </span>
                <span className="demo-text">
                  <span className="small">{p.name}</span>
                  <StockTag value={availabilityOf(r)} stock={r.stock} />
                </span>
                <span className="demo-ctrls">
                  <QtyStepper size="sm" min={0} value={r.stock} onChange={(n) => setStock(p.id, { stock: Math.max(0, n) })} label={p.name} />
                  <label className="switch small">
                    <input type="checkbox" checked={r.paused} onChange={(e) => setStock(p.id, { paused: e.target.checked })} />
                    <span>Pause</span>
                  </label>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="demo-actions">
          <button type="button" className="btn btn-outline" onClick={clearCart}>
            Empty bag
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setServiceCheck(null)}>
            Forget delivery PIN
          </button>
        </div>
      </div>
    </Sheet>
  );
}
