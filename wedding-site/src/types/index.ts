// Types pour le site de mariage — alignés sur le contenu réel (wedding-data.json)

export interface Couple {
  groom: string;
  bride: string;
  date: string;
  dateShort: string;
  venue: string;
  venueWebsite: string;
  location: string;
  rsvpDeadline: string;
}

export interface Contact {
  role: string;
  name: string;
  phone: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  desc: string;
  /** Pictogramme optionnel affiché à côté du titre (ex. « no-phone »). */
  icon?: string;
  /** Info-bulle associée au pictogramme. */
  tip?: string;
}

export interface ScheduleDay {
  day: string;
  date: string;
  items: ScheduleItem[];
}

export type AccommodationType = 'hotel' | 'gite' | 'chambre_hote';

export interface Accommodation {
  name: string;
  type: AccommodationType;
  capacity: string;
  town: string;
  dist: string;
  tags: string[];
  website?: string;
  phone?: string;
}

export interface KidsFact {
  k: string;
  v: string;
}

export interface OnSiteCamping {
  title: string;
  desc: string;
  facts: KidsFact[];
}

export interface Gift {
  title: string;
  desc: string;
  cta: string;
  link: string;
}

export interface Honeymoon {
  /** Valeur exacte de la colonne « Thème » qui bascule dans cette section. */
  theme: string;
  kicker: string;
  title: string;
  text: string;
}

export interface DressCodeColumn {
  title: string;
  swatches: string[];
  text: string;
}

export interface DressCode {
  columns: DressCodeColumn[];
  note: string;
}

export interface FAQItem {
  q: string;
  /** Les paragraphes sont séparés par un double saut de ligne. */
  a: string;
}

export interface WeddingData {
  couple: Couple;
  contacts: Contact[];
  schedule: ScheduleDay[];
  accommodations: Accommodation[];
  onSiteCamping: OnSiteCamping;
  kidsFacts: KidsFact[];
  kidsTips: string[];
  gifts: Gift[];
  honeymoon: Honeymoon;
  dressCode: DressCode;
  faq: FAQItem[];
}
