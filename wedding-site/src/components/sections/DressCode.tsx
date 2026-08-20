import { Fragment } from 'react';
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
            Élégance,
            <br />
            palette <em>fleurie</em>.
          </h2>
          <p className="lede">{dressCode.paletteIntro}</p>
        </div>

        <ul className="dress__palette reveal d1">
          {dressCode.palette.map((flower) => (
            <li key={flower.src}>
              <img src={flower.src} alt={flower.alt} loading="lazy" />
            </li>
          ))}
        </ul>

        <p className="dress__caption reveal d1">
          {dressCode.paletteCaption} <em>{dressCode.paletteHighlight}</em>
        </p>

        <div className="dress__text reveal d1">
          <p>
            {dressCode.text.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
          <p className="dress__avoid">{dressCode.avoid}</p>
        </div>

        <div className="rule" style={{ marginBlock: 'clamp(56px,8vw,110px)' }}></div>

        <FAQ />
      </div>
    </section>
  );
};
