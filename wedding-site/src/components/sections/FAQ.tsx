import { useRef, useState } from 'react';
import weddingData from '../../data/wedding-data.json';
import type { FAQItem as FAQItemType } from '../../types';

const { faq } = weddingData as { faq: FAQItemType[] };

const FAQRow = ({ item }: { item: FAQItemType }) => {
  const [open, setOpen] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const pane = paneRef.current;
    if (!pane) {
      setOpen((o) => !o);
      return;
    }
    if (open) {
      // refermer : repartir de la hauteur réelle puis animer vers 0
      pane.style.height = `${pane.scrollHeight}px`;
      requestAnimationFrame(() => {
        pane.style.height = '0px';
      });
      setOpen(false);
    } else {
      setOpen(true);
      pane.style.height = `${pane.scrollHeight}px`;
      const onEnd = () => {
        pane.style.height = 'auto';
        pane.removeEventListener('transitionend', onEnd);
      };
      pane.addEventListener('transitionend', onEnd);
    }
  };

  return (
    <div className={`faq__item${open ? ' open' : ''}`}>
      <button className="faq__q" type="button" onClick={toggle} aria-expanded={open}>
        <span>{item.q}</span>
        <span className="faq__sign"></span>
      </button>
      <div className="faq__a" ref={paneRef}>
        <div className="inner">
          {item.a.split('\n\n').map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FAQ = () => {
  return (
    <>
      <div className="section-head reveal">
        <p className="kicker">
          <span className="num">08</span>&nbsp;— Questions
        </p>
        <h2 className="title">
          On répond
          <br />
          <em>à tout.</em>
        </h2>
      </div>
      <div className="faq__grid">
        <p className="lede reveal" style={{ fontStyle: 'italic' }}>
          Une question qui n'est pas ici&nbsp;? Écrivez-nous, on est là.
        </p>
        <div className="faq__list reveal d1">
          {faq.map((item) => (
            <FAQRow item={item} key={item.q} />
          ))}
        </div>
      </div>
    </>
  );
};
