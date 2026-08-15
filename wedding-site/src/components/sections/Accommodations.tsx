import weddingData from '../../data/wedding-data.json';
import type { Accommodation, AccommodationType, OnSiteCamping } from '../../types';

const { accommodations, onSiteCamping } = weddingData as {
  accommodations: Accommodation[];
  onSiteCamping: OnSiteCamping;
};

const TYPE_LABEL: Record<AccommodationType, string> = {
  gite: 'Gîte',
  hotel: 'Hôtel',
  chambre_hote: "Chambre d'hôtes",
};

const BookLink = ({ a }: { a: Accommodation }) => {
  if (a.website) {
    return (
      <a className="card__link" href={a.website} target="_blank" rel="noopener">
        Réserver <span>↗</span>
      </a>
    );
  }
  if (a.phone) {
    return (
      <a className="card__link" href={`tel:${a.phone.replace(/\s/g, '')}`}>
        {a.phone}
      </a>
    );
  }
  return null;
};

export const Accommodations = () => {
  return (
    <section className="section" id="sejour">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="kicker">
            <span className="num">04</span>&nbsp;— Où Dormir
          </p>
          <h2 className="title">
            Posez vos valises
            <br />
            <em>tout près.</em>
          </h2>
          <p className="lede">
            Une sélection de gîtes, hôtels et chambres d'hôtes autour du domaine. Réservez tôt&nbsp;:
            les belles adresses partent vite.
          </p>
        </div>

        <div className="cards">
          {accommodations.map((a) => (
            <article className="card reveal" key={a.name}>
              <div className="card__top">
                <div className="card__name">{a.name}</div>
                <span className="card__cap">{a.dist}</span>
              </div>
              <div className="card__sub">
                {TYPE_LABEL[a.type]} · {a.town} · {a.capacity}
              </div>
              <div className="card__tags">
                {a.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <BookLink a={a} />
            </article>
          ))}
        </div>

        <aside className="onsite reveal d1">
          <p className="kicker no-rule onsite__eyebrow">Dormir sur place</p>
          <h3 className="onsite__title">{onSiteCamping.title}</h3>
          <p className="onsite__desc">{onSiteCamping.desc}</p>
          <dl className="onsite__facts">
            {onSiteCamping.facts.map((f) => (
              <div className="onsite__fact" key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
};
