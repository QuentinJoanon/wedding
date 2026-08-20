import weddingData from '../../data/wedding-data.json';
import { FAQ } from './FAQ';

const { dressCode } = weddingData;

export const DressCode = () => {
  return (
    <section className="section panel" id="infos">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="kicker">
            <span className="num">06</span>&nbsp;— La Tenue
          </p>
          <h2 className="title">
            Élégance <em>champêtre</em>,
            <br />
            palette pastel.
          </h2>
          <p className="lede">
            Nous célébrons en plein air&nbsp;: pensez chic, pensez confortable, pensez herbe et
            lumière dorée.
          </p>
        </div>

        <div className="dress__grid reveal d1">
          {dressCode.columns.map((col) => (
            <div className="dress__col" key={col.title}>
              <div className="swatches">
                {col.swatches.map((c) => (
                  <span className="sw" style={{ background: c }} key={c}></span>
                ))}
              </div>
              <h3>{col.title}</h3>
              <p>{col.text}</p>
            </div>
          ))}
        </div>
        <p className="dress__note reveal d2">
          <span className="kicker no-rule">À noter</span> {dressCode.note}
        </p>

        <div className="rule" style={{ marginBlock: 'clamp(56px,8vw,110px)' }}></div>

        <FAQ />
      </div>
    </section>
  );
};
