import { useState, useEffect } from 'react';
import { fetchGifts, reserveGift } from '../../services/googleSheets';
import type { Gift } from '../../services/googleSheets';

export const GiftList = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [reserveName, setReserveName] = useState('');
  const [reserving, setReserving] = useState(false);

  const loadGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGifts();
      setGifts(data);
    } catch {
      setError('Impossible de charger la liste de mariage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const handleReserveConfirm = async () => {
    if (!selectedGift || !reserveName.trim()) return;
    setReserving(true);
    const success = await reserveGift(selectedGift.id - 1, reserveName.trim());
    if (success) {
      await loadGifts();
    }
    setReserving(false);
    setSelectedGift(null);
    setReserveName('');
  };

  return (
    <section className="section" id="cadeaux">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="kicker">
            <span className="num">06</span>&nbsp;— La Liste
          </p>
          <h2 className="title">
            Votre présence
            <br />
            est <em>déjà un cadeau.</em>
          </h2>
          <p className="lede">
            Mais si le cœur vous en dit, voici quelques idées pour nous gâter.
          </p>
        </div>

        {loading ? (
          <p className="gifts__status reveal">Chargement de la liste…</p>
        ) : error || gifts.length === 0 ? (
          <p className="gifts__status reveal">
            {error || 'La liste de mariage sera bientôt disponible.'}
          </p>
        ) : (
          <div className="gifts__grid">
            {gifts.map((gift, i) => {
              const num = String(i + 1).padStart(2, '0');
              const isReserved = !!gift.reservePar;
              return (
                <article className={`gift reveal d${i % 3}`} key={gift.id}>
                  <span className="gift__num">{gift.theme || num}</span>
                  <h3 className="gift__title">{gift.nom}</h3>
                  {gift.description && <p className="gift__desc">{gift.description}</p>}
                  {gift.prix && <p className="gift__price">{gift.prix}</p>}

                  <div className="gift__actions">
                    {gift.lien && (
                      <a className="card__link gift__cta" href={gift.lien} target="_blank" rel="noreferrer">
                        Voir le produit <span>→</span>
                      </a>
                    )}
                    {isReserved ? (
                      <span className="gift__reserved">✓ Déjà offert</span>
                    ) : (
                      <button
                        type="button"
                        className="gift__reserve"
                        onClick={() => {
                          setSelectedGift(gift);
                          setReserveName('');
                        }}
                      >
                        Je participe
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedGift && (
        <div
          className="gift-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => !reserving && setSelectedGift(null)}
        >
          <div className="gift-modal__panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="gift-modal__title">
              Participer à <em>{selectedGift.nom}</em>
            </h3>
            <p className="gift-modal__text">
              Indiquez votre nom pour que nous sachions qui participe. Il ne sera
              affiché nulle part sur le site.
            </p>
            <div className="field">
              <label htmlFor="reserve-name">Votre nom</label>
              <input
                id="reserve-name"
                type="text"
                placeholder="Prénom et nom"
                value={reserveName}
                onChange={(e) => setReserveName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="gift-modal__actions">
              <button
                type="button"
                className="gift__reserve"
                onClick={() => setSelectedGift(null)}
                disabled={reserving}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleReserveConfirm}
                disabled={!reserveName.trim() || reserving}
              >
                {reserving ? 'Envoi…' : 'Confirmer'} <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
