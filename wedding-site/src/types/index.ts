// Types pour le site de mariage

export interface PracticalInfo {
  venue: {
    name: string;
    address: string;
    website?: string;
  };
  schedule: TimelineEvent[];
  dressCode: {
    men: string;
    women: string;
    children: string;
    note: string;
  };
  emergencyContacts: Contact[];
}

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
  icon?: string;
  day: 'friday' | 'saturday' | 'sunday';
}

export interface Contact {
  name: string;
  phone?: string;
  email?: string;
  role: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'gite' | 'chambre_hote' | 'camping';
  capacity: string;
  distance: string;
  priceRange: string;
  phone?: string;
  website?: string;
  email?: string;
  address: string;
  amenities: string[];
  image?: string;
}

export interface GiftListItem {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'product' | 'experience' | 'contribution';
  reserved: boolean;
  image?: string;
}

export interface FAQItem {
  id: string;
  category: 'logistics' | 'accommodation' | 'gifts' | 'children' | 'other';
  question: string;
  answer: string;
}

export interface ChildcareInfo {
  babySitters: {
    count: number;
    schedule: string;
    ages: string;
    location: string;
  };
  activities: Activity[];
  parentTips: string[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  ageRange: string;
}

export interface RouteInfo {
  from: string;
  distance: string;
  duration: string;
  directions: string;
  transportType: 'car' | 'train' | 'plane';
}

export interface WeddingData {
  practicalInfo: PracticalInfo;
  accommodations: Accommodation[];
  giftList: GiftListItem[];
  faq: FAQItem[];
  childcare: ChildcareInfo;
  routes: RouteInfo[];
}
