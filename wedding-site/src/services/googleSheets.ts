const SHEET_ID = '1Tg3sYe_AQoFxKrnq-M-Onpg-2Q9ZsaDuwZqiZpJQhQY';
const SHEET_NAME = 'Liste de Mariage';

export interface Gift {
  id: number;
  nom: string;
  description: string;
  prix: string;
  lien: string;
  image: string;
  reservePar: string;
}

interface SheetResponse {
  values: string[][];
}

const getSheetUrl = (range: string) => {
  const encodedRange = encodeURIComponent(`${SHEET_NAME}!${range}`);
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
};

export const fetchGifts = async (): Promise<Gift[]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
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

    return rows.map((row: { c: ({ v: string | null } | null)[] }, index: number) => {
      const cells = row.c || [];
      return {
        id: index + 1,
        nom: cells[0]?.v || '',
        description: cells[1]?.v || '',
        prix: cells[2]?.v || '',
        lien: cells[3]?.v || '',
        image: cells[4]?.v || '',
        reservePar: cells[5]?.v || '',
      };
    }).filter((gift: Gift) => gift.nom); // Filtrer les lignes vides
  } catch (error) {
    console.error('Erreur lors de la récupération des cadeaux:', error);
    return [];
  }
};

export const reserveGift = async (rowIndex: number, name: string): Promise<boolean> => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error('VITE_GOOGLE_SCRIPT_URL non configuré');
    return false;
  }

  try {
    const params = new URLSearchParams({
      action: 'reserve',
      sheetId: SHEET_ID,
      sheetName: SHEET_NAME,
      row: String(rowIndex + 2),
      name: name,
    });

    // Utiliser mode no-cors avec application/x-www-form-urlencoded
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Avec no-cors on ne peut pas vérifier le résultat, on assume le succès
    return true;
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    return false;
  }
};
