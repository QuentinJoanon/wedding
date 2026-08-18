# Coulisses — pages d'organisation privées

Espace privé pour nos outils d'organisation, dans le style du site.
Adresse en ligne : **`https://<le-site>/coulisses-4f2a91/`**

- `/coulisses-4f2a91/` — sommaire, une carte par outil
- `/coulisses-4f2a91/_modele.html` — le gabarit qui montre toutes les briques disponibles
- `/coulisses-4f2a91/orga.css` — la feuille de style (reprise du design system du site)
- `/coulisses-4f2a91/orga.js` — le branchement Google Sheets

Les fichiers vivent dans `wedding-site/public/coulisses-4f2a91/`. Vite copie ce dossier
tel quel dans le build : ce sont des pages HTML statiques, indépendantes de l'application React.
Pas de compilation, pas de dépendance — on ouvre le fichier, on écrit du HTML, ça marche.

---

## Le circuit

1. Élisa fait sa page avec Gemini, en lui donnant le prompt ci-dessous.
2. Elle envoie le HTML obtenu.
3. Je le dépose dans `wedding-site/public/coulisses-4f2a91/<nom-de-la-page>.html`,
   je branche les données sur le Google Sheet, j'ajoute une carte dans le sommaire.
4. `git push` → en ligne.

---

## Brancher une page sur un Google Sheet

Deux conditions côté Google :

- Le classeur doit être partagé **« Tout utilisateur disposant du lien » → Lecteur**.
  Sans ça la page affiche une erreur (Google renvoie sa page de connexion).
- La **première ligne** de l'onglet contient les noms de colonnes. Ce sont eux qu'on utilise
  ensuite dans le HTML, à l'orthographe exacte (accents compris).

L'ID du classeur se lit dans son URL, entre `/d/` et `/edit`.

### Le cas simple — un tableau qui se remplit seul

```html
<div class="table-wrap">
  <table class="t"
         data-sheet="1Tg3sYe_AQoFxKrnq-M-Onpg-2Q9ZsaDuwZqiZpJQhQY"
         data-tab="Invités"
         data-columns="Nom, Table, Régime, Statut"
         data-pill="Statut">
  </table>
</div>
<script src="orga.js"></script>
```

| Attribut       | Rôle                                                              |
| -------------- | ----------------------------------------------------------------- |
| `data-sheet`   | ID du classeur (obligatoire)                                       |
| `data-tab`     | Nom exact de l'onglet                                              |
| `data-columns` | Colonnes à afficher, dans l'ordre. Omis → toutes                   |
| `data-pill`    | Colonnes rendues en pastille de couleur selon leur valeur          |
| `data-empty`   | Message quand la feuille est vide                                  |

Les pastilles se colorent toutes seules : vert pour *oui / confirmé / payé / fait / réservé*,
doré pour *en attente / en cours / à faire / devis*, rouge pour *non / annulé / urgent / retard*,
gris sinon.

### Le cas sur mesure — calculs, totaux, regroupements

```html
<script src="orga.js"></script>
<script type="module">
  // type="module" est requis pour pouvoir écrire `await` directement
  const { rows } = await Orga.sheet({ id: 'ID_DU_CLASSEUR', tab: 'Budget' });

  // un compteur
  Orga.text('#total', rows.filter(r => r.Statut === 'Payé').length);

  // un tableau avec colonnes calculées
  Orga.renderTable('#ma-table', rows, {
    columns: [
      { key: 'Poste' },
      { key: 'Montant', class: 'num' },
      { key: 'Statut', format: v => Orga.pill(v) },
    ],
    rowClass: r => r.Statut === 'Payé' ? 'row--done' : '',
  });

  // une recherche en direct
  Orga.filterTable('#recherche', '#ma-table');
</script>
```

Fonctions disponibles : `Orga.sheet()`, `Orga.renderTable()`, `Orga.filterTable()`,
`Orga.text()`, `Orga.pill()`, `Orga.print()`, `Orga.today()`, `Orga.daysLeft()`.

---

## Impression

`orga.css` embarque déjà une feuille d'impression A4 : la barre de navigation et les boutons
disparaissent, les fonds colorés s'aplatissent, les en-têtes de tableau se répètent en haut
de chaque page, et rien n'est coupé au milieu d'une carte ou d'une ligne.

- `class="no-print"` sur un élément → absent du papier
- `class="print-only"` → visible seulement à l'impression
- `class="page-break"` → force un saut de page avant l'élément

---

## Le prompt à donner à Gemini

> Copier tout ce qui suit, puis y coller le contenu du fichier `orga.css` à l'endroit indiqué.

---

Tu m'aides à créer une page HTML d'organisation pour notre mariage. Contraintes strictes :

**Format de sortie** — un seul fichier HTML complet et autonome. Pas de framework, pas de
bibliothèque externe, pas de build. Uniquement du HTML, plus du JavaScript simple si un
comportement interactif est nécessaire.

**Style** — tu dois utiliser EXCLUSIVEMENT les classes de la feuille de style que je te donne
ci-dessous. N'invente pas de nouvelles classes et ne réécris pas les couleurs, les polices ou
les espacements : ce style reprend celui de notre site de mariage et doit rester identique.
Si une mise en page particulière est nécessaire, utilise un `style="..."` minimal sur l'élément
concerné (grille, largeur, marge) — jamais pour changer une couleur ou une police.

