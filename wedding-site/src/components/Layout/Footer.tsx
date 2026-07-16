import { Fragment } from 'react';
import weddingData from '../../data/wedding-data.json';

const { couple, contacts } = weddingData;

export const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <p className="kicker no-rule reveal" style={{ justifyContent: 'center' }}>
          À très bientôt
        </p>
        <h2 className="names reveal d1">
          {couple.groom} <span className="amp">&amp;</span> {couple.bride}
        </h2>
        <p className="date reveal d1">
          {couple.date} · {couple.venue}
        </p>
        <div className="footer__contacts reveal d2">
          {contacts.map((c, i) => (
            <Fragment key={c.name}>
              {i > 0 && <div className="footer__sep"></div>}
              <div className="footer__c">
                <span className="role">{c.role}</span>
                <span className="name">{c.name}</span>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
              </div>
            </Fragment>
          ))}
        </div>
        <p className="footer__fine reveal d2">
          Fait avec amour pour notre mariage · juin 2027
        </p>
      </div>
    </footer>
  );
};
