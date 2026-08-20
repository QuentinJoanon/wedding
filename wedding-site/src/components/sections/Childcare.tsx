import weddingData from '../../data/wedding-data.json';

const { kidsFacts, kidsTips } = weddingData;

export const Childcare = () => {
  return (
    <section className="section panel" id="enfants">
      <div className="wrap kids__grid">
        <div className="section__body">
          <p className="kicker reveal">
            <span className="num">04</span>&nbsp;— Les Enfants
          </p>
          <h2 className="big reveal d1">
            Une{' '}
            <em>
              soirée rien
              <br />
              que pour eux.
            </em>
          </h2>
          <p className="reveal d1">
            Pendant que les grands festoient, les petits profitent de leur propre soirée&nbsp;:
            dîner dédié, baby-sitter, coin lecture, films et jeux calmes dans le château.
          </p>
          <ul className="kids__tips reveal d2">
            {kidsTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="kids__facts reveal d1">
          {kidsFacts.map((fact) => (
            <div className="kids__fact" key={fact.k}>
              <span className="k">{fact.k}</span>
              <span className="v">{fact.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
