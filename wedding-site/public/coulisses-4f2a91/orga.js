/* =========================================================================
   COULISSES — petite librairie « données vivantes »
   Branche une page HTML statique sur un Google Sheet, sans build ni clé API.

   Pré-requis côté Google Sheets, pour CHAQUE classeur utilisé :
     Partager → Accès général → « Tout utilisateur disposant du lien » → Lecteur.
     (Sans ça, la lecture échoue silencieusement : Google renvoie une page de login.)

   Usage minimal :
     <table class="t" data-sheet="ID_DU_CLASSEUR" data-tab="Invités"></table>
     <script src="orga.js"></script>
   Le tableau se remplit tout seul au chargement.

   API programmatique :
     const { headers, rows } = await Orga.sheet({ id, tab });
     Orga.renderTable('#ma-table', rows, { columns: [...] });
     Orga.text('#compteur', rows.filter(r => r.Statut === 'Oui').length);
   ========================================================================= */

const Orga = (() => {
  'use strict';

  /* ------------------------------------------------------------ LECTURE */

  /** Convertit une valeur gviz en quelque chose d'affichable. */
  function cellValue(cell) {
    if (!cell) return '';
    // gviz renvoie les dates sous la forme "Date(2027,5,19)" (mois 0-indexé)
    if (typeof cell.v === 'string' && /^Date\(/.test(cell.v)) {
      const [y, m, d] = cell.v.slice(5, -1).split(',').map(Number);
      return new Date(y, m, d).toLocaleDateString('fr-FR');
    }
    if (cell.v === null || cell.v === undefined) return '';
    // f = valeur formatée telle qu'affichée dans la feuille (garde €, %, etc.)
    if (cell.f !== undefined && cell.f !== null && cell.f !== '') return String(cell.f);
    if (typeof cell.v === 'boolean') return cell.v ? 'Oui' : 'Non';
    return String(cell.v);
  }

  const cache = new Map();

  /**
   * Lit un onglet d'un Google Sheet public.
   * @param {{id: string, tab?: string, range?: string, fresh?: boolean}} opts
   * @returns {Promise<{headers: string[], rows: Object[]}>}
   *   rows = tableau d'objets indexés par nom de colonne (l'en-tête de la feuille).
   */
  async function sheet({ id, tab, range, fresh = false }) {
    const key = `${id}::${tab || ''}::${range || ''}`;
    if (!fresh && cache.has(key)) return cache.get(key);

    let url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1`;
    if (tab) url += `&sheet=${encodeURIComponent(tab)}`;
    if (range) url += `&range=${encodeURIComponent(range)}`;

    const res = await fetch(url, { cache: fresh ? 'reload' : 'default' });
    if (!res.ok) throw new Error(`Google Sheets a répondu ${res.status}. La feuille est-elle partagée en lecture publique ?`);
    const text = await res.text();

    // La réponse est du JSONP : /*O_o*/ google.visualization.Query.setResponse({...});
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1) throw new Error('Réponse illisible. Vérifie l\'ID du classeur et le partage « toute personne avec le lien ».');

    const data = JSON.parse(text.substring(start, end + 1));
    if (data.status === 'error') {
      throw new Error(data.errors?.[0]?.detailed_message?.replace(/<[^>]+>/g, '') || 'Onglet introuvable.');
    }

    const cols = data.table.cols || [];
    const headers = cols.map((c, i) => (c.label || c.id || `Col${i + 1}`).trim());

    const rows = (data.table.rows || [])
      .map((row) => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = cellValue((row.c || [])[i]); });
        return obj;
      })
      // les lignes entièrement vides polluent toujours le bas des feuilles
      .filter((obj) => Object.values(obj).some((v) => v !== ''));

    const result = { headers, rows };
    cache.set(key, result);
    return result;
  }

  /* ------------------------------------------------------------- RENDU */

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const el = (sel) => (typeof sel === 'string' ? document.querySelector(sel) : sel);

  /**
   * Remplit un <table class="t"> à partir de lignes.
   * @param {string|Element} target
   * @param {Object[]} rows
   * @param {{columns?: (string|{key:string,label?:string,class?:string,format?:Function})[],
   *          empty?: string, rowClass?: Function}} opts
   */
  function renderTable(target, rows, opts = {}) {
    const table = el(target);
    if (!table) return;

    const cols = (opts.columns && opts.columns.length
      ? opts.columns
      : Object.keys(rows[0] || {})
    ).map((c) => (typeof c === 'string' ? { key: c } : c));

    if (!rows.length) {
      table.innerHTML = `<tbody><tr><td class="empty">${esc(opts.empty || 'Rien pour l\'instant.')}</td></tr></tbody>`;
      return;
    }

    const head = `<thead><tr>${cols.map((c) => `<th class="${c.class || ''}">${esc(c.label ?? c.key)}</th>`).join('')}</tr></thead>`;
    const body = `<tbody>${rows.map((r) => {
      const cls = opts.rowClass ? opts.rowClass(r) : '';
      const tds = cols.map((c) => {
        const raw = r[c.key] ?? '';
        const html = c.format ? c.format(raw, r) : esc(raw);
        return `<td class="${c.class || ''}">${html}</td>`;
      }).join('');
      return `<tr class="${cls}">${tds}</tr>`;
    }).join('')}</tbody>`;

    table.innerHTML = head + body;
  }

  /** Écrit un texte simple dans un élément (compteurs, totaux…). */
  function text(target, value) {
    const node = el(target);
    if (node) node.textContent = String(value);
  }

  /** Pastille de statut prête à l'emploi : Orga.pill('Confirmé') → <span class="pill pill--ok"> */
  const PILL_MAP = [
    [/^(oui|ok|confirm|payé|paye|fait|réservé|reserve|termin)/i, 'ok'],
    [/^(en cours|attente|relanc|peut.?être|peut.?etre|à faire|a faire|todo|devis)/i, 'warn'],
    [/^(non|annul|refus|problème|probleme|urgent|retard)/i, 'alert'],
  ];
  function pill(value) {
    const v = String(value || '').trim();
    if (!v) return '';
    const hit = PILL_MAP.find(([re]) => re.test(v));
    return `<span class="pill pill--${hit ? hit[1] : 'todo'}">${esc(v)}</span>`;
  }

  /* -------------------------------------------------------- RECHERCHE */

  /**
   * Branche un <input class="search"> sur un tableau : filtre les lignes en direct.
   * @param {string|Element} input
   * @param {string|Element} table
   */
  function filterTable(input, table) {
    const field = el(input);
    const tbl = el(table);
    if (!field || !tbl) return;
    field.addEventListener('input', () => {
      const q = field.value.trim().toLowerCase();
      tbl.querySelectorAll('tbody tr').forEach((tr) => {
        tr.hidden = q !== '' && !tr.textContent.toLowerCase().includes(q);
      });
    });
  }

  /* --------------------------------------------------- AUTO-BRANCHEMENT */

  /**
   * Tout <table data-sheet="..." data-tab="..."> se remplit seul.
   * Options en attributs : data-columns="Nom,Statut" data-pill="Statut"
   */
  async function autoWire() {
    const targets = document.querySelectorAll('[data-sheet]');
    for (const node of targets) {
      const id = node.dataset.sheet;
      const tab = node.dataset.tab || undefined;
      const isTable = node.tagName === 'TABLE';

      if (isTable) node.innerHTML = '<tbody><tr><td class="loading">Chargement</td></tr></tbody>';

      try {
        const { rows } = await sheet({ id, tab });
        if (!isTable) continue;

        const wanted = node.dataset.columns ? node.dataset.columns.split(',').map((s) => s.trim()) : null;
        const pillCols = (node.dataset.pill || '').split(',').map((s) => s.trim()).filter(Boolean);

        const columns = (wanted || Object.keys(rows[0] || {})).map((key) => (
          pillCols.includes(key) ? { key, format: (v) => pill(v) } : { key }
        ));

        renderTable(node, rows, { columns, empty: node.dataset.empty });
        node.dispatchEvent(new CustomEvent('orga:loaded', { detail: { rows }, bubbles: true }));
      } catch (err) {
        console.error('[Orga]', err);
        if (isTable) node.innerHTML = `<tbody><tr><td class="error">${esc(err.message)}</td></tr></tbody>`;
      }
    }
  }

  /* ------------------------------------------------------------ DIVERS */

  /** Bouton d'impression : <button onclick="Orga.print()"> */
  const print = () => window.print();

  /** Date du jour formatée, pour un pied de page imprimé. */
  const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  /** Jours restants avant le mariage (19 juin 2027). */
  function daysLeft(target = '2027-06-19') {
    const diff = new Date(target) - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoWire);
  } else {
    autoWire();
  }

  return { sheet, renderTable, filterTable, text, pill, print, today, daysLeft, esc, autoWire };
})();

window.Orga = Orga;
