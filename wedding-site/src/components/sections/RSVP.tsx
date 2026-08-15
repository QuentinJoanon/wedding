import { useState } from 'react';
import weddingData from '../../data/wedding-data.json';
import { submitRsvp } from '../../services/googleSheets';

const { couple } = weddingData;

interface RsvpForm {
  firstName: string;
  lastName: string;
  email: string;
  attending: boolean;
  nextDay: boolean;
  adults: string;
  children: string;
  dietary: string;
  message: string;
}

const INITIAL: RsvpForm = {
  firstName: '',
  lastName: '',
  email: '',
  attending: true,
  nextDay: true,
  adults: '2',
  children: '0',
  dietary: '',
  message: '',
};

interface StepperProps {
  id: string;
  label: string;
  value: string;
  min?: number;
  onChange: (value: string) => void;
}

const Stepper = ({ id, label, value, min = 0, onChange }: StepperProps) => {
  const num = Number(value) || 0;
  const set = (next: number) => onChange(String(Math.max(min, next)));

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="stepper">
        <button
          type="button"
          className="stepper__btn"
          aria-label={`Retirer — ${label}`}
          disabled={num <= min}
          onClick={() => set(num - 1)}
        >
          −
        </button>
        <input
          id={id}
          className="stepper__val"
          type="number"
          inputMode="numeric"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="stepper__btn"
          aria-label={`Ajouter — ${label}`}
          onClick={() => set(num + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export const RSVP = () => {
  const [form, setForm] = useState<RsvpForm>(INITIAL);
  const [status, setStatus] = useState<Status>('idle');

  const set = <K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const ok = await submitRsvp(form);
    setStatus(ok ? 'sent' : 'error');
  };

  return (
    <section className="section rsvp" id="rsvp">
      <div className="wrap rsvp__grid">
        <div className="rsvp__intro">
          <p className="kicker no-rule reveal">
            <span className="num">02</span>&nbsp;— Votre présence
          </p>
          <h2 className="title reveal d1">
            Serez-vous
            <br />
            <em>des nôtres&nbsp;?</em>
          </h2>
          <p className="reveal d1">
            Remplissez ce petit formulaire pour nous aider à tout préparer. N'oubliez pas de
            préciser vos régimes ou allergies, on s'occupe du reste.
          </p>
          <p className="deadline reveal d2">
            Merci de nous confirmer votre venue avant le {couple.rsvpDeadline}.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rsvp__done reveal d1" role="status">
            <h3>Merci&nbsp;!</h3>
            <p>
              Votre réponse est bien arrivée. Nous revenons vers vous avec les derniers
              détails à l'approche du jour J.
            </p>
          </div>
        ) : (
        <form className="form reveal d1" onSubmit={handleSubmit}>
          <div className="field--row">
            <div className="field">
              <label htmlFor="rsvp-firstName">Prénom</label>
              <input
                id="rsvp-firstName"
                type="text"
                placeholder="Votre prénom"
                required
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rsvp-lastName">Nom</label>
              <input
                id="rsvp-lastName"
                type="text"
                placeholder="Votre nom"
                required
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="rsvp-email">Email</label>
            <input
              id="rsvp-email"
              type="email"
              placeholder="vous@email.com"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div className="field">
            <label>Serez-vous présent·e&nbsp;?</label>
            <div className="choice">
              <button
                type="button"
                aria-pressed={form.attending}
                onClick={() => set('attending', true)}
              >
                Avec joie
              </button>
              <button
                type="button"
                aria-pressed={!form.attending}
                onClick={() => set('attending', false)}
              >
                Hélas, non
              </button>
            </div>
          </div>

          <div className="field">
            <label>Serez-vous présent·e le lendemain&nbsp;?</label>
            <div className="choice">
              <button
                type="button"
                aria-pressed={form.nextDay}
                onClick={() => set('nextDay', true)}
              >
                J'en serai avec plaisir
              </button>
              <button
                type="button"
                aria-pressed={!form.nextDay}
                onClick={() => set('nextDay', false)}
              >
                Repos bien mérité
              </button>
            </div>
          </div>

          <div className="field--row">
            <Stepper
              id="rsvp-adults"
              label="Nombre d'adultes"
              value={form.adults}
              onChange={(v) => set('adults', v)}
            />
            <Stepper
              id="rsvp-children"
              label="Nombre d'enfants"
              value={form.children}
              onChange={(v) => set('children', v)}
            />
          </div>

          <div className="field">
            <label htmlFor="rsvp-dietary">Régimes particuliers &amp; allergies</label>
            <input
              id="rsvp-dietary"
              type="text"
              placeholder="Végétarien, sans gluten, allergies…"
              value={form.dietary}
              onChange={(e) => set('dietary', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="rsvp-message">Un petit mot pour nous&nbsp;?</label>
            <textarea
              id="rsvp-message"
              rows={2}
              placeholder="Votre message, une chanson en tête… (facultatif)"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
            />
          </div>

          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi…' : 'Envoyer ma réponse'}{' '}
            <span className="arr">→</span>
          </button>

          {status === 'error' && (
            <p className="form__status form__status--error" role="alert">
              L'envoi n'a pas abouti. Réessayez dans un instant, ou prévenez-nous
              directement — nos numéros sont en bas de page.
            </p>
          )}
        </form>
        )}
      </div>
    </section>
  );
};
