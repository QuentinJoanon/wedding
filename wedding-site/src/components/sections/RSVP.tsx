import { useState } from 'react';
import weddingData from '../../data/wedding-data.json';

const { couple } = weddingData;

interface RsvpForm {
  firstName: string;
  lastName: string;
  email: string;
  attending: boolean;
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

export const RSVP = () => {
  const [form, setForm] = useState<RsvpForm>(INITIAL);

  const set = <K extends keyof RsvpForm>(key: K, value: RsvpForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO (stub) : brancher la soumission réelle ici (form contient toutes les
    // valeurs contrôlées). Aucun envoi n'est effectué pour l'instant.
    console.log('RSVP soumis (stub) :', form);
  };

  return (
    <section className="section rsvp" id="rsvp">
      <div className="wrap rsvp__grid">
        <div className="rsvp__intro">
          <p className="kicker no-rule reveal">
            <span className="num">02</span>&nbsp;— Réponse
          </p>
          <h2 className="title reveal d1">
            Serez-vous
            <br />
            <em>des nôtres&nbsp;?</em>
          </h2>
          <p className="reveal d1">
            Un seul formulaire, et tout est dit. Pensez à nous signaler vos allergies — le traiteur
            s'occupe du reste.
          </p>
          <p className="deadline reveal d2">Merci de répondre avant le {couple.rsvpDeadline}</p>
        </div>

        <form className="form reveal d1" onSubmit={handleSubmit}>
          <div className="field--row">
            <div className="field">
              <label htmlFor="rsvp-firstName">Prénom</label>
              <input
                id="rsvp-firstName"
                type="text"
                placeholder="Votre prénom"
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
            <label htmlFor="rsvp-dietary">Régime / allergies</label>
            <input
              id="rsvp-dietary"
              type="text"
              placeholder="Végétarien, sans gluten, allergies…"
              value={form.dietary}
              onChange={(e) => set('dietary', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="rsvp-message">Un mot pour les mariés</label>
            <textarea
              id="rsvp-message"
              rows={2}
              placeholder="Optionnel"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
            />
          </div>

          <button className="btn" type="submit">
            Envoyer ma réponse <span className="arr">→</span>
          </button>
        </form>
      </div>
    </section>
  );
};
