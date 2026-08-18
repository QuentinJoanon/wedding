/**
 * Site de mariage — point d'entrée unique du classeur.
 *
 * Remplace intégralement le script actuel. Deux actions :
 *   - « participate » : liste de mariage, quelqu'un offre ou participe.
 *   - « rsvp »        : le formulaire du site enregistre une réponse d'invité.
 *
 * Déploiement : Déployer → Gérer les déploiements → modifier le déploiement
 * existant → Nouvelle version. L'URL /exec ne change pas.
 * Accès « Tout le monde », exécution « En mon nom ».
 */

/* ------------------------------------------------------------- Colonnes */

/**
 * Onglet « Liste de Mariage », en numérotation Sheets (A = 1).
 * A Thème · B Nom · C Description · D Prix · E Lien · F Image
 * G ReservePar · H Urne · I Statut
 */
var GIFT_COL = {
  nom: 2,
  prix: 4,
  reservePar: 7,
  urne: 8,
  statut: 9,
};

/** En-têtes écrits si les colonnes G/H/I sont encore vierges. */
var GIFT_HEADERS = {
  7: 'ReservePar',
  8: "Je met dans l'urne pour ça",
  9: 'Statut',
};

/** Onglet des participations, créé au premier envoi. */
var CONTRIB_SHEET = 'Participations';
var CONTRIB_HEADERS = [
  'Horodatage',
  'Cadeau',
  'Nom',
  'Email',
  'Type',
  'Montant',
  'Moyen',
];

/** Onglet des réponses au formulaire, créé au premier envoi. */
var RSVP_SHEET_FALLBACK = 'RSVP';
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

/* --------------------------------------------------------------- Entrée */

function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data) return fail('Requête vide');

    if (data.action === 'participate') return withLock(function () {
      return handleParticipate(data);
    });
    if (data.action === 'rsvp') return handleRsvp(data);

    return fail('Action inconnue');
  } catch (err) {
    return fail(err.toString());
  }
}

/**
 * Le site envoie du JSON en text/plain. On accepte aussi les paramètres de
 * formulaire, au cas où un ancien appel traînerait.
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

/**
 * Deux invités peuvent cliquer en même temps : sans verrou, tous deux
 * pourraient offrir le même cadeau en entier.
 */
function withLock(fn) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return fail('Le classeur est occupé, réessayez dans un instant');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------- Participations */

function handleParticipate(data) {
  var book = SpreadsheetApp.openById(data.sheetId);
  var sheet = book.getSheetByName(data.sheetName);
  if (!sheet) return fail('Onglet introuvable : ' + data.sheetName);

  var row = parseInt(data.row, 10);
  if (!row || row < 2) return fail('Ligne invalide');

  ensureGiftHeaders(sheet);

  var statutCell = sheet.getRange(row, GIFT_COL.statut);
  if (String(statutCell.getValue()) === 'Offert') {
    return fail('Déjà offert');
  }

  var name = data.name || 'Anonyme';
  var entier = data.kind === 'entier';
  var amount = Number(String(data.amount).replace(',', '.')) || 0;

  if (entier) {
    // Le prix fait foi quand il est connu : le champ du site peut être vide.
    if (!amount) amount = Number(sheet.getRange(row, GIFT_COL.prix).getValue()) || 0;
    appendName(sheet, row, GIFT_COL.reservePar, name);
    statutCell.setValue('Offert');
  } else {
    // Les participants ne sont pas listés ici : la colonne ReservePar reste
    // « qui offre ce cadeau », le détail vit dans l'onglet Participations.
    if (!String(statutCell.getValue())) statutCell.setValue('En cours');
  }

  if (data.method === 'urne' && amount) {
    var urneCell = sheet.getRange(row, GIFT_COL.urne);
    urneCell.setValue((Number(urneCell.getValue()) || 0) + amount);
  }

  logContribution(book, {
    gift: data.giftName || sheet.getRange(row, GIFT_COL.nom).getValue(),
    name: name,
    email: data.email || '',
    type: entier ? 'Cadeau entier' : 'Participation',
    amount: amount || '',
    method: data.method === 'urne' ? 'Urne' : 'Achat direct / carte cadeau',
  });

  return out({ ok: true, success: true });
}

/** Plusieurs personnes peuvent participer : on accumule les noms. */
function appendName(sheet, row, col, name) {
  var cell = sheet.getRange(row, col);
  var current = String(cell.getValue() || '').trim();
  cell.setValue(current ? current + ', ' + name : name);
}

/** Sans en-têtes, les colonnes G/H/I sont illisibles dans le classeur. */
function ensureGiftHeaders(sheet) {
  for (var col in GIFT_HEADERS) {
    var cell = sheet.getRange(1, Number(col));
    if (!String(cell.getValue()).trim()) {
      cell.setValue(GIFT_HEADERS[col]).setFontWeight('bold');
    }
  }
}

function logContribution(book, entry) {
  var sheet = ensureSheet(book, CONTRIB_SHEET, CONTRIB_HEADERS);
  sheet.appendRow([
    new Date(),
    entry.gift,
    entry.name,
    entry.email,
    entry.type,
    entry.amount,
    entry.method,
  ]);
}

/* ------------------------------------------------------------------ RSVP */

function handleRsvp(data) {
  var book = SpreadsheetApp.openById(data.sheetId);
  var sheet = ensureSheet(book, data.sheetName || RSVP_SHEET_FALLBACK, RSVP_HEADERS);

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

  return out({ ok: true, success: true });
}

/* ------------------------------------------------------------- Communs */

function ensureSheet(book, name, headers) {
  var sheet = book.getSheetByName(name);
  if (sheet) return sheet;

  sheet = book.insertSheet(name);
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

/** `ok` pour le site, `success` conservé pour d'anciens appels. */
function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function fail(message) {
  return out({ ok: false, success: false, error: message });
}
