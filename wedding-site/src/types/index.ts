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

export interface Gift {
  title: string;
  desc: string;
  cta: string;
  link: string;
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
  cat: string;
  q: string;
  a: string;
}

export interface WeddingData {
  couple: Couple;
  contacts: Contact[];
  schedule: ScheduleDay[];
  accommodations: Accommodation[];
  kidsFacts: KidsFact[];
  kidsTips: string[];
  gifts: Gift[];
  dressCode: DressCode;
  faq: FAQItem[];
}
