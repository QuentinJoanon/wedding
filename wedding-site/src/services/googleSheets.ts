const SHEET_ID = '1Tg3sYe_AQoFxKrnq-M-Onpg-2Q9ZsaDuwZqiZpJQhQY';
const SHEET_NAME = 'Liste de Mariage';

/**
 * Colonnes lues dans l'onglet « Liste de Mariage », en notation Sheets.
 * On sélectionne explicitement : la colonne G (qui a offert quoi) et la
 * colonne H (montants) ne doivent jamais parvenir au navigateur des invités.
 */
const GIFT_QUERY = 'select A, B, C, D, E, F, I';

/** Index des colonnes dans le résultat, dans l'ordre de GIFT_QUERY. */
const COL = {
  theme: 0,
  nom: 1,
  description: 2,
  prix: 3,
  lien: 4,
  image: 5,
  statut: 6,
} as const;

/** Valeurs possibles de la colonne « Statut », écrites par le script Google. */
export type GiftStatus = '' | 'En cours' | 'Offert';

export interface Gift {
  id: number;
  theme: string;
  nom: string;
  description: string;
  prix: string;
  lien: string;
  image: string;
  statut: GiftStatus;
}

export const fetchGifts = async (): Promise<Gift[]> => {
  try {
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json` +
      `&sheet=${encodeURIComponent(SHEET_NAME)}&tq=${encodeURIComponent(GIFT_QUERY)}`;
    const response = await fetch(url);
    const text = await response.text();

    // Google renvoie du JSONP, on extrait le JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonString);

    if (!data.table || !data.table.rows) {
      return [];
    }

    // Ignorer la première ligne (en-têtes)
    const rows = data.table.rows.slice(1);

    return rows
      .map((row: { c: ({ v: string | null } | null)[] }, index: number) => {
        const cells = row.c || [];
        return {
          id: index + 1,
          theme: cells[COL.theme]?.v || '',
          nom: cells[COL.nom]?.v || '',
          description: cells[COL.description]?.v || '',
          prix: cells[COL.prix]?.v || '',
          lien: cells[COL.lien]?.v || '',
          image: cells[COL.image]?.v || '',
          statut: (cells[COL.statut]?.v || '') as GiftStatus,
        };
      })
      .filter((gift: Gift) => gift.nom); // Filtrer les lignes vides
  } catch (error) {
    console.error('Erreur lors de la récupération des cadeaux:', error);
    return [];
  }
};

/* ------------------------------------------------------- PARTICIPATIONS */

/** Ce que la personne prend en charge. */
export type ContributionKind = 'entier' | 'participation';

/** Comment elle règle. */
export type ContributionMethod = 'urne' | 'lien';

export interface ContributionPayload {
  /** Rang du cadeau dans la liste (Gift.id), converti en ligne côté script. */
  giftId: number;
  giftName: string;
  kind: ContributionKind;
  method: ContributionMethod;
  /** Montant en euros, vide si participation libre sans montant précisé. */
  amount: string;
  name: string;
  email: string;
}

export interface ContributionResult {
  ok: boolean;
  /** Renseigné quand le cadeau vient d'être pris par quelqu'un d'autre. */
  error?: string;
}

/**
 * Enregistre une participation. Comme pour le RSVP, on lit vraiment la réponse
 * du script : c'est le seul moyen de savoir qu'un cadeau a été pris entre
 * l'affichage de la page et l'envoi du formulaire.
 */
export const contributeToGift = async (
  payload: ContributionPayload
): Promise<ContributionResult> => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('VITE_GOOGLE_SCRIPT_URL non configuré');
    return { ok: false };
  }

  const body = JSON.stringify({
    action: 'participate',
    sheetId: SHEET_ID,
    sheetName: SHEET_NAME,
    row: payload.giftId + 1,
    giftName: payload.giftName,
    kind: payload.kind,
    method: payload.method,
    amount: payload.amount,
    name: payload.name,
    email: payload.email,
  });

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    const result = (await response.json()) as ContributionResult;
    return { ok: !!result.ok, error: result.error };
  } catch (error) {
    console.error("Échec de l'enregistrement de la participation :", error);
    return { ok: false };
  }
};

/* ------------------------------------------------------------------ RSVP */

/** Onglet du classeur qui reçoit les réponses des invités. */
const RSVP_SHEET_NAME = 'RSVP';

export interface RsvpPayload {
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

/**
 * Issue d'un envoi de RSVP.
 *
 * « probable » couvre le cas propre aux web apps Apps Script : la requête est
 * bien parvenue au script — qui écrit la ligne avant même de répondre — mais
 * le navigateur n'a pas pu lire l'accusé de réception. Annoncer un échec dans
 * ce cas pousse l'invité à renvoyer sa réponse, et le classeur reçoit un
 * doublon. On ne le dit donc pas raté : c'est écrit, on ne peut pas le
 * confirmer.
 */
export type RsvpOutcome = 'sent' | 'probable' | 'failed';

/**
 * Identifiant d'envoi, stable d'un réessai à l'autre pour une même réponse.
 * Le script s'en sert pour réécrire la ligne au lieu d'en ajouter une autre.
 */
export const newSubmissionId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Les navigateurs sans randomUUID (ou hors contexte sécurisé) doivent aussi
  // bénéficier de la déduplication : une valeur simplement unique suffit.
  return `rsvp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Envoie une réponse au script Google (voir google-apps-script/Code.gs).
 *
 * Le Content-Type text/plain évite la requête préalable CORS, que les web apps
 * Apps Script ne savent pas traiter.
 */
export const submitRsvp = async (
  payload: RsvpPayload,
  submissionId: string
): Promise<RsvpOutcome> => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('VITE_GOOGLE_SCRIPT_URL non configuré');
    return 'failed';
  }

  const body = JSON.stringify({
    action: 'rsvp',
    sheetId: SHEET_ID,
    sheetName: RSVP_SHEET_NAME,
    submissionId,
    ...payload,
  });

  // Apps Script répond par une redirection vers script.googleusercontent.com.
  // Selon le navigateur, le suivi de cette redirection échoue ou ramène autre
  // chose que du JSON — alors que le script, lui, s'est exécuté.
  let response: Response;
  try {
    response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
  } catch (networkError) {
    console.warn('Envoi direct impossible, nouvel essai sans accusé de réception :', networkError);
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      });
      return 'probable';
    } catch (fallbackError) {
      console.error("Échec de l'envoi du RSVP :", fallbackError);
      return 'failed';
    }
  }

  try {
    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!result.ok) {
      // Le script a répondu et a refusé : là, rien n'a été écrit.
      console.error('RSVP refusé par le script :', result.error);
      return 'failed';
    }
    return 'sent';
  } catch (parseError) {
    console.warn('Réponse illisible, la réponse est probablement enregistrée :', parseError);
    return 'probable';
  }
};
