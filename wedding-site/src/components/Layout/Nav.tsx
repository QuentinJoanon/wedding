import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#lieu', label: 'Le Lieu' },
  { href: '#programme', label: 'Le Programme' },
  { href: '#sejour', label: 'Le Séjour' },
  { href: '#cadeaux', label: 'La Liste' },
  { href: '#infos', label: 'Infos' },
];

export const Nav = () => {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${solid ? ' nav--solid' : ''}`} id="nav">
      <a className="nav__mark" href="#top">
        Q <span className="amp">&amp;</span> É
      </a>
      <div className="nav__links">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        <a href="#rsvp" className="nav__cta">
          Répondre
        </a>
      </div>
      <button className="nav__burger" aria-label="Menu" type="button">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};
