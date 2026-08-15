/**
 * Réception des réponses du formulaire RSVP du site.
 *
 * À coller dans le projet Apps Script déjà utilisé par la liste de mariage
 * (celui dont l'URL /exec est dans VITE_GOOGLE_SCRIPT_URL).
 *
 * Le projet a déjà un doPost pour l'action « reserve ». Deux cas :
 *
 *  - S'il n'y a qu'un seul doPost, ajoutez au tout début de son corps :
 *
 *        var routed = routeRsvp(e);
 *        if (routed) return routed;
 *
 *    puis collez routeRsvp / handleRsvp / jsonOut ci-dessous à la suite.
 *
 *  - Sinon, remplacez le doPost existant par celui-ci et rebranchez votre
 *    logique « reserve » à l'endroit indiqué.
 *
 * Après modification : Déployer → Gérer les déploiements → modifier le
 * déploiement existant → Nouvelle version. L'URL /exec ne change pas.
 * Accès : « Tout le monde », exécution « En mon nom ».
 */

/** En-têtes de l'onglet RSVP, créés automatiquement au premier envoi. */
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
 * Renvoie une réponse si la requête est un RSVP, sinon null pour laisser
 * le doPost existant traiter l'action « reserve ».
 */
function routeRsvp(e) {
  var payload = parseBody(e);
  if (!payload || payload.action !== 'rsvp') return null;

  try {
    handleRsvp(payload);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/** Le site envoie du JSON en text/plain ; l'ancien appel utilise un formulaire. */
function parseBody(e) {
  if (!e) return null;
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // pas du JSON : c'est l'appel « reserve » en x-www-form-urlencoded
    }
  }
  return e.parameter || null;
}

function handleRsvp(payload) {
  var book = SpreadsheetApp.openById(payload.sheetId);
  var sheet = book.getSheetByName(payload.sheetName);

  if (!sheet) {
    sheet = book.insertSheet(payload.sheetName);
    sheet.appendRow(RSVP_HEADERS);
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    payload.firstName || '',
    payload.lastName || '',
    payload.email || '',
    payload.attending ? 'Oui' : 'Non',
    payload.attending && payload.nextDay ? 'Oui' : 'Non',
    payload.attending ? Number(payload.adults) || 0 : 0,
    payload.attending ? Number(payload.children) || 0 : 0,
    payload.dietary || '',
    payload.message || '',
  ]);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
