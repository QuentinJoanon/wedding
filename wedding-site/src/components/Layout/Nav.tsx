import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#lieu', label: 'Le Lieu' },
  { href: '#programme', label: 'Le Déroulé' },
  { href: '#sejour', label: 'Hébergements' },
  { href: '#cadeaux', label: 'Liste de mariage' },
  { href: '#infos', label: 'Infos pratiques' },
];

/** Au-delà de cette largeur, les liens sont affichés en ligne : pas de menu. */
const MOBILE_MAX = 860;

export const Nav = () => {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menu ouvert : on fige le défilement, on ferme sur Échap et si l'on repasse
  // en affichage large (rotation de l'écran, redimensionnement).
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > MOBILE_MAX) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <nav
      className={`nav${solid ? ' nav--solid' : ''}${open ? ' nav--open' : ''}`}
      id="nav"
    >
      <a className="nav__mark" href="#top" onClick={() => setOpen(false)}>
        Q <span className="amp">&amp;</span> É
      </a>
      <div className="nav__links" id="nav-links">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a href="#rsvp" className="nav__cta" onClick={() => setOpen(false)}>
          RSVP
        </a>
      </div>
      <button
        className="nav__burger"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        aria-controls="nav-links"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};
