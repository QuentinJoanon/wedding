/**
 * Site de mariage — point d'entrée unique du classeur.
 *
 * Remplace intégralement le script actuel. Deux actions :
 *   - « reserve » : la liste de mariage marque un cadeau comme pris.
 *   - « rsvp »    : le formulaire du site enregistre une réponse d'invité.
 *
 * Déploiement : Déployer → Gérer les déploiements → modifier le déploiement
 * existant → Nouvelle version. L'URL /exec ne change pas.
 * Accès « Tout le monde », exécution « En mon nom ».
 */

/** Onglet qui reçoit les réponses au formulaire. Créé au premier envoi. */
var RSVP_HEADERS = [
  'Horodatage',
  'Prénom',
  'Nom',
  'Email',
  'Présent',
  'Lendemain',
  'Adultes',
  'Enfants',
  'Régimes & allergies',
  'Message',
];

/**
 * Colonne « ReservePar » si le site ne la précise pas.
 * L'ajout de la colonne « Thème » en A l'a décalée de F à G : le site envoie
 * désormais la colonne, ce repli ne sert qu'aux anciens appels.
 */
var RESERVE_COLUMN_FALLBACK = 7;

function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data) return fail('Requête vide');

    if (data.action === 'reserve') return handleReserve(data);
    if (data.action === 'rsvp') return handleRsvp(data);

    return fail('Action inconnue');
  } catch (err) {
    return fail(err.toString());
  }
}

/**
 * Le formulaire RSVP envoie du JSON en text/plain, la liste de mariage un
 * formulaire classique : on accepte les deux.
 */
function parseBody(e) {
  if (!e) return null;
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // pas du JSON : on retombe sur les paramètres de formulaire
    }
  }
  return e.parameter && e.parameter.action ? e.parameter : null;
}

function handleReserve(data) {
  var sheet = SpreadsheetApp.openById(data.sheetId).getSheetByName(data.sheetName);
  if (!sheet) return fail('Onglet introuvable : ' + data.sheetName);

  var row = parseInt(data.row, 10);
  var col = parseInt(data.col, 10) || RESERVE_COLUMN_FALLBACK;

  var cell = sheet.getRange(row, col);
  if (cell.getValue()) {
    return out({ success: false, ok: false, error: 'Déjà réservé' });
  }

  cell.setValue(data.name);
  return out({ success: true, ok: true });
}

function handleRsvp(data) {
  var book = SpreadsheetApp.openById(data.sheetId);
  var sheet = book.getSheetByName(data.sheetName);

  if (!sheet) {
    sheet = book.insertSheet(data.sheetName);
    sheet.appendRow(RSVP_HEADERS);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var attending = data.attending === true || data.attending === 'true';
  var nextDay = data.nextDay === true || data.nextDay === 'true';

  sheet.appendRow([
    new Date(),
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    attending ? 'Oui' : 'Non',
    attending && nextDay ? 'Oui' : 'Non',
    attending ? Number(data.adults) || 0 : 0,
    attending ? Number(data.children) || 0 : 0,
    data.dietary || '',
    data.message || '',
  ]);

  return out({ success: true, ok: true });
}

/** `ok` pour le RSVP, `success` pour la liste de mariage : les deux clés. */
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function fail(message) {
  return out({ success: false, ok: false, error: message });
}
