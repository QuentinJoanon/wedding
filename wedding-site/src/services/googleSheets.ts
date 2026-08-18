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
 * Envoie une réponse au script Google (voir google-apps-script/rsvp.gs).
 *
 * On tente d'abord un envoi dont la réponse est lisible — c'est le seul moyen
 * de distinguer un vrai succès d'une erreur côté script. Le Content-Type
 * text/plain évite la requête préalable CORS, que les web apps Apps Script ne
 * savent pas traiter.
 */
export const submitRsvp = async (payload: RsvpPayload): Promise<boolean> => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('VITE_GOOGLE_SCRIPT_URL non configuré');
    return false;
  }

  const body = JSON.stringify({
    action: 'rsvp',
    sheetId: SHEET_ID,
    sheetName: RSVP_SHEET_NAME,
    ...payload,
  });

  // Un échec du fetch lui-même (réseau, CORS) est le seul cas où l'on rejoue
  // en no-cors : là, l'écriture peut aboutir sans qu'on puisse la lire. Une
  // réponse reçue mais illisible est au contraire une vraie erreur — le script
  // n'a pas encore la branche RSVP, par exemple — et ne doit pas être annoncée
  // à l'invité comme un succès.
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
      return true;
    } catch (fallbackError) {
      console.error("Échec de l'envoi du RSVP :", fallbackError);
      return false;
    }
  }

  try {
    const result = (await response.json()) as { ok?: boolean; error?: string };
    if (!result.ok) {
      console.error('RSVP refusé par le script :', result.error);
      return false;
    }
    return true;
  } catch (parseError) {
    console.error('Réponse inattendue du script :', parseError);
    return false;
  }
};
