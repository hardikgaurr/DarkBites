import { ArrowRight } from 'lucide-react';
import { FullLogo } from '../components/navigation/Brand';
import { Link } from '../components/ui/Link';
import { Picture } from '../components/ui/Picture';
import { BRAND } from '../config/business';

/** Only facts evidenced by the supplied photographs and reels. */
const facts = [
  { k: 'Training', v: 'Truffle Nation Premium Baking School' },
  { k: 'Recognition', v: 'Best Plated Dessert Student Award, November 2022' },
  { k: 'Kitchen', v: `DARK BITES — bakery, confectionery and café, ${BRAND.city}` },
];

export function Story() {
  return (
    <div className="story">
      <section className="wrap story-hero">
        <p className="label muted">Behind DARK BITES</p>
        <h1 className="display">
          Aryaman <em>Srivastava</em>
        </h1>
      </section>

      <section className="wrap story-grid">
        <figure className="story-portrait">
          <Picture name="aryaman-plated" sizes="(min-width: 900px) 46vw, 100vw" priority />
          <figcaption className="small muted">Aryaman with a plated dessert.</figcaption>
        </figure>
        <div className="story-text">
          <p className="lede">
            DARK BITES is Aryaman Srivastava’s bakery, confectionery and café in {BRAND.city}. The menu runs from cheesecakes and plated brownies to
            whole cakes, pizza and garlic bread, all made in the same kitchen.
          </p>
          <dl className="facts">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="label muted">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <Link to={{ name: 'menu' }} className="btn btn-primary btn-lg">
            Explore the menu <ArrowRight size={17} strokeWidth={1.6} />
          </Link>
        </div>
      </section>

      <section className="section paper">
        <div className="wrap story-award">
          <figure>
            <Picture name="award-2022" sizes="(min-width: 900px) 60vw, 100vw" />
            <figcaption className="small muted">Best Plated Dessert Student Award — Truffle Nation Premium Baking School, November 2022.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="wrap story-pair">
          <figure>
            <Picture name="kitchen-team" sizes="(min-width: 900px) 40vw, 100vw" />
            <figcaption className="small muted">With fellow chefs.</figcaption>
          </figure>
          <figure>
            <Picture name="aryaman-puppy" sizes="(min-width: 900px) 34vw, 80vw" />
            <figcaption className="small muted">Off the clock.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap story-logo">
          <FullLogo width={260} />
        </div>
      </section>
    </div>
  );
}