Pendant qu'on travaille, place la feuille de style dans une balise `<style>` dans le `<head>`
pour que je puisse prévisualiser la page.

**En-tête de page** — commence toujours le fichier par :

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>[titre de la page] — Coulisses</title>
</head>
```

**Structure attendue** — une barre `.topbar`, puis des `<section class="section">` contenant
chacune un `<div class="wrap">`. Chaque section commence par un `.section-head`
(`.kicker` + `h2.title.display` + `p.lede`).

**Données** — quand un tableau doit être rempli depuis un Google Sheet, ne mets PAS de données
en dur : écris simplement `<table class="t" data-sheet="À_REMPLIR" data-tab="À_REMPLIR"></table>`
et laisse un commentaire indiquant quelles colonnes tu attends. Pour tout le reste, mets des
exemples réalistes que je remplacerai.

**Ton** — français, sobre, élégant. Pas d'emoji. Les titres en français avec un mot en `<em>`
pour l'accent italique doré, comme dans les exemples de la feuille de style.

**Impression** — la page doit rester lisible imprimée en A4. Mets `class="no-print"` sur tout
ce qui n'a pas de sens sur papier (barre de navigation, boutons, champs de recherche).

Voici la feuille de style à utiliser :

```css
[COLLER ICI LE CONTENU DE orga.css]
```

Maintenant, la page dont j'ai besoin : **[décrire ici : plan de table, suivi budget,
liste des prestataires, planning du week-end, checklist…]**

---

## Confidentialité

L'adresse `/coulisses-4f2a91/` n'est liée depuis aucune page et n'est pas indexée
(`noindex` + `X-Robots-Tag` + `robots.txt`). Mais elle reste **publiquement accessible à qui
connaît l'URL** : c'est un rideau, pas une serrure. Ne rien y mettre de réellement sensible
(coordonnées bancaires, mots de passe). Les Google Sheets branchés dessus sont eux aussi
publics en lecture — même règle.

---

## Le formulaire RSVP

Les réponses des invités arrivent dans l'onglet **`RSVP`** du même classeur que la
liste de mariage. L'onglet et ses en-têtes sont créés automatiquement à la première
réponse reçue — il n'y a rien à préparer côté Sheet.

Le site poste sur l'Apps Script déjà utilisé par la liste de cadeaux
(`VITE_GOOGLE_SCRIPT_URL`), avec `action: 'rsvp'`.

**À faire une fois, sinon le formulaire affiche une erreur aux invités :**

1. Ouvrir le projet Apps Script du classeur.
2. Y coller le contenu de `google-apps-script/Code.gs`, **en remplacement
   complet** du script actuel : il gère à la fois le RSVP et la liste de mariage.
3. Déployer → Gérer les déploiements → modifier le déploiement existant →
   **Nouvelle version**. L'URL `/exec` ne change pas, rien à modifier côté site.

Pour afficher les réponses dans une page des coulisses, c'est le cas simple :
`data-sheet` = l'ID du classeur, `data-tab="RSVP"`.

---

## La liste de mariage

### Les colonnes

L'onglet `Liste de Mariage` se lit ainsi, **dans cet ordre** :

| Col. | En-tête                      | Rempli par                             |
| ---- | ---------------------------- | -------------------------------------- |
| A    | Thème                        | vous — sert d'intitulé sur la carte     |
| B    | Nom                          | vous                                    |
| C    | Description                  | vous                                    |
| D    | Prix                         | vous — facultatif                       |
| E    | Lien                         | vous — produit ou carte cadeau          |
| F    | Image                        | vous — pas encore affichée              |
| G    | ReservePar                   | le script — qui offre le cadeau entier  |
| H    | Je met dans l'urne pour ça   | le script — somme des participations urne |
| I    | Statut                       | le script — `En cours` ou `Offert`      |

⚠️ **Insérer une colonne au milieu casse l'affichage.** Le site lit les colonnes
par leur position (`GIFT_QUERY` dans `googleSheets.ts`, `GIFT_COL` dans
`Code.gs`). Ajoutez plutôt à droite de I, ou prévenez-moi.

Les colonnes G, H et I sont créées avec leur en-tête au premier envoi.

### Ce que voient les invités

Le site ne demande au classeur que les colonnes A à F et I : **les noms et les
montants ne parviennent jamais au navigateur des invités**, même en inspectant
la page. Un cadeau affiche seulement son état — rien, `Participation en cours`,
ou `Déjà offert` (carte grisée, plus de bouton).

### Participer

Deux questions à l'invité :

- **Quoi** — il offre le cadeau en entier, ou il participe à hauteur d'un montant.
  Sans prix dans la colonne D, la participation est libre.
- **Comment** — il met dans l'urne le jour J, ou il s'en occupe lui-même
  (typiquement les cartes cadeau Décathlon, CEWE, GetYourGuide).

Chaque participation est journalisée dans l'onglet **`Participations`** :
horodatage, cadeau, nom, email, type, montant, moyen. C'est là que vit le détail —
la colonne `ReservePar` ne retient que celui qui offre un cadeau entier.

Le script pose un verrou le temps d'écrire : deux invités qui cliquent en même
temps ne peuvent pas offrir le même cadeau tous les deux.
