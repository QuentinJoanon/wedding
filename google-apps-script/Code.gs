/**
 * Site de mariage — point d'entrée unique du classeur.
 *
 * Remplace intégralement le script actuel. Trois actions :
 *   - « participate »  : liste de mariage, quelqu'un offre ou participe.
 *   - « rsvp »         : le formulaire du site enregistre une réponse d'invité.
 *   - « signaletique » : le générateur des coulisses enregistre une maquette.
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
  'ID envoi',
];

/**
 * Colonne K : l'identifiant tiré par le navigateur au moment de l'envoi.
 * Il est stable d'un réessai à l'autre, ce qui permet de reconnaître un
 * deuxième envoi de la même réponse au lieu d'ajouter une ligne de plus.
 */
var RSVP_ID_COL = 11;

/** Onglet des maquettes du générateur de signalétique, créé au premier envoi. */
var SIGN_SHEET = 'Signalétique';
var SIGN_HEADERS = ['ID', 'Nom', 'Format', 'Mise à jour', 'Réglages'];

/* --------------------------------------------------------------- Entrée */

function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data) return fail('Requête vide');

    if (data.action === 'participate') return withLock(function () {
      return handleParticipate(data);
    });
    if (data.action === 'rsvp') return withLock(function () {
      return handleRsvp(data);
    });
    if (data.action === 'signaletique') return withLock(function () {
      return handleSignaletique(data);
    });

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
  ensureRsvpIdHeader(sheet);

  var attending = data.attending === true || data.attending === 'true';
  var nextDay = data.nextDay === true || data.nextDay === 'true';

  var values = [
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
  ];

  // L'invité peut renvoyer la même réponse : son navigateur n'a pas toujours
  // pu lire l'accusé de réception, alors que la ligne, elle, était écrite.
  // On réécrit la ligne existante plutôt que d'en empiler une seconde.
  var id = String(data.submissionId || '');
  var existing = id ? findRsvpRow(sheet, id) : 0;

  if (existing) {
    sheet.getRange(existing, 1, 1, values.length).setValues([values]);
    return out({ ok: true, success: true, duplicate: true });
  }

  sheet.appendRow(values.concat([id]));
  return out({ ok: true, success: true });
}

/** L'onglet existait avant la colonne K : on l'ajoute au premier passage. */
function ensureRsvpIdHeader(sheet) {
  var cell = sheet.getRange(1, RSVP_ID_COL);
  if (!String(cell.getValue()).trim()) {
    cell.setValue('ID envoi').setFontWeight('bold');
  }
}

/** Numéro de la ligne portant cet identifiant, 0 si la réponse est nouvelle. */
function findRsvpRow(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;

  var ids = sheet.getRange(2, RSVP_ID_COL, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return i + 2;
  }
  return 0;
}

/* --------------------------------------------------------- Signalétique */

/**
 * Une ligne par maquette, repérée par son ID. On n'y range que les réglages
 * (JSON) : le dessin se régénère à l'identique à partir d'eux.
 *   op « save »   : crée ou réécrit la ligne.
 *   op « delete » : retire la ligne.
 */
function handleSignaletique(data) {
  var book = SpreadsheetApp.openById(data.sheetId);
  var sheet = ensureSheet(book, SIGN_SHEET, SIGN_HEADERS);
  var id = String(data.id || '');
  if (!id) return fail('ID manquant');

  var row = findRowById(sheet, 1, id);

  if (data.op === 'delete') {
    if (row) sheet.deleteRow(row);
    return out({ ok: true });
  }

  var values = [id, data.nom || 'Sans titre', data.format || '', new Date(), String(data.reglages || '')];
  if (row) sheet.getRange(row, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
  return out({ ok: true });
}

/** Numéro de la ligne dont la colonne `col` vaut `id`, 0 sinon. */
function findRowById(sheet, col, id) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var ids = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return i + 2;
  }
  return 0;
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
