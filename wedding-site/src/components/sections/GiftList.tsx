import { useState, useEffect } from 'react';
import weddingData from '../../data/wedding-data.json';
import { fetchGifts, contributeToGift } from '../../services/googleSheets';
import type { Gift, ContributionKind, ContributionMethod } from '../../services/googleSheets';

const { honeymoon } = weddingData;

interface FormState {
  kind: ContributionKind;
  method: ContributionMethod;
  amount: string;
  name: string;
  email: string;
}

const emptyForm = (gift: Gift): FormState => ({
  kind: 'entier',
  method: gift.lien ? 'lien' : 'urne',
  amount: gift.prix ? String(gift.prix) : '',
  name: '',
  email: '',
});

/** Le prix n'est pas toujours renseigné : la participation est alors libre. */
const formatPrice = (prix: string) => (prix ? `${prix} €` : '');

interface ModalProps {
  gift: Gift;
  onClose: () => void;
  onDone: () => void;
}

const ContributionModal = ({ gift, onClose, onDone }: ModalProps) => {
  const [form, setForm] = useState<FormState>(() => emptyForm(gift));
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // « Je l'offre en entier » suppose le prix ; une participation repart à vide.
  const setKind = (kind: ContributionKind) =>
    setForm((prev) => ({
      ...prev,
      kind,
      amount: kind === 'entier' && gift.prix ? String(gift.prix) : '',
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError(null);

    const result = await contributeToGift({
      giftId: gift.id,
      giftName: gift.nom,
      kind: form.kind,
      method: form.method,
      amount: form.amount,
      name: form.name.trim(),
      email: form.email.trim(),
    });

    if (result.ok) {
      setStatus('sent');
      onDone();
      return;
    }

    setStatus('error');
    setError(
      result.error === 'Déjà offert'
        ? "Quelqu'un vient d'offrir ce cadeau en entier. Vous pouvez encore participer à un autre."
        : "L'enregistrement n'a pas abouti. Réessayez dans un instant."
    );
  };

  if (status === 'sent') {
    return (
      <div className="gift-modal" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="gift-modal__panel" onClick={(e) => e.stopPropagation()}>
          <h3 className="gift-modal__title">Merci&nbsp;!</h3>
          <p className="gift-modal__text">
            C'est noté.{' '}
            {form.method === 'urne'
              ? "Rien à faire d'ici là : vous glisserez votre participation dans l'urne le jour J."
              : "Il ne vous reste qu'à suivre le lien quand vous le souhaitez."}
          </p>
          {form.method === 'lien' && gift.lien && (
            <a className="card__link" href={gift.lien} target="_blank" rel="noreferrer">
              Ouvrir le lien <span>↗</span>
            </a>
          )}
          <div className="gift-modal__actions">
            <button type="button" className="btn" onClick={onClose}>
              Fermer <span className="arr">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="gift-modal"
      role="dialog"
      aria-modal="true"
      onClick={() => status !== 'sending' && onClose()}
    >
      <form className="gift-modal__panel" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 className="gift-modal__title">
          Participer à <em>{gift.nom}</em>
        </h3>
        {gift.prix && <p className="gift-modal__price">{formatPrice(gift.prix)}</p>}

        <div className="field">
          <label>Que souhaitez-vous faire&nbsp;?</label>
          <div className="choice">
            <button
              type="button"
              aria-pressed={form.kind === 'entier'}
              onClick={() => setKind('entier')}
            >
              Je l'offre en entier
            </button>
            <button
              type="button"
              aria-pressed={form.kind === 'participation'}
              onClick={() => setKind('participation')}
            >
              Je participe
            </button>
          </div>
        </div>

        {form.kind === 'participation' && (
          <div className="field">
            <label htmlFor="gift-amount">Montant {gift.prix ? '' : '(libre)'}</label>
            <input
              id="gift-amount"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder={gift.prix ? `Jusqu'à ${gift.prix} €` : 'Comme il vous plaira'}
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
            />
          </div>
        )}

        <div className="field">
          <label>Comment&nbsp;?</label>
          <div className="choice">
            <button
              type="button"
              aria-pressed={form.method === 'urne'}
              onClick={() => set('method', 'urne')}
            >
              Dans l'urne le jour J
            </button>
            <button
              type="button"
              aria-pressed={form.method === 'lien'}
              onClick={() => set('method', 'lien')}
              disabled={!gift.lien}
            >
              {gift.lien ? "Je m'en occupe" : 'Pas de lien'}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="gift-name">Votre nom</label>
          <input
            id="gift-name"
            type="text"
            placeholder="Prénom et nom"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="gift-email">Email (facultatif)</label>
          <input
            id="gift-email"
            type="email"
            placeholder="vous@email.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <p className="gift-modal__text">
          Votre nom nous sert uniquement à savoir qui remercier — il n'apparaît nulle part sur
          le site.
        </p>

        {error && (
          <p className="form__status form__status--error" role="alert">
            {error}
          </p>
        )}

        <div className="gift-modal__actions">
          <button
            type="button"
            className="gift__reserve"
            onClick={onClose}
            disabled={status === 'sending'}
          >
            Annuler
          </button>
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi…' : 'Confirmer'} <span className="arr">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

interface GridProps {
  gifts: Gift[];
  /** Dans un groupe déjà titré, répéter le thème sur chaque carte n'apporte rien. */
  showTheme?: boolean;
  onPick: (gift: Gift) => void;
}

const GiftGrid = ({ gifts, showTheme = true, onPick }: GridProps) => (
  <div className="gifts__grid">
    {gifts.map((gift, i) => {
      const num = String(i + 1).padStart(2, '0');
      const taken = gift.statut === 'Offert';
      return (
        <article
          className={`gift reveal d${i % 3}${taken ? ' gift--taken' : ''}`}
          key={gift.id}
        >
          <span className="gift__num">{(showTheme && gift.theme) || num}</span>
          <h3 className="gift__title">{gift.nom}</h3>
          {gift.description && <p className="gift__desc">{gift.description}</p>}
          {gift.prix && <p className="gift__price">{formatPrice(gift.prix)}</p>}

          <div className="gift__actions">
            {gift.lien && !taken && (
              <a
                className="card__link gift__cta"
                href={gift.lien}
                target="_blank"
                rel="noreferrer"
              >
                Voir le produit <span>→</span>
              </a>
            )}
            {taken ? (
              <span className="gift__reserved">✓ Déjà offert</span>
            ) : (
              <>
                {gift.statut === 'En cours' && (
                  <span className="gift__ongoing">Participation en cours</span>
                )}
                <button type="button" className="gift__reserve" onClick={() => onPick(gift)}>
                  Je participe
                </button>
              </>
            )}
          </div>
        </article>
      );
    })}
  </div>
);

export const GiftList = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

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

  // Le voyage de noces a son propre chapeau ; le reste garde la grille commune.
  const isHoneymoon = (gift: Gift) =>
    gift.theme.trim().toLowerCase() === honeymoon.theme.trim().toLowerCase();
  const honeymoonGifts = gifts.filter(isHoneymoon);
  const others = gifts.filter((gift) => !isHoneymoon(gift));

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
            Mais si le cœur vous en dit, voici quelques idées. Offrez-en un en entier, ou
            participez à plusieurs&nbsp;: dans l'urne le jour J, ou par vos propres moyens.
          </p>
        </div>

        {loading ? (
          <p className="gifts__status reveal">Chargement de la liste…</p>
        ) : error || gifts.length === 0 ? (
          <p className="gifts__status reveal">
            {error || 'La liste de mariage sera bientôt disponible.'}
          </p>
        ) : (
          <>
            {others.length > 0 && (
              <GiftGrid gifts={others} onPick={setSelectedGift} />
            )}

            {honeymoonGifts.length > 0 && (
              <div className="gifts__group">
                <div className="gifts__group-head reveal">
                  <p className="kicker no-rule">{honeymoon.kicker}</p>
                  <h3 className="gifts__group-title">{honeymoon.title}</h3>
                  <p className="lede">{honeymoon.text}</p>
                </div>
                <GiftGrid gifts={honeymoonGifts} showTheme={false} onPick={setSelectedGift} />
              </div>
            )}
          </>
        )}
      </div>

      {selectedGift && (
        <ContributionModal
          gift={selectedGift}
          onClose={() => setSelectedGift(null)}
          onDone={loadGifts}
        />
      )}
    </section>
  );
};
