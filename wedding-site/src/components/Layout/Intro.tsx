import { useEffect, useState } from 'react';

const STORAGE_KEY = 'qe-intro';

/**
 * Rideau d'intro plein écran (ardoise satiné), affiché au 1er chargement.
 * Disparaît après 2900 ms ou au clic ; mémorisé via sessionStorage pour ne
 * pas réapparaître pendant la session.
 */
export const Intro = () => {
  // Si déjà vue dans la session, on ne joue ni l'affichage ni la transition.
  const [seen] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [done, setDone] = useState(seen);

  useEffect(() => {
    if (seen) return;

    const dismiss = () => {
      setDone(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* sessionStorage indisponible — sans incidence */
      }
    };

    const timer = window.setTimeout(dismiss, 2900);
    window.addEventListener('click', dismiss);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('click', dismiss);
    };
  }, [seen]);

  return (
    <div
      className={`intro${done ? ' done' : ''}`}
      id="intro"
      aria-hidden="true"
      style={seen ? { transition: 'none' } : undefined}
    >
      <p className="eb">Nous nous marions</p>
      <h1 className="nm" aria-label="Quentin et Élisa">
        <span style={{ animationDelay: '.35s' }}>Quentin</span>
        <br />
        <span className="amp" style={{ animationDelay: '.6s' }}>
          &amp;
        </span>
        <br />
        <span style={{ animationDelay: '.8s' }}>Élisa</span>
      </h1>
      <div className="hairline"></div>
      <p className="dt">19 juin 2027 · Domaine de Mont</p>
    </div>
  );
};
