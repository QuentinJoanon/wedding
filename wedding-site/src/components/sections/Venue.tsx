import weddingData from '../../data/wedding-data.json';

const { couple } = weddingData;

export const Venue = () => {
  return (
    <section className="section" id="lieu">
      <div className="wrap venue__grid">
        <div className="venue__art reveal">
          <div className="frame">
            <div className="arch">
              <img
                className="cover"
                src="/orangerie.jpg"
                alt="L'orangerie du Domaine de Mont dressée pour le dîner"
              />
            </div>
          </div>
        </div>
        <div className="venue__body">
          <p className="kicker reveal">
            <span className="num">01</span>&nbsp;— Le Lieu
          </p>
          <h2 className="big reveal d1">
            Un château, un parc
            <br />
            et une <em>orangerie de verre</em>.
          </h2>
          <p className="reveal d1">
            Niché sur les hauteurs du Bazois, le Domaine de Mont déploie son château du XIXᵉ, ses
            jardins et sa grande orangerie d'acier et de lumière. C'est là, entre les arches vitrées
            et les grands bouquets, que nous nous dirons « oui ».
          </p>
          <div className="venue__meta reveal d2">
            <div className="item">
              <span className="k">Le lieu</span>
              <span className="v">{couple.venue}</span>
            </div>
            <div className="item">
              <span className="k">Où</span>
              <span className="v">{couple.location}</span>
            </div>
            <div className="item">
              <span className="k">Quand</span>
              <span className="v">{couple.date}</span>
            </div>
          </div>
          <a
            href={couple.venueWebsite}
            target="_blank"
            rel="noopener"
            className="linklike reveal d2"
          >
            Visiter le domaine <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};
