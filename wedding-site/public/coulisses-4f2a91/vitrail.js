/* =========================================================================
   VITRAIL — générateur de maquettes de signalétique « effet vitrail »
   Plexiglas + cerne doré + peinture vitrail : tout se dessine en SVG, en mm.

   Principe : chaque trait du dessin sera repassé au cerne. Deux traits trop
   proches se rejoignent et font une tache. Tout le générateur tourne donc
   autour d'une seule règle : jamais deux traits à moins de `ecart + cerne`
   d'axe à axe. Les fleurs se simplifient d'elles-mêmes (moins de pétales,
   moins de couronnes) quand elles sont trop petites pour la respecter.

   Usage :
     const { svg, stats } = Vitrail.render(reglages, { mode, measure });
   mode    : 'vitrail' (aperçu couleur) · 'cerne' (traits noirs à l'épaisseur
             réelle) · 'gabarit' (traits fins, à glisser sous le plexi)
   measure : (texte, style, tailleMm) => largeur en mm — fourni par la page,
             qui seule sait mesurer une police.
   ========================================================================= */

const Vitrail = (() => {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n) => String(Math.round(n * 10) / 10);
  const pt = (p) => `${fmt(p[0])},${fmt(p[1])}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ------------------------------------------------------------ HASARD */

  /** Générateur pseudo-aléatoire à graine : même graine, même dessin. */
  function makeRng(seed) {
    let a = (seed >>> 0) || 1;
    const next = () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.range = (lo, hi) => lo + (hi - lo) * next();
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.sign = () => (next() < 0.5 ? -1 : 1);
    next.seed = () => Math.floor(next() * 2147483647);
    return next;
  }

  /* --------------------------------------------------------- COULEURS */

  const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgb2hex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(x.map((v, i) => v + (y[i] - v) * t)); };
  /** Les couronnes intérieures d'une fleur, un ton plus profond. */
  const deeper = (c, k) => mix(c, '#3a1c1c', clamp(0.1 * k, 0, 0.5));
  const paler = (c, t) => mix(c, '#ffffff', t);

  const CERNES = { or: '#b8913f', cuivre: '#a3653a', argent: '#9a9fa5', noir: '#2a2622' };
  const FONDS = { clair: '#fbfaf6', givre: '#e8ebe9', transparent: 'none' };

  const PALETTES = {
    jardin:    { nom: 'Jardin (couleurs du site)', fleurs: ['#e3a878', '#9fbace', '#e0b3ae', '#efe1ca'], feuille: '#a3b08f', tuiles: ['#d8bd86', '#a9b598'] },
    bordeaux:  { nom: 'Bordeaux & blush',          fleurs: ['#7a2430', '#b5525a', '#f0c6bc', '#a8c1d6'], feuille: '#8d9f68', tuiles: ['#efe6dc', '#c9d3dc'] },
    hortensia: { nom: 'Hortensia bleu',            fleurs: ['#9dbbe0', '#f2e8d8', '#c8d7ea', '#e9b48a'], feuille: '#93a046', tuiles: ['#c98a5a', '#93a046'] },
    champetre: { nom: 'Champêtre',                 fleurs: ['#e8b23e', '#d9775a', '#9b8bc4', '#f3ecdf'], feuille: '#7f9a55', tuiles: ['#e8b23e', '#7f9a55'] },
  };

  /* -------------------------------------------------------- GÉOMÉTRIE */

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const unit0 = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const polar = (r, a, c = [0, 0]) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  const angDiff = (a, b) => { const d = (((a - b) % TAU) + TAU) % TAU; return d > Math.PI ? TAU - d : d; };

  function segDist(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    const t = l2 ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2, 0, 1) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  function polyDist(poly, p) {
    let m = Infinity;
    for (let i = 0, n = poly.length; i < n; i++) { const d = segDist(p, poly[i], poly[(i + 1) % n]); if (d < m) m = d; }
    return m;
  }
  function inPoly(poly, p) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  const polyArea = (poly) => poly.reduce((s, a, i) => { const b = poly[(i + 1) % poly.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
  function bbox(poly) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  }
  function intersect(p1, d1, p2, d2) {
    const cr = d1[0] * d2[1] - d1[1] * d2[0];
    if (Math.abs(cr) < 1e-9) return null;
    const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / cr;
    return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
  }
  /** Rétrécit un polygone convexe de d (d < 0 l'agrandit). Garde le nombre de sommets. */
  function inset(poly, d) {
    const n = poly.length, s = Math.sign(polyArea(poly)) || 1;
    const lines = poly.map((a, i) => {
      const b = poly[(i + 1) % n], L = dist(a, b) || 1;
      const dir = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      return { p: [a[0] - dir[1] * s * d, a[1] + dir[0] * s * d], dir };
    });
    return poly.map((_, i) => {
      const l1 = lines[(i - 1 + n) % n], l2 = lines[i];
      return intersect(l1.p, l1.dir, l2.p, l2.dir) || l2.p;
    });
  }
  /** Premier point où le rayon o + t·dir sort (ou entre dans) le polygone. */
  function rayHit(poly, o, dir) {
    let best = Infinity;
    for (let i = 0, n = poly.length; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      const e = [b[0] - a[0], b[1] - a[1]];
      const cr = dir[0] * e[1] - dir[1] * e[0];
      if (Math.abs(cr) < 1e-12) continue;
      const t = ((a[0] - o[0]) * e[1] - (a[1] - o[1]) * e[0]) / cr;
      const u = ((a[0] - o[0]) * dir[1] - (a[1] - o[1]) * dir[0]) / cr;
      if (t > 1e-6 && u >= 0 && u <= 1 && t < best) best = t;
    }
    return best === Infinity ? null : [o[0] + dir[0] * best, o[1] + dir[1] * best];
  }
  /** Largeur d'un polygone à la hauteur y. */
  function chordAt(poly, y) {
    const xs = [];
    for (let i = 0, n = poly.length; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    return xs.length < 2 ? 0 : Math.max(...xs) - Math.min(...xs);
  }
  const ellipsePts = (cx, cy, rx, ry, n = 72, a0 = 0, a1 = TAU) => {
    const out = [];
    for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / (a1 === TAU ? n : n - 1); out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return out;
  };
  function quadPts(a, c, b, step = 1) {
    const n = Math.max(4, Math.ceil((dist(a, c) + dist(c, b)) / step));
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    return out;
  }

  /**
   * Morceaux d'une polyligne dense qui restent hors des polygones donnés.
   * Les extrémités sont recalées par dichotomie pile sur le contour.
   */
  function clipOutside(pts, polys) {
    const inside = (q) => polys.some((P) => inPoly(P, q));
    const refine = (ins, out) => {
      let a = ins, b = out;
      for (let k = 0; k < 12; k++) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (inside(m)) a = m; else b = m; }
      return b;
    };
    const runs = [];
    let cur = null;
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i];
      if (!inside(q)) {
        if (!cur) { cur = []; if (i > 0) cur.push(refine(pts[i - 1], q)); }
        cur.push(q);
      } else if (cur) { cur.push(refine(q, pts[i - 1])); runs.push(cur); cur = null; }
    }
    if (cur) runs.push(cur);
    return runs.filter((r) => r.length > 1);
  }
  /** Allège une polyligne dense avant d'en faire une courbe lisse. */
  function thin(pts, step = 4) {
    if (pts.length <= 3) return pts;
    const out = [pts[0]];
    let acc = 0;
    for (let i = 1; i < pts.length - 1; i++) { acc += dist(pts[i], pts[i - 1]); if (acc >= step) { out.push(pts[i]); acc = 0; } }
    const last = pts[pts.length - 1];
    if (out.length > 1 && dist(out[out.length - 1], last) < step / 2) out.pop();
    out.push(last);
    return out;
  }

  /* ----------------------------------------------------------- TRACÉS */

  /** Un morceau de dessin : une forme fermée (remplie et cernée) ou un trait ouvert. */
  const piece = (pts, o = {}) => ({
    pts,
    closed: o.closed !== false,
    corners: o.corners || new Set(),
    fill: o.fill || null,
    stroke: o.stroke !== false,
  });
  const segment = (a, b) => piece([a, b], { closed: false });
  /** Polygone à côtés droits : aucun lissage. */
  const facets = (pts, o = {}) => piece(pts, { ...o, corners: new Set(pts.map((_, i) => i)) });
  const circle = (r, c = [0, 0], fill = null) => piece(ellipsePts(c[0], c[1], r, r, Math.max(16, Math.min(40, Math.round(r * 1.2)))), { fill });

  /**
   * Courbe lisse passant par les points (Catmull-Rom → Bézier), avec des
   * angles vifs aux indices `corners` : creux entre pétales, pointes.
   */
  function pathD(pc) {
    const p = pc.pts, n = p.length, closed = pc.closed, C = pc.corners;
    if (n < 2) return '';
    if (n === 2) return `M${pt(p[0])}L${pt(p[1])}`;
    const at = (i) => p[(i + n) % n];
    const isC = (i) => C.has(i) || (!closed && (i === 0 || i === n - 1));
    const tan = (i, out) => {
      const cur = p[i];
      if (isC(i)) {
        const o = out ? at(i + 1) : at(i - 1);
        return out ? [o[0] - cur[0], o[1] - cur[1]] : [cur[0] - o[0], cur[1] - o[1]];
      }
      const a = at(i - 1), b = at(i + 1);
      return [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2];
    };
    let d = `M${pt(p[0])}`;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const j = (i + 1) % n, t1 = tan(i, true), t2 = tan(j, false);
      d += `C${pt([p[i][0] + t1[0] / 3, p[i][1] + t1[1] / 3])} ${pt([p[j][0] - t2[0] / 3, p[j][1] - t2[1] / 3])} ${pt(p[j])}`;
    }
    return closed ? d + 'Z' : d;
  }

  /* -------------------------------------------------- PÉTALES & LOBES */

  /** Profils de bord de pétale, t ∈ [0,1] d'un creux à l'autre. */
  const PROFILES = {
    round:  { f: (t) => Math.pow(Math.sin(Math.PI * t), 0.55), ts: [0.12, 0.27, 0.42, 0.5, 0.58, 0.73, 0.88], cusps: [] },
    point:  { f: (t) => Math.pow(1 - Math.abs(2 * t - 1), 0.6), ts: [0.1, 0.22, 0.36, 0.5, 0.64, 0.78, 0.9], cusps: [0.5] },
    ruffle: { f: (t) => Math.pow(Math.sin(Math.PI * t), 0.5) * (0.86 + 0.14 * Math.abs(Math.sin(TAU * t))), ts: [0.1, 0.22, 0.34, 0.5, 0.66, 0.78, 0.9], cusps: [0.5] },
    frill:  { f: (t) => Math.pow(Math.sin(Math.PI * t), 0.5) * (0.88 + 0.12 * Math.abs(Math.sin(3 * Math.PI * t))), ts: [0.07, 0.17, 0.25, 1 / 3, 0.42, 0.5, 0.58, 2 / 3, 0.75, 0.83, 0.93], cusps: [1 / 3, 2 / 3] },
  };

  /**
   * Contour à n lobes (une couronne de pétales) autour de c.
   * Avec `arc`, ne trace qu'un éventail ouvert entre deux angles.
   */
  function lobed({ n, rp, depth, style = 'round', phase = 0, R, c = [0, 0], arc = null }) {
    const prof = PROFILES[style] || PROFILES.round;
    const rv = rp * (1 - depth);
    const start = arc ? arc[0] : phase;
    const span = arc ? arc[1] - arc[0] : TAU;
    const w = Array.from({ length: n }, () => R.range(0.86, 1.14));
    const sum = w.reduce((s, v) => s + v, 0);
    const a = [start];
    for (let i = 0; i < n; i++) a.push(a[i] + (w[i] / sum) * span);
    const h = w.map(() => R.range(0.9, 1));
    const rad = (i, t) => rv + (rp * h[i] - rv) * prof.f(t);
    const pts = [], corners = new Set();
    for (let i = 0; i < n; i++) {
      corners.add(pts.length);
      pts.push(polar(rv, a[i], c));
      for (const t of prof.ts) {
        if (prof.cusps.includes(t)) corners.add(pts.length);
        pts.push(polar(rad(i, t), a[i] + (a[i + 1] - a[i]) * t, c));
      }
    }
    if (arc) { corners.add(pts.length); pts.push(polar(rv, a[n], c)); }
    const Rf = (ang) => {
      let x = ang - start;
      if (!arc) x = ((x % TAU) + TAU) % TAU;
      for (let i = 0; i < n; i++) if (x <= a[i + 1] - start) return rad(i, (x - (a[i] - start)) / (a[i + 1] - a[i]));
      return rv;
    };
    return { n, a: a.slice(0, n), rv, rp, R: Rf, pts, corners };
  }

  /* --------------------------------------------------------- LES FLEURS */

  /**
   * Fleur vue de face, en couronnes concentriques de pétales.
   * Chaque couronne reste à `sp` de la précédente ; quand il n'y a plus la
   * place, on s'arrête là — c'est ce qui garde le dessin aéré.
   */
  function ringFlower(spec, r, R, sp, col) {
    const pieces = [], rings = [];
    const c = spec.center;
    let prev = null;
    for (let k = 0; k < spec.rings.length; k++) {
      const g = spec.rings[k];
      let rp = r * g.f;
      if (prev) rp = Math.min(rp, prev.rv - sp);
      if (k > 0 && rp < sp * 1.6) break;
      const rv = rp * (1 - g.depth);
      let n = Math.min(g.n, Math.floor((TAU * rv) / (sp * 2.2)));
      // les pétales qui convergent vers un cœur doivent garder l'écart au cœur aussi
      if (c && c.dividers && k === spec.rings.length - 1) n = Math.min(n, Math.floor((TAU * Math.min(r * c.f, rv - sp)) / (sp * 1.15)));
      if (n < 3) { if (k > 0) break; n = 3; }
      let style = g.style;
      if (style === 'frill' && (TAU * rv) / n / 3 < sp) style = 'round';
      const phase = prev ? prev.a[0] + Math.PI / n + R.range(-0.12, 0.12) : R() * TAU;
      const ring = lobed({ n, rp, depth: g.depth, style, phase, R });
      pieces.push(piece(ring.pts, { corners: ring.corners, fill: deeper(col, k * (spec.shade ?? 1)) }));
      if (prev) for (const a of prev.a) { const r1 = prev.R(a), r2 = ring.R(a); if (r1 - r2 >= sp) pieces.push(segment(polar(r1, a), polar(r2, a))); }
      rings.push(ring);
      prev = ring;
    }
    const last = rings[rings.length - 1];
    if (c) {
      const room = last.rv - sp;
      if (c.type === 'disk') {
        const rc = Math.min(r * c.f, room);
        if (rc >= sp * 0.9) {
          pieces.push(circle(rc, [0, 0], c.color || deeper(col, rings.length + 1)));
          if (c.dividers && (TAU * rc) / last.n >= sp) for (const a of last.a) if (last.rv - rc >= sp) pieces.push(segment(polar(last.rv, a), polar(rc, a)));
          const rc2 = rc * (c.f2 || 0);
          if (rc2 >= sp * 0.8 && rc - rc2 >= sp) pieces.push(circle(rc2, [0, 0], c.color2 || deeper(c.color || col, 3)));
        }
      } else if (c.type === 'spiral') {
        const rs = Math.min(r * c.f, room);
        if (rs >= sp * 1.2) {
          const ph = R() * TAU, pts = [];
          for (let a = 0; a <= (c.turns || 1.2) * TAU; a += 0.32) {
            const rr = rs - (a / TAU) * sp * 1.05;
            if (rr < sp * 0.45) break;
            pts.push(polar(rr, ph + a));
          }
          if (pts.length > 3) pieces.push(piece(pts, { closed: false }));
        }
      }
    }
    return radial(pieces, rings[0]);
  }
  const radial = (pieces, outer, extra = {}) => ({
    pieces, circles: [[0, 0, outer.rp]], polys: [outer.pts], anchor: [0, 0], cone: null, kind: 'radial', rExit: outer.rp, maxDeg: 3, ...extra,
  });

  function hortensia(r, R, sp, col) {
    const outline = lobed({ n: clamp(Math.floor((TAU * r) / (sp * 3.2)), 7, 14), rp: r, depth: 0.08, phase: R() * TAU, R });
    const pieces = [piece(outline.pts, { corners: outline.corners, fill: paler(col, 0.45) })];
    const fr = Math.max(sp * 1.5, r * 0.2);
    const pitch = 2 * fr + sp, lim = outline.rv * 0.97 - sp - fr;
    const rot = R() * TAU, centers = [];
    for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) {
      const x = (i + (j & 1 ? 0.5 : 0)) * pitch, y = j * pitch * 0.866;
      const p = [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
      if (Math.hypot(p[0], p[1]) <= lim) centers.push(p);
    }
    for (const c of centers) {
      const f = lobed({ n: 4, rp: fr, depth: 0.4, phase: R() * TAU, R, c });
      pieces.push(piece(f.pts, { corners: f.corners, fill: col }));
    }
    return radial(pieces, outline, { maxDeg: 2 });
  }

  function myosotis(r, R, sp, col) {
    const fr = Math.max(sp * 1.7, r * 0.42);
    const centers = [[0, 0]];
    for (let k = 0; k < 80 && centers.length < 5; k++) {
      const p = polar(R.range(0, Math.max(0, r - fr)), R() * TAU);
      if (centers.every((c) => dist(c, p) >= 2 * fr + sp)) centers.push(p);
    }
    const pieces = [], polys = [], circles = [];
    for (const c of centers) {
      const f = lobed({ n: 5, rp: fr, depth: 0.38, phase: R() * TAU, R, c });
      pieces.push(piece(f.pts, { corners: f.corners, fill: col }));
      if (fr * 0.3 >= sp * 0.8 && f.rv - fr * 0.3 >= sp) pieces.push(circle(fr * 0.3, c, '#f1d27a'));
      polys.push(f.pts);
      circles.push([c[0], c[1], fr]);
    }
    const reach = Math.max(...centers.map((c) => Math.hypot(c[0], c[1]) + fr));
    return { pieces, circles, polys, anchor: [0, 0], cone: null, kind: 'radial', rExit: fr, maxDeg: 2, reach };
  }

  /* ------------------------------------------- FLEURS DE TROIS-QUARTS */

  /**
   * Un pétale vu de biais : pincé au pied, large en haut, bord ondulé.
   * `a` : orientation en degrés (0 = vers le haut), coordonnées en unités de r.
   */
  function petalPts({ base, a, len, wid, nb = 2, amp = 0.08, waist = 0.62, open = 0.75, foot = 0, point = 0 }, r, R) {
    const ang = (a * Math.PI) / 180;
    const d = [Math.sin(ang), -Math.cos(ang)], n = [Math.cos(ang), Math.sin(ang)];
    const L = len * r, Wd = wid * r, b = [base[0] * r, base[1] * r];
    const at = (u, v) => [b[0] + n[0] * u + d[0] * v, b[1] + n[1] * u + d[1] * v];
    // `foot` : un pétale vu de l'extérieur a un pied arrondi, pas une pointe
    const hw = (t) => (Wd / 2) * (foot + (1 - foot) * Math.pow(Math.sin((Math.PI / 2) * t), open));
    const jit = Array.from({ length: nb + 1 }, () => R.range(0.85, 1.15));
    const pts = [];
    const steps = Math.max(10, Math.round(L / 1.5));
    for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push(at(-hw(t), t * waist * L)); }
    const capN = Math.max(16, Math.round((Math.PI * Wd) / 2 / 1.2));
    for (let i = 1; i < capN; i++) {
      const s = Math.PI - (Math.PI * i) / capN;                         // de gauche à droite par le haut
      const k = Math.floor(((Math.PI - s) / Math.PI) * nb);
      // bosses larges, encoches franches : le bord froissé d'un pétale de pivoine
      // `point` : la pointe douce des grands pétales extérieurs
      const m = (1 + amp * jit[Math.min(k, nb)] * (Math.pow(Math.abs(Math.sin(nb * s)), 0.45) - 1)) * (1 + point * Math.pow(Math.sin(s), 10));
      pts.push(at((Wd / 2) * Math.cos(s) * m, waist * L + (1 - waist) * L * Math.sin(s) * m));
    }
    for (let i = steps; i >= (foot ? 0 : 1); i--) { const t = i / steps; pts.push(at(hw(t), t * waist * L)); }
    if (foot) {
      const fw = (Wd / 2) * foot, m = Math.max(8, Math.round(fw / 1.2));
      for (let j = 1; j < m; j++) pts.push(at(fw * Math.cos((Math.PI * j) / m), -fw * 0.45 * Math.sin((Math.PI * j) / m)));
    }
    return pts;
  }

  /**
   * Fleur faite de pétales qui se recouvrent, du fond vers l'avant.
   * Seule la partie visible de chaque contour est cernée. Si deux traits
   * visibles se frôlent, on retire le pétale de détail en cause, et on recommence.
   */
  function layeredFlower(spec, r, R, sp, col) {
    // un peu de jeu dans chaque pétale : deux fleurs du même tirage ne sont jamais jumelles
    const petals = spec.petals.map((p) => {
      const q = { ...p, a: p.a + R.range(-6, 6), len: p.len * R.range(0.93, 1.06), wid: p.wid * R.range(0.94, 1.06) };
      // vue de trois-quarts : la fleur s'étale en largeur
      return { prio: q.prio, shade: q.shade, pts: petalPts(q, r, R).map(([x, y]) => [x * (spec.sx || 1), y * (spec.sy || 1)]) };
    });
    return layeredFrom(petals, r, sp, col);
  }

  /** Densifie une polyligne (un point tous les 0,8 mm) pour la découper finement. */
  function densify(pts, closed) {
    const ring = closed ? [...pts, pts[0]] : pts;
    const out = [];
    for (let k = 0; k < ring.length - 1; k++) {
      const a = ring[k], b = ring[k + 1], n = Math.max(1, Math.ceil(dist(a, b) / 0.8));
      for (let j = 0; j < n; j++) out.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
    }
    out.push(ring[ring.length - 1]);
    return out;
  }

  /**
   * Fleur faite de pétales qui se recouvrent, du fond vers l'avant.
   * Chaque pétale : { pts (contour fermé), prio (0 = indispensable), shade, folds (replis, traits ouverts) }.
   * Seule la partie visible de chaque trait est cernée. Si deux traits visibles
   * se frôlent, on retire d'abord un repli, puis le pétale de détail en cause.
   */
  function layeredFrom(petals, r, sp, col, { raw = false } = {}) {
    // la fleur doit tenir pile dans son rayon : c'est lui que le placement a réservé
    const k0 = raw ? r : r / Math.max(...petals.flatMap((p) => p.pts.map((q) => Math.hypot(q[0], q[1]))));
    const sc = (pts) => pts.map(([x, y]) => [x * k0, y * k0]);
    petals = petals.map((p) => ({ ...p, pts: sc(p.pts), folds: (p.folds || []).map(sc) }));
    let runs = [];
    for (let guard = 0; guard < 30; guard++) {
      runs = [];
      petals.forEach((p, i) => {
        const front = petals.slice(i + 1).map((q) => q.pts);
        const lines = [...(p.hidden ? [] : [{ pts: densify(p.pts, true), fold: false }]), ...p.folds.map((f) => ({ pts: densify(f, false), fold: true }))];
        for (const ln of lines) for (const run of front.length ? clipOutside(ln.pts, front) : [ln.pts]) if (run.length > 2) runs.push({ pts: run, petal: i, fold: ln.fold });
      });
      const pairs = closeRuns(runs, sp);
      if (!pairs.length) break;
      // un repli trop serré disparaît en premier : il n'est là que pour le modelé
      const foldPair = pairs.find(([a, b]) => runs[a].fold || runs[b].fold);
      if (foldPair) {
        const [a, b] = foldPair;
        const victim = runs[a].fold && runs[b].fold ? (petals[runs[a].petal].prio >= petals[runs[b].petal].prio ? a : b) : runs[a].fold ? a : b;
        petals[runs[victim].petal].folds = [];
        continue;
      }
      // sinon, dans chaque paire, on sacrifie le pétale de détail le plus fin
      const drop = new Set();
      for (const [a, b] of pairs) {
        const ia = runs[a].petal, ib = runs[b].petal, pa = petals[ia].prio, pb = petals[ib].prio;
        if (pa === 0 && pb === 0) continue;
        drop.add(pa > pb || (pa === pb && ia > ib) ? ia : ib);
      }
      if (!drop.size) break;
      const worst = [...drop].sort((x, y) => petals[y].prio - petals[x].prio || y - x)[0];
      petals = petals.filter((_, i) => i !== worst);
    }
    const pieces = [];
    for (const p of petals) pieces.push(facets(p.pts, { fill: p.color || (p.shade < 0 ? paler(col, -p.shade * 0.25) : deeper(col, p.shade)), stroke: false }));
    for (const run of runs) pieces.push(piece(thin(run.pts, 1.6), { closed: false }));
    const reach = Math.max(...petals.flatMap((p) => p.pts.map((q) => Math.hypot(q[0], q[1]))));
    return { pieces, circles: [[0, 0, reach]], polys: petals.map((p) => p.pts), anchor: [0, 0], cone: null, kind: 'radial', rExit: reach * 0.85, maxDeg: 3 };
  }

  /** Paires de traits visibles (indices dans runs) qui passent à moins de `sp`, hors jonctions. */
  function closeRuns(runs, sp) {
    const ends = runs.flatMap((r) => [r.pts[0], r.pts[r.pts.length - 1]]);
    const jr = sp * 1.3;
    const bad = [];
    for (let a = 0; a < runs.length; a++) {
      for (let b = a + 1; b < runs.length; b++) {
        if (runs[a].petal === runs[b].petal) continue;
        const A = runs[a].pts, B = runs[b].pts;
        let hit = false;
        for (let i = 0; i < A.length && !hit; i += 2) {
          const p = A[i];
          if (ends.some((e) => dist(e, p) < jr)) continue;
          for (let j = 0; j < B.length; j += 2) if (dist(p, B[j]) < sp && !ends.some((e) => dist(e, B[j]) < jr)) { hit = true; break; }
        }
        if (hit) bad.push([a, b]);
      }
    }
    return bad;
  }

  /* ------------------------------------------------------- LES GABARITS */
  /*
   * Fleurs et feuilles dessinées à la main (d'après des dessins au trait),
   * découpées en zones à peindre. Coordonnées sur un rayon de 1000.
   *   cells   : { id, role, shade, w (largeur), into (voisine de fusion), pts }
   *   strokes : { a, b (zones séparées, -1 = bord), pts } — chaque trait une seule fois
   * Le rôle (cœur, parenthèses, éventail, latéral, retombant, bandeau, feuille)
   * sert à colorer et à simplifier de façon cohérente.
   */
  const GABARITS = {"pivoine":{"cells":[{"id":3,"role":"fan","shade":1,"w":345,"into":5,"pts":[[31,-910],[52,-906],[76,-898],[98,-888],[120,-875],[140,-861],[162,-842],[179,-825],[197,-802],[215,-769],[222,-754],[230,-726],[235,-698],[236,-669],[235,-644],[230,-637],[220,-637],[185,-652],[168,-657],[135,-657],[111,-650],[94,-642],[82,-633],[69,-621],[57,-607],[44,-581],[39,-563],[36,-538],[34,-532],[29,-527],[10,-520],[-84,-504],[-118,-496],[-152,-481],[-180,-460],[-188,-460],[-194,-465],[-223,-505],[-241,-524],[-255,-535],[-268,-541],[-277,-543],[-290,-543],[-300,-540],[-312,-534],[-329,-520],[-356,-486],[-378,-462],[-390,-454],[-397,-457],[-444,-488],[-448,-494],[-448,-506],[-445,-534],[-438,-590],[-431,-621],[-418,-672],[-408,-699],[-389,-743],[-369,-779],[-349,-810],[-328,-835],[-306,-855],[-284,-868],[-261,-878],[-248,-880],[-226,-882],[-210,-881],[-188,-878],[-161,-867],[-121,-843],[-113,-847],[-81,-882],[-63,-895],[-51,-900],[-35,-905],[-14,-909],[7,-911]]},{"id":4,"role":"fan","shade":1,"w":256,"into":7,"pts":[[401,-784],[417,-778],[436,-768],[453,-756],[471,-739],[489,-721],[496,-710],[520,-655],[530,-640],[551,-621],[597,-598],[611,-588],[624,-576],[634,-563],[640,-554],[643,-545],[636,-538],[608,-531],[587,-517],[570,-497],[552,-468],[537,-433],[523,-388],[514,-350],[509,-315],[499,-216],[496,-195],[492,-187],[480,-185],[474,-192],[461,-223],[447,-250],[439,-263],[428,-277],[420,-284],[411,-289],[392,-294],[386,-298],[381,-310],[377,-350],[371,-380],[362,-410],[342,-457],[310,-520],[278,-573],[246,-616],[241,-630],[243,-649],[251,-681],[263,-708],[281,-736],[301,-758],[326,-775],[350,-785],[377,-787]]},{"id":5,"role":"par","shade":1.6,"w":255,"into":4,"pts":[[182,-654],[213,-641],[234,-626],[246,-614],[274,-579],[302,-534],[331,-481],[355,-426],[371,-380],[378,-343],[383,-292],[376,-282],[337,-240],[329,-235],[321,-238],[300,-271],[276,-295],[252,-314],[218,-332],[182,-347],[124,-363],[115,-369],[78,-413],[60,-436],[48,-458],[38,-485],[34,-502],[34,-520],[40,-569],[44,-581],[49,-594],[61,-612],[70,-622],[86,-636],[104,-647],[120,-654],[146,-658],[163,-658]]},{"id":6,"role":"par","shade":1.6,"w":141,"into":10,"pts":[[-257,-538],[-239,-524],[-214,-497],[-190,-463],[-187,-457],[-187,-451],[-198,-426],[-204,-423],[-217,-421],[-227,-418],[-245,-407],[-258,-395],[-278,-367],[-297,-329],[-312,-285],[-333,-169],[-341,-137],[-348,-131],[-357,-133],[-366,-140],[-413,-180],[-421,-198],[-429,-229],[-435,-265],[-437,-298],[-436,-327],[-433,-351],[-425,-383],[-414,-411],[-397,-439],[-324,-526],[-309,-537],[-291,-543],[-273,-543]]},{"id":7,"role":"fan","shade":1,"w":218,"into":11,"pts":[[652,-533],[668,-523],[678,-514],[696,-490],[706,-472],[715,-449],[723,-421],[729,-372],[729,-319],[721,-259],[713,-226],[697,-193],[662,-134],[617,-68],[572,-7],[542,30],[488,90],[459,118],[424,146],[401,161],[389,160],[388,148],[409,103],[450,4],[462,-33],[472,-71],[496,-195],[509,-313],[513,-345],[522,-385],[531,-416],[546,-454],[559,-480],[573,-501],[587,-517],[601,-528],[619,-535],[638,-536]]},{"id":8,"role":"par","shade":1.7,"w":219,"into":12,"pts":[[36,-494],[42,-472],[55,-445],[67,-427],[108,-378],[112,-371],[114,-363],[94,-344],[68,-300],[55,-287],[35,-276],[18,-271],[-3,-268],[-25,-271],[-90,-291],[-115,-293],[-131,-294],[-137,-298],[-140,-305],[-148,-361],[-156,-381],[-167,-400],[-192,-423],[-194,-430],[-192,-437],[-180,-457],[-171,-467],[-157,-478],[-142,-486],[-122,-494],[-90,-503],[-4,-517],[16,-522],[24,-522],[31,-518]]},{"id":9,"role":"fan","shade":1,"w":266,"into":14,"pts":[[-542,-517],[-514,-512],[-490,-506],[-463,-496],[-441,-485],[-419,-473],[-397,-456],[-393,-449],[-396,-441],[-413,-413],[-422,-392],[-429,-366],[-435,-336],[-436,-302],[-435,-271],[-431,-240],[-421,-195],[-422,-186],[-430,-183],[-463,-179],[-482,-170],[-493,-162],[-514,-140],[-520,-132],[-526,-119],[-528,-106],[-528,-92],[-525,-77],[-519,-60],[-510,-38],[-495,-11],[-451,65],[-448,71],[-450,83],[-461,85],[-467,83],[-505,68],[-551,42],[-578,23],[-621,-13],[-655,-49],[-687,-90],[-737,-168],[-744,-185],[-747,-203],[-746,-232],[-741,-250],[-733,-266],[-722,-280],[-712,-288],[-677,-311],[-679,-318],[-704,-355],[-712,-380],[-715,-396],[-716,-414],[-714,-431],[-708,-448],[-697,-471],[-685,-485],[-668,-498],[-649,-508],[-633,-514],[-604,-519],[-567,-519]]},{"id":10,"role":"par","shade":1.2,"w":141,"into":12,"pts":[[-189,-418],[-178,-410],[-168,-400],[-161,-389],[-153,-374],[-146,-353],[-140,-309],[-139,-297],[-143,-291],[-148,-287],[-170,-275],[-193,-257],[-212,-234],[-224,-208],[-234,-174],[-239,-152],[-240,-94],[-239,-75],[-234,-44],[-219,14],[-218,22],[-232,29],[-246,13],[-263,-9],[-311,-82],[-340,-118],[-342,-124],[-341,-130],[-315,-273],[-301,-319],[-280,-364],[-268,-381],[-255,-398],[-235,-415],[-222,-421],[-212,-423],[-202,-422]]},{"id":11,"role":"lat","shade":0.5,"w":211,"into":16,"pts":[[988,-134],[989,-104],[986,-95],[977,-93],[952,-98],[933,-99],[911,-97],[892,-93],[859,-83],[823,-68],[792,-52],[769,-38],[746,-18],[719,10],[619,128],[578,173],[555,195],[530,216],[499,236],[469,251],[435,264],[381,280],[345,287],[308,288],[286,287],[250,276],[237,271],[231,266],[229,255],[236,248],[264,238],[295,223],[328,202],[358,180],[392,167],[421,149],[442,133],[482,95],[507,70],[549,22],[597,-40],[652,-118],[681,-164],[708,-213],[719,-227],[743,-250],[778,-277],[811,-296],[821,-298],[852,-300],[885,-288],[915,-263],[940,-231],[962,-197],[986,-149],[988,-144]]},{"id":12,"role":"coeur","shade":1.3,"w":465,"into":13,"pts":[[150,-358],[178,-350],[212,-336],[241,-321],[268,-303],[284,-289],[298,-273],[314,-248],[320,-229],[321,-223],[317,-213],[291,-172],[279,-148],[269,-127],[263,-105],[258,-82],[255,-56],[250,68],[245,96],[238,124],[230,143],[221,162],[177,220],[151,259],[139,262],[75,264],[42,268],[21,264],[-57,245],[-67,242],[-72,238],[-85,215],[-104,186],[-194,74],[-203,54],[-229,-22],[-235,-46],[-239,-70],[-241,-111],[-239,-148],[-234,-176],[-226,-204],[-216,-227],[-207,-242],[-196,-255],[-180,-269],[-150,-286],[-129,-292],[-103,-294],[-77,-289],[-21,-271],[-3,-270],[18,-272],[42,-280],[51,-286],[62,-295],[71,-305],[93,-344],[103,-355],[112,-360],[123,-362]]},{"id":13,"role":"par","shade":1.2,"w":210,"into":12,"pts":[[412,-289],[424,-281],[433,-271],[450,-247],[472,-198],[485,-154],[484,-136],[474,-84],[463,-38],[449,5],[428,57],[398,127],[387,145],[371,165],[335,198],[318,210],[297,222],[256,242],[216,252],[173,258],[163,255],[162,244],[170,230],[222,160],[233,136],[241,111],[246,92],[250,58],[254,-33],[257,-74],[260,-94],[270,-126],[279,-149],[306,-195],[341,-244],[362,-269],[378,-284],[386,-289],[398,-292],[403,-292]]},{"id":14,"role":"lat","shade":0.7,"w":379,"into":19,"pts":[[-784,-194],[-760,-186],[-744,-177],[-740,-174],[-700,-108],[-680,-79],[-660,-55],[-639,-32],[-617,-10],[-575,25],[-549,43],[-523,59],[-502,69],[-473,81],[-398,106],[-360,123],[-322,146],[-303,163],[-303,175],[-313,179],[-362,179],[-388,183],[-422,190],[-462,205],[-493,221],[-519,237],[-587,291],[-644,335],[-661,344],[-691,349],[-716,347],[-733,344],[-768,335],[-791,327],[-821,314],[-847,300],[-861,290],[-875,274],[-894,246],[-904,223],[-914,192],[-929,134],[-940,101],[-954,74],[-976,36],[-985,18],[-991,2],[-997,-28],[-996,-53],[-993,-74],[-981,-106],[-965,-131],[-942,-155],[-914,-175],[-883,-188],[-847,-197],[-817,-199]]},{"id":15,"role":"par","shade":1.1,"w":198,"into":9,"pts":[[-417,-180],[-404,-173],[-382,-155],[-346,-123],[-321,-96],[-247,13],[-152,125],[-103,189],[-87,212],[-84,218],[-83,228],[-92,234],[-100,233],[-189,207],[-238,192],[-282,182],[-287,180],[-307,159],[-322,147],[-341,134],[-382,113],[-432,92],[-442,81],[-461,50],[-501,-20],[-520,-60],[-527,-85],[-528,-99],[-527,-116],[-521,-130],[-506,-151],[-493,-163],[-479,-173],[-467,-179],[-449,-184],[-435,-184]]},{"id":16,"role":"lat","shade":0.9,"w":149,"into":11,"pts":[[973,-105],[973,-94],[957,-77],[932,-47],[895,8],[848,83],[796,149],[739,201],[707,226],[678,247],[650,264],[625,277],[595,290],[560,301],[505,315],[469,322],[436,323],[407,321],[371,313],[352,306],[347,294],[356,287],[415,271],[463,254],[491,241],[514,227],[542,206],[565,186],[606,143],[724,3],[750,-23],[776,-43],[829,-73],[885,-97],[909,-104],[942,-110],[965,-110]]},{"id":19,"role":"band","shade":-0.2,"w":212,"into":21,"pts":[[-281,183],[-242,191],[-116,229],[4,260],[11,263],[17,274],[9,282],[3,284],[-24,292],[-61,299],[-98,301],[-201,295],[-231,297],[-260,305],[-281,313],[-302,324],[-325,338],[-368,372],[-413,415],[-455,463],[-472,477],[-488,485],[-501,488],[-514,489],[-532,489],[-553,484],[-591,469],[-639,448],[-654,439],[-670,422],[-674,414],[-678,405],[-680,386],[-677,372],[-667,356],[-660,349],[-529,244],[-502,226],[-484,215],[-458,203],[-435,194],[-412,187],[-388,182],[-367,180],[-342,179],[-306,180]]},{"id":20,"role":"band","shade":-0.2,"w":298,"into":23,"pts":[[689,266],[709,319],[714,340],[714,354],[712,368],[706,381],[690,398],[675,407],[638,425],[604,437],[532,459],[466,485],[376,527],[302,565],[253,586],[207,600],[175,606],[142,609],[117,609],[92,606],[64,599],[41,589],[15,577],[-33,548],[-56,531],[-75,512],[-86,492],[-91,471],[-92,455],[-89,447],[-82,444],[-57,441],[-38,437],[-17,429],[3,419],[42,393],[147,309],[200,272],[218,263],[225,263],[241,272],[262,280],[312,290],[349,306],[371,313],[394,318],[436,323],[455,323],[493,317],[562,301],[613,283],[673,252],[681,254]]},{"id":21,"role":"band","shade":-0.4,"w":141,"into":19,"pts":[[195,274],[144,312],[64,377],[35,399],[11,414],[-11,426],[-34,435],[-59,442],[-84,444],[-113,442],[-168,436],[-187,435],[-209,437],[-236,442],[-258,449],[-344,482],[-373,487],[-410,487],[-440,481],[-446,478],[-453,472],[-451,463],[-437,444],[-416,419],[-394,396],[-352,358],[-329,341],[-305,325],[-283,313],[-260,304],[-235,298],[-206,296],[-174,296],[-102,300],[-60,299],[-19,290],[46,270],[75,265],[143,262],[183,258],[192,259]]},{"id":23,"role":"bas","shade":0.2,"w":486,"into":20,"pts":[[-131,439],[-106,443],[-99,445],[-94,451],[-91,478],[-84,498],[-70,518],[-51,536],[-25,554],[5,572],[33,586],[61,597],[87,605],[109,608],[132,609],[174,606],[197,602],[223,596],[253,586],[330,554],[340,557],[341,567],[324,632],[313,662],[288,717],[272,746],[242,789],[218,817],[192,843],[165,867],[140,887],[114,906],[85,922],[41,942],[7,954],[-50,973],[-82,982],[-110,986],[-143,987],[-180,984],[-212,977],[-247,965],[-322,928],[-413,899],[-447,884],[-468,871],[-481,860],[-501,838],[-514,822],[-528,796],[-540,765],[-548,729],[-551,692],[-550,660],[-543,615],[-532,572],[-523,545],[-506,500],[-500,489],[-466,474],[-460,473],[-432,483],[-410,486],[-387,487],[-361,485],[-331,478],[-265,452],[-218,438],[-193,435],[-160,436]]}],"strokes":[{"a":3,"b":4,"pts":[[236,-685],[236,-652],[235,-644],[230,-637]]},{"a":3,"b":5,"pts":[[235,-644],[230,-637],[220,-637],[179,-655],[168,-657],[150,-658],[135,-657],[125,-655],[111,-650],[94,-642],[82,-633],[69,-621],[59,-610],[51,-597],[42,-574],[34,-532],[29,-527],[23,-524]]},{"a":3,"b":8,"pts":[[29,-527],[10,-520],[-84,-504],[-118,-496],[-152,-481],[-180,-460],[-188,-460]]},{"a":3,"b":6,"pts":[[-180,-460],[-188,-460],[-194,-465],[-225,-508],[-246,-529],[-265,-540],[-281,-543],[-290,-543],[-300,-540],[-312,-534],[-329,-520],[-364,-477],[-383,-458],[-390,-454],[-397,-457]]},{"a":3,"b":9,"pts":[[-390,-454],[-397,-457],[-444,-488],[-448,-494],[-448,-506]]},{"a":3,"b":-1,"pts":[[-448,-501],[-441,-566],[-431,-621],[-416,-676],[-408,-699],[-389,-743],[-365,-786],[-349,-810],[-328,-835],[-306,-855],[-288,-866],[-261,-878],[-248,-880],[-226,-882],[-210,-881],[-188,-878],[-161,-867],[-121,-843],[-113,-847],[-93,-870],[-74,-888],[-59,-897],[-39,-904],[-14,-909],[20,-911],[52,-906],[76,-898],[98,-888],[116,-878],[140,-861],[159,-845],[179,-825],[197,-802],[212,-777],[223,-750],[230,-726],[235,-698],[236,-681]]},{"a":4,"b":7,"pts":[[640,-554],[643,-545],[636,-538],[605,-529],[587,-517],[570,-497],[552,-468],[537,-433],[523,-388],[511,-335],[496,-195],[492,-187],[480,-185]]},{"a":4,"b":13,"pts":[[492,-187],[480,-185],[474,-192],[461,-223],[447,-250],[439,-263],[428,-277],[420,-284],[411,-289],[392,-294],[386,-298]]},{"a":4,"b":5,"pts":[[392,-294],[386,-298],[383,-304],[375,-361],[368,-391],[356,-424],[342,-457],[312,-516],[295,-547],[278,-573],[246,-616],[242,-625],[241,-635]]},{"a":4,"b":-1,"pts":[[250,-677],[264,-712],[281,-736],[301,-758],[322,-773],[350,-785],[359,-786],[385,-787],[405,-783],[421,-776],[443,-763],[471,-739],[489,-721],[496,-710],[520,-655],[530,-640],[551,-621],[597,-598],[611,-588],[624,-576],[634,-563],[640,-554],[643,-545]]},{"a":5,"b":13,"pts":[[383,-298],[383,-292],[380,-287],[337,-240],[329,-235],[321,-238]]},{"a":5,"b":12,"pts":[[329,-235],[321,-238],[300,-271],[279,-293],[252,-314],[221,-330],[186,-345],[129,-362],[119,-366],[115,-369]]},{"a":5,"b":8,"pts":[[119,-366],[109,-376],[75,-416],[63,-432],[52,-450],[43,-469],[37,-490],[34,-507],[34,-524]]},{"a":6,"b":8,"pts":[[-187,-457],[-187,-451],[-189,-445],[-198,-426]]},{"a":6,"b":10,"pts":[[-195,-432],[-198,-426],[-204,-423],[-217,-421],[-227,-418],[-245,-407],[-255,-397],[-267,-383],[-287,-350],[-298,-326],[-312,-285],[-337,-149],[-341,-137],[-348,-131]]},{"a":6,"b":15,"pts":[[-341,-137],[-348,-131],[-357,-133],[-363,-137],[-410,-176],[-413,-180],[-418,-190]]},{"a":6,"b":9,"pts":[[-416,-185],[-429,-229],[-435,-261],[-437,-294],[-436,-327],[-432,-356],[-425,-383],[-420,-399],[-406,-426],[-387,-452]]},{"a":7,"b":-1,"pts":[[647,-534],[668,-523],[681,-511],[694,-494],[707,-468],[715,-449],[722,-425],[727,-397],[729,-348],[726,-291],[719,-247]]},{"a":7,"b":11,"pts":[[720,-251],[713,-226],[705,-207],[664,-138],[640,-101],[596,-39],[544,27],[488,90],[462,115],[434,139],[411,156],[401,161],[389,160],[388,148]]},{"a":7,"b":13,"pts":[[389,160],[388,148],[407,106],[431,52],[456,-14],[473,-75],[493,-176]]},{"a":8,"b":12,"pts":[[112,-371],[114,-363],[94,-344],[73,-307],[65,-296],[55,-287],[43,-280],[23,-272],[1,-268],[-17,-269],[-34,-273],[-90,-291],[-108,-294],[-131,-294],[-137,-298]]},{"a":8,"b":10,"pts":[[-131,-294],[-137,-298],[-140,-305],[-147,-357],[-156,-381],[-167,-400],[-192,-423],[-194,-430]]},{"a":9,"b":15,"pts":[[-421,-195],[-422,-186],[-430,-183],[-452,-181],[-466,-178],[-482,-170],[-493,-162],[-507,-149],[-518,-135],[-526,-119],[-528,-106],[-528,-92],[-525,-77],[-519,-60],[-510,-38],[-495,-11],[-451,65],[-448,71],[-450,83]]},{"a":9,"b":14,"pts":[[-448,71],[-450,83],[-461,85],[-498,71],[-527,57],[-551,42],[-575,26],[-600,6],[-641,-34],[-660,-55],[-685,-87],[-701,-110],[-739,-172],[-744,-185],[-746,-198]]},{"a":9,"b":-1,"pts":[[-746,-194],[-747,-211],[-746,-232],[-741,-250],[-733,-266],[-722,-280],[-712,-288],[-677,-311],[-679,-318],[-697,-344],[-706,-359],[-713,-384],[-716,-401],[-715,-423],[-710,-444],[-699,-467],[-688,-481],[-668,-498],[-649,-508],[-625,-516],[-604,-519],[-567,-519],[-538,-516],[-514,-512],[-490,-506],[-459,-494]]},{"a":10,"b":12,"pts":[[-139,-297],[-143,-291],[-148,-287],[-170,-275],[-182,-267],[-193,-257],[-203,-246],[-219,-221],[-231,-185],[-237,-163],[-239,-144],[-239,-75],[-234,-44],[-219,14],[-218,22],[-232,29]]},{"a":10,"b":15,"pts":[[-218,22],[-232,29],[-241,20],[-263,-9],[-311,-82],[-340,-118],[-342,-124],[-341,-130]]},{"a":11,"b":16,"pts":[[989,-104],[986,-95],[977,-93],[952,-98],[933,-99],[911,-97],[892,-93],[855,-82],[823,-68],[792,-52],[769,-38],[746,-18],[719,10],[619,128],[592,158],[555,195],[530,216],[499,236],[469,251],[435,264],[381,280],[357,286],[336,288]]},{"a":11,"b":20,"pts":[[340,288],[295,288],[266,282],[237,271],[231,266],[229,255]]},{"a":11,"b":13,"pts":[[231,266],[229,255],[236,248],[264,238],[295,223],[328,202],[358,180],[385,169]]},{"a":11,"b":-1,"pts":[[731,-239],[778,-277],[816,-298],[852,-300],[885,-288],[915,-263],[938,-235],[954,-211],[970,-183],[988,-144],[989,-104],[986,-95]]},{"a":12,"b":13,"pts":[[319,-235],[321,-223],[319,-218],[280,-151],[269,-127],[263,-105],[258,-82],[255,-56],[250,68],[245,96],[238,124],[230,143],[221,162],[177,220],[155,254]]},{"a":12,"b":21,"pts":[[158,249],[151,259],[139,262],[75,264],[42,268],[21,264]]},{"a":12,"b":19,"pts":[[25,265],[-67,242],[-72,238],[-77,229]]},{"a":12,"b":15,"pts":[[-75,233],[-85,215],[-104,186],[-194,74],[-200,62],[-210,35]]},{"a":12,"b":-1,"pts":[[-209,39],[-211,31]]},{"a":13,"b":20,"pts":[[220,251],[204,254]]},{"a":13,"b":21,"pts":[[208,254],[173,258],[163,255],[162,244]]},{"a":14,"b":15,"pts":[[-447,89],[-390,109],[-346,131],[-322,146],[-309,157],[-303,163],[-303,175]]},{"a":14,"b":19,"pts":[[-303,163],[-303,175],[-313,179],[-362,179],[-392,183],[-441,196],[-476,211],[-496,222],[-526,242],[-590,294],[-648,338],[-661,344],[-682,348]]},{"a":14,"b":-1,"pts":[[-678,348],[-704,349],[-729,345],[-768,335],[-791,327],[-821,314],[-847,300],[-861,290],[-873,277],[-887,257],[-901,231],[-911,204],[-929,134],[-940,101],[-954,74],[-984,22],[-991,2],[-995,-15],[-997,-40],[-995,-61],[-993,-74],[-983,-102],[-965,-131],[-942,-155],[-934,-160],[-914,-175],[-883,-188],[-847,-197],[-821,-199],[-796,-197],[-776,-192],[-757,-184]]},{"a":15,"b":19,"pts":[[-83,228],[-92,234],[-104,232],[-238,192],[-282,182],[-287,180],[-294,172]]},{"a":16,"b":-1,"pts":[[963,-82],[932,-47],[895,8],[848,83],[796,149],[739,201],[685,242]]},{"a":16,"b":20,"pts":[[688,240],[650,264],[621,279],[595,290],[548,305],[478,320],[436,323],[416,322],[395,319],[367,312],[352,306],[347,294]]},{"a":19,"b":21,"pts":[[11,263],[17,274],[9,282],[-24,292],[-44,297],[-81,301],[-181,296],[-216,296],[-242,299],[-260,305],[-281,313],[-302,324],[-321,336],[-368,372],[-407,409],[-449,457],[-461,469]]},{"a":19,"b":23,"pts":[[-458,466],[-472,477],[-488,485],[-501,488],[-519,489]]},{"a":19,"b":-1,"pts":[[-514,489],[-536,488],[-557,483],[-628,453],[-639,448],[-657,436],[-670,422],[-678,405],[-679,401],[-680,391],[-678,376],[-677,372],[-669,359]]},{"a":20,"b":23,"pts":[[345,543],[306,564],[272,578],[238,591],[207,600],[175,606],[146,609],[117,609],[88,605],[60,597],[41,589],[15,577],[-33,548],[-56,531],[-75,512],[-86,492],[-91,471],[-92,455],[-89,447]]},{"a":20,"b":21,"pts":[[-92,455],[-89,447],[-82,444],[-57,441],[-31,435],[-14,428],[20,409],[67,374],[147,309],[212,265]]},{"a":20,"b":-1,"pts":[[681,254],[689,266],[699,292],[709,319],[714,340],[714,358],[710,372],[703,385],[693,395],[675,407],[646,422],[611,434],[532,459],[491,474],[394,518],[341,545]]},{"a":21,"b":23,"pts":[[-92,444],[-168,436],[-187,435],[-209,437],[-236,442],[-258,449],[-344,482],[-360,486],[-381,488],[-410,487],[-440,481],[-446,478],[-453,472],[-451,463]]},{"a":23,"b":-1,"pts":[[340,557],[341,567],[340,573],[324,632],[313,662],[288,717],[259,766],[239,792],[215,820],[169,864],[140,887],[110,908],[85,922],[41,942],[-24,965],[-82,982],[-115,987],[-148,987],[-180,984],[-220,974],[-247,965],[-322,928],[-397,904],[-432,891],[-458,878],[-478,863],[-493,848],[-511,825],[-528,796],[-540,765],[-548,729],[-551,692],[-550,655],[-543,615],[-532,572],[-506,500]]}]},"feuilles":[{"cells":[{"id":18,"role":"feuille","shade":0,"w":393,"into":22,"pts":[[-192,-405],[-135,-388],[-116,-380],[-110,-374],[-100,-354],[-71,-244],[-56,-203],[-39,-169],[-21,-142],[21,-98],[16,-81],[4,-78],[-48,-75],[-86,-70],[-130,-61],[-178,-48],[-231,-30],[-443,50],[-531,76],[-611,92],[-685,99],[-737,99],[-766,99],[-852,91],[-953,74],[-969,70],[-979,63],[-978,49],[-960,26],[-900,-35],[-773,-149],[-724,-189],[-633,-258],[-528,-327],[-483,-353],[-441,-372],[-397,-388],[-352,-400],[-283,-409],[-230,-409]]},{"id":22,"role":"feuille2","shade":0,"w":452,"into":18,"pts":[[97,-65],[150,-47],[177,-40],[209,-35],[259,-30],[269,-22],[268,-10],[260,11],[260,46],[279,80],[293,94],[310,105],[414,151],[425,159],[423,174],[334,236],[270,275],[234,293],[171,322],[117,341],[62,358],[1,373],[-122,397],[-184,406],[-248,409],[-333,409],[-397,406],[-454,397],[-532,379],[-598,358],[-630,345],[-703,313],[-759,283],[-809,255],[-886,205],[-932,170],[-966,137],[-990,103],[-994,95],[-997,82],[-987,71],[-975,70],[-879,87],[-778,97],[-683,98],[-628,93],[-578,86],[-529,76],[-476,60],[-226,-31],[-155,-54],[-116,-65],[-65,-74],[-12,-77],[64,-76]]}],"strokes":[{"a":18,"b":22,"pts":[[21,-98],[16,-81],[4,-78],[-48,-75],[-86,-70],[-130,-61],[-173,-49],[-231,-30],[-454,54],[-531,76],[-611,92],[-685,99],[-766,99],[-852,91],[-936,78],[-969,70],[-979,63],[-978,49]]},{"a":18,"b":-1,"pts":[[-979,63],[-978,49],[-972,40],[-940,5],[-870,-62],[-820,-108],[-729,-186],[-633,-258],[-533,-324],[-483,-353],[-441,-372],[-397,-388],[-352,-400],[-307,-407],[-248,-409],[-192,-405],[-135,-388],[-116,-380],[-110,-374],[-100,-354],[-71,-244],[-56,-203],[-39,-169],[-21,-142],[21,-98],[16,-81]]},{"a":22,"b":-1,"pts":[[33,-77],[70,-74],[150,-47],[193,-37],[259,-30],[269,-22],[268,-10],[260,11],[260,46],[279,80],[293,94],[310,105],[414,151],[425,159],[423,174],[334,236],[270,275],[240,291],[166,324],[117,341],[62,358],[-60,386],[-184,406],[-253,409],[-373,408],[-397,406],[-454,397],[-554,373],[-604,356],[-651,337],[-759,283],[-809,255],[-862,221],[-909,188],[-949,154],[-977,123],[-994,95],[-997,82],[-987,71]]}],"base":[425,159]},{"cells":[{"id":1,"role":"feuille","shade":0,"w":502,"into":2,"pts":[[343,-879],[282,-757],[256,-694],[235,-637],[206,-525],[186,-405],[164,-124],[155,-41],[141,35],[125,89],[104,142],[66,209],[28,265],[17,274],[1,271],[-9,261],[-24,233],[-61,146],[-75,126],[-102,97],[-127,75],[-164,48],[-187,36],[-222,22],[-266,16],[-309,20],[-339,30],[-362,42],[-394,63],[-422,87],[-439,94],[-451,76],[-445,36],[-428,-32],[-391,-144],[-352,-234],[-305,-320],[-252,-402],[-188,-484],[-119,-562],[-65,-617],[-9,-669],[120,-774],[192,-828],[332,-926],[355,-920],[354,-901]]},{"id":2,"role":"feuille2","shade":0,"w":423,"into":1,"pts":[[394,-894],[387,-834],[384,-766],[384,-691],[390,-617],[396,-563],[415,-455],[474,-187],[503,-16],[512,67],[515,136],[516,227],[508,358],[500,421],[487,489],[471,557],[437,670],[383,820],[379,829],[354,838],[347,820],[344,729],[338,669],[326,617],[309,568],[280,516],[247,477],[209,445],[177,399],[147,366],[110,341],[32,302],[23,292],[22,279],[87,173],[102,144],[127,82],[145,17],[158,-63],[163,-110],[180,-350],[191,-447],[208,-536],[229,-617],[253,-690],[285,-767],[359,-910],[367,-920],[390,-921],[395,-902]]}],"strokes":[{"a":1,"b":-1,"pts":[[1,271],[-9,261],[-17,246],[-55,157],[-75,126],[-102,97],[-142,63],[-170,45],[-204,28],[-228,20],[-253,16],[-285,16],[-309,20],[-339,30],[-362,42],[-394,63],[-422,87],[-439,94],[-451,76],[-450,64],[-422,-52],[-385,-158],[-352,-234],[-305,-320],[-247,-407],[-188,-484],[-119,-562],[-65,-617],[-14,-664],[49,-718],[120,-774],[192,-828],[332,-926],[355,-920]]},{"a":1,"b":2,"pts":[[332,-926],[355,-920],[354,-901],[308,-812],[256,-694],[220,-585],[204,-519],[191,-445],[181,-357],[165,-131],[155,-41],[143,28],[128,82],[100,148],[73,197],[35,256],[17,274],[1,271],[-9,261]]},{"a":2,"b":-1,"pts":[[367,-920],[390,-921],[395,-902],[387,-834],[384,-766],[384,-691],[391,-610],[404,-516],[416,-449],[474,-187],[492,-92],[504,-9],[512,67],[516,143],[516,227],[508,358],[500,421],[487,489],[471,557],[437,670],[379,829],[354,838],[347,820],[342,702],[333,643],[321,598],[309,568],[280,516],[247,477],[209,445],[177,399],[147,366],[110,341],[41,308],[23,292]]}],"base":[354,838]}]};

  /** Déformation douce : quelques bosses, un léger étirement, une légère rotation. Jamais de pli. */
  function makeWarp(R, amp = 0.07) {
    const bumps = Array.from({ length: 5 }, () => ({ c: [R.range(-0.8, 0.8), R.range(-0.8, 0.8)], d: [R.range(-amp, amp), R.range(-amp, amp)], s: R.range(0.35, 0.6) }));
    const sx = R.range(0.92, 1.08), sy = R.range(0.92, 1.08), a = R.range(-0.12, 0.12);
    const co = Math.cos(a), si = Math.sin(a);
    return ([x, y]) => {
      let X = x, Y = y;
      for (const b of bumps) { const g = Math.exp(-((x - b.c[0]) ** 2 + (y - b.c[1]) ** 2) / (b.s * b.s)); X += b.d[0] * g; Y += b.d[1] * g; }
      X *= sx; Y *= sy;
      return [X * co - Y * si, X * si + Y * co];
    };
  }

  /**
   * Une fleur tirée d'un gabarit. Les zones trop étroites pour l'écart
   * fusionnent avec leur voisine : le trait qui les séparait disparaît.
   */
  function templateFlower(tpl, r, R, sp, col, leaf) {
    const warp = makeWarp(R);
    const unit = (p) => warp([p[0] / 1000, p[1] / 1000]);
    const cellPts = new Map(tpl.cells.map((c) => [c.id, c.pts.map(unit)]));
    const strokePts = tpl.strokes.map((s) => s.pts.map(unit));
    const reach = Math.max(...[...cellPts.values()].flatMap((pts) => pts.map((q) => Math.hypot(q[0], q[1]))));
    const k = r / reach;
    const sc = (pts) => pts.map(([x, y]) => [x * k, y * k]);

    // fusions : la zone la plus étroite d'abord, jusqu'à ce que tout respire
    const parent = new Map(tpl.cells.map((c) => [c.id, c.id]));
    const find = (id) => { while (parent.get(id) !== id) id = parent.get(id); return id; };
    const byId = new Map(tpl.cells.map((c) => [c.id, c]));
    for (const c of [...tpl.cells].sort((a, b) => a.w - b.w)) {
      if ((c.w / 1000) * r >= sp * 1.05 || c.into === -1) continue;
      const root = find(c.into);
      if (root !== find(c.id)) parent.set(find(c.id), root);
    }

    const tint = (c) => {
      const owner = byId.get(find(c.id));
      if (owner.role.startsWith('feuille')) return owner.role === 'feuille2' ? paler(leaf, 0.18) : leaf;
      return owner.shade < 0 ? paler(col, -owner.shade * 0.25) : deeper(col, owner.shade);
    };
    const pieces = [];
    for (const c of tpl.cells) pieces.push(piece(sc(cellPts.get(c.id)), { fill: tint(c), stroke: false }));
    tpl.strokes.forEach((s, i) => {
      if (s.b !== -1 && find(s.a) === find(s.b)) return;
      pieces.push(piece(sc(strokePts[i]), { closed: false }));
    });
    const polys = tpl.cells.map((c) => sc(cellPts.get(c.id)));
    return { pieces, circles: [[0, 0, r]], polys, anchor: [0, 0], cone: null, kind: 'radial', rExit: r * 0.8, maxDeg: 3 };
  }

  /**
   * Les feuilles gabarits, posées pied à l'origine et pointe vers +x,
   * comme la feuille dessinée : on garde leurs ondulations et leur nervure en S.
   */
  const LEAF_TEMPLATES = GABARITS.feuilles.map((tpl) => {
    const pts = tpl.cells.flatMap((c) => c.pts);
    // le pied : le point le plus proche de la fleur d'origine ; la pointe : le plus loin du pied
    const base = tpl.base;
    let tip = pts[0], dm = 0;
    for (const p of pts) { const d = dist(p, base); if (d > dm) { dm = d; tip = p; } }
    const a = Math.atan2(tip[1] - base[1], tip[0] - base[0]);
    const co = Math.cos(-a), si = Math.sin(-a);
    const tf = ([x, y]) => { const X = x - base[0], Y = y - base[1]; return [(X * co - Y * si) / dm, (X * si + Y * co) / dm]; };
    return {
      cells: tpl.cells.map((c) => ({ ...c, pts: c.pts.map(tf) })),
      strokes: tpl.strokes.map((s) => ({ ...s, pts: s.pts.map(tf) })),
    };
  });

  function feuilleGabarit(L, R, sp, col) {
    const tpl = R.pick(LEAF_TEMPLATES);
    const bend = R.range(-0.06, 0.06);
    const tf = ([x, y]) => [x * L, (y + bend * Math.sin(Math.PI * x)) * L];
    const pieces = [];
    for (const c of tpl.cells) pieces.push(piece(c.pts.map(tf), { fill: c.role === 'feuille2' ? paler(col, 0.18) : col, stroke: false }));
    for (const s of tpl.strokes) pieces.push(piece(s.pts.map(tf), { closed: false }));
    const polys = tpl.cells.map((c) => c.pts.map(tf));
    // encombrement : des cercles le long de la nervure, aussi larges que la feuille
    const all = polys.flat();
    const circles = [0.2, 0.42, 0.64, 0.84].map((u) => {
      const near = all.filter((p) => Math.abs(p[0] / L - u) < 0.13);
      const h = Math.max(0.06 * L, ...near.map((p) => Math.abs(p[1])));
      const yc = near.length ? near.reduce((s, p) => s + p[1], 0) / near.length : 0;
      return [u * L, yc, Math.max(h * 0.9, 0.12 * L)];
    });
    return { pieces, circles, polys, anchor: [0, 0], cone: null, kind: 'leaf', rExit: 0, maxDeg: 0 };
  }

  /* Pétales en unités du rayon ; la fleur regarde vers le haut (-y). */
  const P_ = (base, a, len, wid, nb, prio, shade, extra = {}) => ({ base, a, len, wid, nb, prio, shade, ...extra });
  /** Fleurs dessinées de trois-quarts : elles ont un haut et un bas, on les oriente. */
  const TROIS_QUARTS = new Set(['pivoine', 'rose']);

  const LAYERED = {
    rose: { sx: 1.05, sy: 0.95, petals: [
      // la coupe, bord lisse
      P_([0, 0.3], -58, 0.92, 0.95, 1, 0, 1.2, { amp: 0.05 }),
      P_([0, 0.3], 58, 0.92, 0.95, 1, 0, 1.2, { amp: 0.05 }),
      P_([0, 0.3], 0, 1.05, 1.0, 2, 0, 1, { amp: 0.05 }),
      // le cœur enroulé : des pétales de plus en plus petits qui tournent
      P_([0, 0.22], -40, 0.72, 0.7, 1, 1, 1.5, { amp: 0.03, open: 0.9 }),
      P_([0, 0.22], 40, 0.72, 0.7, 1, 1, 1.5, { amp: 0.03, open: 0.9 }),
      P_([0.02, 0.18], -22, 0.58, 0.58, 1, 2, 1.9, { amp: 0.03, open: 0.9 }),
      P_([-0.02, 0.2], 28, 0.5, 0.52, 1, 3, 2.2, { amp: 0.03, open: 0.9 }),
      P_([0, 0.16], -6, 0.36, 0.42, 1, 4, 2.7, { amp: 0.03, open: 0.9 }),
      P_([0.02, 0.14], 12, 0.25, 0.3, 1, 5, 3.1, { amp: 0.02, open: 0.9 }),
      // le devant
      P_([0, 0.85], -38, 0.8, 1.0, 2, 0, 0.2, { amp: 0.06, open: 0.5 }),
      P_([0, 0.85], 38, 0.8, 1.0, 2, 0, 0.2, { amp: 0.06, open: 0.5 }),
      P_([0, 0.95], 0, 0.62, 1.0, 1, 0, -0.4, { amp: 0.06, open: 0.42, waist: 0.48 }),
    ] },
  };

  /* Fleurs de profil : origine au pied, la fleur pousse vers -y. */
  const DOWN = Math.PI / 2;

  function tulipe(r, R, sp, col) {
    const s = r / 1.1;
    const raw = [[0, 0], [-0.55, -0.25], [-0.82, -0.9], [-0.8, -1.5], [-0.72, -2.0], [-0.5, -1.75], [-0.32, -1.55], [-0.17, -1.85], [0, -2.1],
      [0.17, -1.85], [0.32, -1.55], [0.5, -1.75], [0.72, -2.0], [0.8, -1.5], [0.82, -0.9], [0.55, -0.25]];
    const pts = raw.map(([x, y]) => [x * s, y * s]);
    const pieces = [piece(pts, { corners: new Set([0, 4, 6, 8, 10, 12]), fill: col })];
    if (0.28 * s >= sp) {
      for (const k of [-1, 1]) pieces.push(piece([[0.32, -1.55], [0.3, -1.1], [0.22, -0.7], [0.14, -0.42]].map(([x, y]) => [k * x * s, y * s]), { closed: false }));
    }
    return { pieces, circles: [[0, -1.05 * s, 1.1 * s]], polys: [pts], anchor: [0, 0], cone: { dir: DOWN, half: 1.2 }, kind: 'side', rExit: 0, maxDeg: 1, centerOff: 1.05 * s };
  }

  function bouton(r, R, sp, col, leaf) {
    const L = 2 * r, Wd = 0.62 * L;
    const hw = (u) => (Wd / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.8);
    // contour dense, sans lissage : le calice doit tomber pile dessus
    const us = []; for (let u = 0.015; u < 0.995; u += 0.015) us.push(u);
    const right = us.map((u) => [hw(u), -u * L]);
    const left = us.slice().reverse().map((u) => [-hw(u), -u * L]);
    const pts = [[0, 0], ...right, [0, -L], ...left];
    const pieces = [facets(pts, { fill: col })];
    const uc = 0.3, xc = hw(uc);
    if (uc * L >= sp * 1.5 && hw(0.5) >= sp && 0.5 * L - uc * L >= sp * 0.8) {
      const calyx = [[xc, -uc * L], [Wd * 0.12, -0.4 * L], [0, -0.52 * L], [-Wd * 0.12, -0.4 * L], [-xc, -uc * L]];
      // remplissage du calice : échantillonné finement pour épouser le contour lissé
      const side = us.filter((u) => u < uc).map((u) => [hw(u), -u * L]);
      const sepal = [...quadPts(calyx[0], calyx[1], calyx[2], 0.5), ...quadPts(calyx[2], calyx[3], calyx[4], 0.5).slice(1)];
      const cup = [[0, 0], ...side, ...sepal, ...side.slice().reverse().map(([x, y]) => [-x, y])];
      pieces.push(facets(cup, { fill: leaf, stroke: false }));
      pieces.push(facets(sepal, { closed: false }));
    }
    return { pieces, circles: [[0, -0.3 * L, 0.32 * L], [0, -0.68 * L, 0.34 * L]], polys: [pts], anchor: [0, 0], cone: { dir: DOWN, half: 1.0 }, kind: 'side', rExit: 0, maxDeg: 1, centerOff: 0.5 * L };
  }

  /** Pois de senteur : un éventail ondulé, vu de profil. */
  function pois(r, R, sp, col) {
    const rp = r * 0.95, arc = [Math.PI + 0.4, TAU - 0.4];
    const outer = lobed({ n: 3, rp, depth: 0.12, style: 'ruffle', R, arc });
    const pts = [[0, 0], ...outer.pts];
    const corners = new Set([0, ...[...outer.corners].map((i) => i + 1)]);
    const pieces = [piece(pts, { corners, fill: col })];
    const rp2 = rp * 0.55;
    if (outer.rv - rp2 >= sp && rp2 >= sp * 1.4) {
      const inner = lobed({ n: 2, rp: rp2, depth: 0.15, R, arc });
      pieces.push(piece([[0, 0], ...inner.pts], { corners: new Set([0, ...[...inner.corners].map((i) => i + 1)]), fill: deeper(col, 1.5), stroke: false }));
      pieces.push(piece(inner.pts, { closed: false, corners: inner.corners }));
    }
    return { pieces, circles: [[0, -0.45 * r, 0.98 * r]], polys: [pts], anchor: [0, 0], cone: { dir: DOWN, half: 1.0 }, kind: 'side', rExit: 0, maxDeg: 1, centerOff: 0.45 * r };
  }

  /* Fleurs en épi : une hampe, des fleurons de plus en plus petits. */
  const FLORETS = {
    etoile:   (fr, R, sp, col, c) => withCenter(lobed({ n: 5, rp: fr, depth: 0.32, phase: R() * TAU, R, c }), fr, sp, col, c, paler(col, 0.55)),
    croix:    (fr, R, sp, col, c) => withCenter(lobed({ n: 4, rp: fr, depth: 0.35, phase: R() * TAU, R, c }), fr, sp, col, c, null),
    clochette:(fr, R, sp, col, c) => withCenter(lobed({ n: 6, rp: fr, depth: 0.3, style: 'point', phase: R() * TAU, R, c }), fr, sp, col, c, null),
    gueule:   (fr, R, sp, col, c) => withCenter(lobed({ n: 3, rp: fr, depth: 0.3, phase: -Math.PI / 2, R, c }), fr, sp, col, c, null),
    volant:   (fr, R, sp, col, c) => {
      const o = lobed({ n: 3, rp: fr, depth: 0.22, style: 'ruffle', phase: R() * TAU, R, c });
      const out = [piece(o.pts, { corners: o.corners, fill: col })];
      const ri = Math.min(fr * 0.5, o.rv - sp);
      if (ri >= sp * 1.1) { const i = lobed({ n: 3, rp: ri, depth: 0.25, phase: o.a[0] + Math.PI / 3, R, c }); out.push(piece(i.pts, { corners: i.corners, fill: deeper(col, 1.5) })); }
      return { pieces: out, poly: o.pts };
    },
    pois: (fr, R, sp, col, c, side) => {
      const pts = ellipsePts(0, 0, fr, fr * 0.72, 20).map(([x, y]) => { const a = side * 0.35; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; });
      return { pieces: [piece(pts, { fill: col })], poly: pts };
    },
    cloche: (fr, R, sp, col, c, side) => {
      const raw = [[-0.28, -0.95], [-0.5, -0.4], [-0.75, 0.25], [-0.95, 0.75], [-0.63, 0.98], [-0.32, 0.82], [0, 0.98], [0.32, 0.82], [0.63, 0.98], [0.95, 0.75], [0.75, 0.25], [0.5, -0.4], [0.28, -0.95], [0, -1]];
      const a = side * 0.5;
      const tf = ([x, y]) => [c[0] + fr * (x * Math.cos(a) - y * Math.sin(a)), c[1] + fr * (x * Math.sin(a) + y * Math.cos(a))];
      const pts = raw.map(tf);
      const out = [piece(pts, { corners: new Set([0, 3, 5, 7, 9, 12]), fill: col })];
      if (fr * 0.42 >= sp) out.push(piece([[-0.55, 0.45], [0, 0.3], [0.55, 0.45]].map(tf), { closed: false }));
      return { pieces: out, poly: pts };
    },
  };
  function withCenter(o, fr, sp, col, c, centerCol) {
    const out = [piece(o.pts, { corners: o.corners, fill: col })];
    if (centerCol && fr * 0.3 >= sp * 0.8 && o.rv - fr * 0.3 >= sp) out.push(circle(fr * 0.3, c, centerCol));
    return { pieces: out, poly: o.pts };
  }

  function spike(conf, L, wd, R, sp, col) {
    const florets = [];
    const fr0 = wd / 2;
    for (let guard = 0; guard < 60; guard++) {
      const prev = florets[florets.length - 1];
      const y0 = prev ? prev.y : -L * 0.14 - fr0;
      const fr = fr0 * (1 - conf.taper * clamp(-y0 / L, 0, 1));
      if (fr < sp * 1.25) break;
      const side = conf.side || (florets.length % 2 ? 1 : -1);
      const x = side * fr * conf.offset;
      let y = prev ? prev.y : y0;
      while (florets.some((f) => Math.hypot(f.x - x, f.y - y) < f.fr + fr + sp)) y -= 0.5;
      if (y - fr < -L) break;
      florets.push({ x, y, fr, side });
    }
    if (florets.length < 2) return null;
    const pieces = [], polys = [], circles = [];
    const top = florets[florets.length - 1];
    // deux petits boutons en bout de hampe, si la place le permet
    let ty = top.y - top.fr;
    for (let b = 0; b < 2; b++) {
      const fb = Math.max(sp * 0.9, top.fr * (0.6 - b * 0.15));
      const cy = ty - sp - fb * 1.2;
      if (cy - fb * 1.2 < -L * 1.04 || fb < sp * 0.9) break;
      const pts = ellipsePts(0, cy, fb * 0.75, fb * 1.2, 18);
      pieces.push(piece(pts, { fill: paler(col, 0.25) }));
      polys.push(pts);
      circles.push([0, cy, fb * 1.2]);
      ty = cy - fb * 1.2;
    }
    for (const f of florets) {
      const o = FLORETS[conf.floret](f.fr, R, sp, col, [f.x, f.y], f.side);
      pieces.push(...o.pieces);
      polys.push(o.poly);
      circles.push([f.x, f.y, f.fr]);
    }
    const stem = [];
    for (let y = 0; y >= ty; y -= 1) stem.push([0, y]);
    for (const run of clipOutside(stem, polys)) if (dist(run[0], run[run.length - 1]) >= sp * 0.6) pieces.unshift(piece([run[0], run[run.length - 1]], { closed: false }));
    return { pieces, circles, polys, anchor: [0, 0], cone: { dir: DOWN, half: 1.1 }, kind: 'spike', rExit: 0, maxDeg: 1 };
  }

  /* ------------------------------------------------------- CATALOGUE */

  const R_ = (f, n, depth, style = 'round') => ({ f, n, depth, style });
  const FLEURS = {
    pivoine:           { nom: 'Pivoine',             role: 'vedette', ring: { rings: [R_(1, 7, 0.2, 'ruffle'), R_(0.66, 5, 0.22, 'ruffle'), R_(0.38, 4, 0.25)] } },
    rose:              { nom: 'Rose de jardin',      role: 'vedette', ring: { rings: [R_(1, 6, 0.14), R_(0.7, 5, 0.16), R_(0.45, 4, 0.18)], center: { type: 'spiral', f: 0.28, turns: 1.2 } } },
    rose_the:          { nom: 'Rose hybride de thé', role: 'vedette', ring: { rings: [R_(1, 5, 0.1, 'point'), R_(0.68, 4, 0.12, 'point')], center: { type: 'spiral', f: 0.42, turns: 1.6 } } },
    hortensia:         { nom: 'Hortensia',           role: 'vedette', build: hortensia },
    gerbera:           { nom: 'Gerbera',             role: 'vedette', ring: { rings: [R_(1, 16, 0.35)], center: { type: 'disk', f: 0.36, f2: 0.55, dividers: true, color: '#7a5a34', color2: '#4e3a22' } } },
    tournesol:         { nom: 'Tournesol',           role: 'vedette', natural: '#e6b43c', ring: { rings: [R_(1, 14, 0.4, 'point')], center: { type: 'disk', f: 0.42, f2: 0.6, dividers: true, color: '#6b4524', color2: '#4a2f18' } } },
    pavot:             { nom: "Pavot d'Islande",     role: 'vedette', ring: { rings: [R_(1, 4, 0.12, 'ruffle'), R_(0.62, 4, 0.14)], center: { type: 'disk', f: 0.22, f2: 0.45, color: '#2f2a2a', color2: '#6f7a55' } } },
    renoncule:         { nom: 'Renoncule',           role: 'vedette', ring: { rings: [R_(1, 7, 0.12), R_(0.75, 6, 0.12), R_(0.52, 5, 0.14), R_(0.32, 4, 0.16)], center: { type: 'disk', f: 0.14, color: '#55663f' } } },
    dahlia:            { nom: 'Dahlia',              role: 'vedette', ring: { rings: [R_(1, 10, 0.3, 'point'), R_(0.7, 8, 0.3, 'point'), R_(0.45, 6, 0.3, 'point')], center: { type: 'disk', f: 0.16 } } },
    tulipe:            { nom: 'Tulipe',              role: 'vedette', build: tulipe },
    pivoine_arbustive: { nom: 'Pivoine arbustive',   role: 'vedette', ring: { rings: [R_(1, 6, 0.15, 'ruffle'), R_(0.6, 6, 0.2)], center: { type: 'disk', f: 0.3, f2: 0.5, color: '#e8c25a', color2: '#c99a3a' } } },

    delphinium: { nom: 'Delphinium', role: 'hauteur', spike: { floret: 'etoile', offset: 0.3, taper: 0.45 } },
    glaieul:    { nom: 'Glaïeul',    role: 'hauteur', spike: { floret: 'volant', offset: 0.45, taper: 0.45 } },
    muflier:    { nom: 'Muflier',    role: 'hauteur', spike: { floret: 'gueule', offset: 0.4, taper: 0.5 } },
    giroflee:   { nom: 'Giroflée',   role: 'hauteur', spike: { floret: 'croix', offset: 0.35, taper: 0.4 } },
    digitale:   { nom: 'Digitale',   role: 'hauteur', spike: { floret: 'cloche', offset: 0.7, taper: 0.45, side: 1 } },
    lupin:      { nom: 'Lupin',      role: 'hauteur', spike: { floret: 'pois', offset: 0.85, taper: 0.6 } },

    lisianthus:   { nom: 'Lisianthus',      role: 'secondaire', ring: { rings: [R_(1, 5, 0.12), R_(0.6, 5, 0.14)], center: { type: 'spiral', f: 0.3, turns: 1 } } },
    oeillet:      { nom: 'Œillet',          role: 'secondaire', ring: { rings: [R_(1, 7, 0.12, 'frill'), R_(0.66, 6, 0.14, 'frill'), R_(0.38, 4, 0.2)] } },
    pois:         { nom: 'Pois de senteur', role: 'secondaire', build: pois },
    scabieuse:    { nom: 'Scabieuse',       role: 'secondaire', ring: { rings: [R_(1, 9, 0.2, 'ruffle')], center: { type: 'disk', f: 0.45, f2: 0.55 } } },
    zinnia:       { nom: 'Zinnia',          role: 'secondaire', ring: { rings: [R_(1, 12, 0.22), R_(0.68, 9, 0.25)], center: { type: 'disk', f: 0.22, color: '#e0b040' } } },
    chrysantheme: { nom: 'Chrysanthème',    role: 'secondaire', ring: { rings: [R_(1, 18, 0.35, 'point'), R_(0.68, 14, 0.35, 'point'), R_(0.4, 9, 0.3, 'point')] } },
    jacinthe:     { nom: 'Jacinthe',        role: 'secondaire', spike: { floret: 'clochette', offset: 0.3, taper: 0.35 } },

    myosotis: { nom: 'Myosotis', role: 'remplissage', build: myosotis },
  };

  const ROLES = {
    vedette:     { nom: 'Vedettes',    share: 0.55, r: [0.14, 0.21],  min: 0.085, minSp: 3.2 },
    secondaire:  { nom: 'Secondaires', share: 0.2,  r: [0.07, 0.1],   min: 0.05,  minSp: 2.2, L: [0.2, 0.26], wd: 0.08 },
    hauteur:     { nom: 'En hauteur',  share: 0.14, L: [0.28, 0.4], wd: 0.1 },
    remplissage: { nom: 'Remplissage', share: 0.04, r: [0.05, 0.07],  min: 0.04,  minSp: 1.8, max: 3 },
    bouton:      { nom: 'Boutons',     share: 0.04, r: [0.03, 0.042], min: 0.022, minSp: 1.4, max: 4 },
  };

  /** Construit le dessin local d'un élément (même graine → même géométrie). */
  function buildDef(type, size, seed, sp, col, leaf, vue = 'mixte') {
    const R = makeRng(seed);
    if (vue !== 'dessus' && type === 'pivoine') return templateFlower(GABARITS.pivoine, size, R, sp, col, leaf);
    if (vue !== 'dessus' && LAYERED[type]) return layeredFlower(LAYERED[type], size, R, sp, col);
    if (type === 'bouton') return bouton(size, R, sp, col, leaf);
    if (type === 'feuille') return feuilleGabarit(size, R, sp, leaf);
    const F = FLEURS[type];
    if (F.ring) return ringFlower(F.ring, size, R, sp, col);
    if (F.spike) return spike(F.spike, size.L, size.wd, R, sp, col);
    return F.build(size, R, sp, col, leaf);
  }

  /* --------------------------------------------------------- FORMATS */

  const FORMATS = {
    accueil: { nom: "Panneau d'accueil",     axes: 'vh', zone: 'ovale', tailles: [[29.7, 42, 'A3'], [42, 59.4, 'A2'], [40, 60], [50, 70], [60, 80], [70, 100]] },
    arche:   { nom: 'Panneau en arche',      axes: 'v',  zone: 'arche', tailles: [[42, 59.4, 'A2'], [40, 60], [50, 70], [60, 80], [70, 100]] },
    paysage: { nom: 'Panneau à l’horizontale', axes: 'vh', zone: 'ovale', tailles: [[42, 29.7, 'A3'], [60, 40], [80, 50], [100, 40]] },
    fleche:  { nom: 'Flèche directionnelle', axes: 'h',  zone: 'rect',  tailles: [[40, 12], [50, 15], [60, 20], [80, 25]] },
    rond:    { nom: 'Médaillon rond',        axes: 'vh', zone: 'cercle', tailles: [[20, 20, 'Ø 20'], [30, 30, 'Ø 30'], [40, 40, 'Ø 40'], [50, 50, 'Ø 50']] },
  };

  function outlinePoly(format, W, H, sens) {
    if (format === 'arche') {
      const ry = Math.min(W / 2, H * 0.45);
      return [[0, H], ...ellipsePts(W / 2, ry, W / 2, ry, 49, Math.PI, TAU), [W, H]];
    }
    if (format === 'fleche') {
      const p = Math.min(H * 0.5, W * 0.3);
      return sens === 'gauche'
        ? [[p, 0], [W, 0], [W, H], [p, H], [0, H / 2]]
        : [[0, 0], [W - p, 0], [W, H / 2], [W - p, H], [0, H]];
    }
    if (format === 'rond') return ellipsePts(W / 2, H / 2, W / 2, H / 2, 96);
    return [[0, 0], [W, 0], [W, H], [0, H]];
  }

  function reservePoly(kind, cx, cy, rw, rh) {
    if (kind === 'cercle') { const r = Math.min(rw, rh) / 2; return ellipsePts(cx, cy, r, r, 72); }
    if (kind === 'arche') {
      const ry = Math.min(rw / 2, rh * 0.5), x0 = cx - rw / 2, x1 = cx + rw / 2, y1 = cy + rh / 2, yA = cy - rh / 2 + ry;
      return [[x0, y1], ...ellipsePts(cx, yA, rw / 2, ry, 41, Math.PI, TAU), [x1, y1]];
    }
    if (kind === 'rect') {
      const rr = Math.min(rw, rh) * 0.2, x0 = cx - rw / 2 + rr, x1 = cx + rw / 2 - rr, y0 = cy - rh / 2 + rr, y1 = cy + rh / 2 - rr;
      const q = (c, a) => ellipsePts(c[0], c[1], rr, rr, 7, a, a + Math.PI / 2);
      return [...q([x1, y1], 0), ...q([x0, y1], Math.PI / 2), ...q([x0, y0], Math.PI), ...q([x1, y0], Math.PI * 1.5)];
    }
    return ellipsePts(cx, cy, rw / 2, rh / 2, 72);
  }

  /* -------------------------------------------------------- RÉGLAGES */

  const DEFAULTS = {
    v: 1,
    nom: "Panneau d'accueil",
    format: 'accueil', w: 50, h: 70, sens: 'droite',
    texte: [
      { t: 'Bienvenue', s: 'petites', k: 1 },
      { t: 'Quentin & Élisa', s: 'script', k: 1 },
      { t: '19 · 06 · 2027', s: 'caps', k: 0.55 },
      { t: '', s: 'italique', k: 0.7 },
    ],
    fleurs: { pivoine: 'auto', rose: 'auto', delphinium: 'auto', myosotis: 'auto' },
    boutons: true, tiges: true, feuillage: 0.6,
    densite: 0.5, taille: 1, ouverture: 0.6, zone: 'ovale', filetZone: false,
    symetrie: 'miroir', croise: true, cadre: 'tuiles', lignes: 1,
    palette: { nom: 'jardin', fleurs: PALETTES.jardin.fleurs.slice(), feuille: PALETTES.jardin.feuille, tuiles: PALETTES.jardin.tuiles.slice(), cerne: 'or', fond: 'clair' },
    vue: 'mixte',
    cerne: 1.2, ecart: 4,
    graine: 2027,
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  function normalize(s) {
    const d = clone(DEFAULTS), o = { ...d, ...(s || {}) };
    o.palette = { ...d.palette, ...(s && s.palette) };
    o.texte = Array.isArray(o.texte) ? o.texte.slice(0, 4) : d.texte;
    while (o.texte.length < 4) o.texte.push({ t: '', s: 'italique', k: 0.7 });
    o.fleurs = o.fleurs && typeof o.fleurs === 'object' ? o.fleurs : d.fleurs;
    for (const k of ['w', 'h', 'feuillage', 'densite', 'taille', 'ouverture', 'lignes', 'cerne', 'ecart', 'graine']) { const v = Number(o[k]); o[k] = Number.isFinite(v) ? v : d[k]; }
    if (o.w <= 0 || o.h <= 0) { o.w = d.w; o.h = d.h; }
    if (!FORMATS[o.format]) o.format = 'accueil';
    return o;
  }

  /* ------------------------------------------------------- GÉNÉRATION */

  function generate(input) {
    const S = normalize(input);
    const R = makeRng(S.graine);
    const sp = S.ecart + S.cerne;               // écart minimal d'axe à axe entre deux traits
    const W = S.w * 10, H = S.h * 10;
    const pal = S.palette;
    const warnings = [];

    /* ---- contour, cadre, ouverture centrale */
    const outline = outlinePoly(S.format, W, H, S.sens);
    const U0 = Math.min(W, H);
    const marge = clamp(0.03 * U0, 6, 22);
    const band = clamp(0.045 * U0, sp * 1.8, 38);
    const frameLine = inset(outline, marge);
    const inner = ['tuiles', 'filet'].includes(S.cadre) ? inset(outline, marge + band) : frameLine;
    const ib = bbox(inner);
    const U = Math.min(ib.x1 - ib.x0, ib.y1 - ib.y0);

    let bx0 = ib.x0, bx1 = ib.x1;
    if (S.format === 'fleche') { const p = Math.min(H * 0.5, W * 0.3); if (S.sens === 'gauche') bx0 += p * 0.8; else bx1 -= p * 0.8; }
    const zone = S.format === 'rond' && S.zone === 'ovale' ? 'cercle' : S.zone;
    const rcx = (bx0 + bx1) / 2;
    const rcy = S.format === 'arche' ? ib.y0 + (ib.y1 - ib.y0) * 0.55 : (ib.y0 + ib.y1) / 2;
    // une flèche est basse : le texte y prend presque toute la hauteur
    const rhF = S.format === 'fleche' ? Math.min(0.85, S.ouverture + 0.25) : S.ouverture;
    const reserve = reservePoly(zone, rcx, rcy, (bx1 - bx0) * S.ouverture, (ib.y1 - ib.y0) * rhF);
    // largeur de la bande fleurie (entre le texte et le cadre), au plus large
    let bandMax = 0;
    for (let k = 0; k < 72; k++) {
      const d = [Math.cos((k / 72) * TAU), Math.sin((k / 72) * TAU)];
      const hr = rayHit(reserve, [rcx, rcy], d), hi = rayHit(inner, [rcx, rcy], d);
      if (hr && hi) bandMax = Math.max(bandMax, dist(hr, hi));
    }

    /* ---- symétries */
    const ax = FORMATS[S.format].axes;
    const cx = W / 2, cy = H / 2;
    let useV = false, useH = false;
    if (S.symetrie === 'miroir') { if (ax.includes('v')) useV = true; else useH = true; }
    if (S.symetrie === 'quatre') { useV = ax.includes('v'); useH = ax.includes('h'); }
    const syms = [{ pose: (p) => p, pt: (q) => q, shift: 0 }];
    const mv = { pose: (p) => ({ ...p, x: 2 * cx - p.x, th: -p.th, sx: -p.sx }), pt: (q) => [2 * cx - q[0], q[1]], shift: 1 };
    const mh = { pose: (p) => ({ ...p, y: 2 * cy - p.y, th: -p.th, sy: -p.sy }), pt: (q) => [q[0], 2 * cy - q[1]], shift: 1 };
    if (useV) syms.push(mv);
    if (useH) syms.push(mh);
    if (useV && useH) syms.push({ pose: (p) => mh.pose(mv.pose(p)), pt: (q) => mh.pt(mv.pt(q)), shift: 0 });

    /* ---- le monde : tout ce qui est déjà posé */
    const bodies = [];      // cercles d'encombrement {x, y, r, inst}
    const insts = [];       // éléments posés (copies miroir comprises)
    const strokes = [];     // traits ouverts déjà tracés (tiges, lignes de fond)
    const CELL = 12, grid = new Map();
    const gkey = (i, j) => i * 73856093 ^ j * 19349663;
    const addStrokePts = (pts, owner) => {
      for (let i = 0; i < pts.length; i++) {
        const k = gkey(Math.floor(pts[i][0] / CELL), Math.floor(pts[i][1] / CELL));
        let a = grid.get(k);
        if (!a) grid.set(k, (a = []));
        a.push({ p: pts[i], owner });
      }
    };
    const strokeNear = (p, rad, fn) => {
      for (let i = Math.floor((p[0] - rad) / CELL); i <= Math.floor((p[0] + rad) / CELL); i++)
        for (let j = Math.floor((p[1] - rad) / CELL); j <= Math.floor((p[1] + rad) / CELL); j++) {
          const a = grid.get(gkey(i, j));
          if (a) for (const it of a) if (fn(it) === false) return false;
        }
      return true;
    };

    const inside = (p) => inPoly(inner, p) && !inPoly(reserve, p);
    /** Place libre autour de p, une fois l'écart retiré : le rayon maximal d'un élément centré en p. */
    function room(p) {
      if (!inside(p)) return -1;
      let m = Math.min(polyDist(inner, p), polyDist(reserve, p)) - sp;
      for (const b of bodies) { const d = Math.hypot(b.x - p[0], b.y - p[1]) - b.r - sp; if (d < m) m = d; }
      strokeNear(p, m + sp, (it) => { const d = dist(it.p, p) - sp; if (d < m) m = d; });
      return m;
    }
    function circleFits(c, ignoreGroup, ignoreStroke) {
      const p = [c[0], c[1]];
      if (!inside(p) || polyDist(inner, p) < c[2] + sp || polyDist(reserve, p) < c[2] + sp) return false;
      for (const b of bodies) {
        if (b.inst.group === ignoreGroup || Math.hypot(b.x - p[0], b.y - p[1]) >= c[2] + b.r + sp) continue;
        // les cercles se touchent : on regarde le vrai contour, bien plus fin qu'un cercle
        if (b.inst.polys.some((poly) => inPoly(poly, p) || polyDist(poly, p) < c[2] + sp)) return false;
      }
      return strokeNear(p, c[2] + sp, (it) => (ignoreStroke && ignoreStroke(it)) || dist(it.p, p) >= c[2] + sp);
    }

    const poseFn = (ps) => {
      const co = Math.cos(ps.th), si = Math.sin(ps.th);
      return (q) => { const x = q[0] * ps.sx, y = q[1] * ps.sy; return [ps.x + x * co - y * si, ps.y + x * si + y * co]; };
    };
    const poseAngle = (ps, a) => { const f = poseFn({ ...ps, x: 0, y: 0 }); const v = f([Math.cos(a), Math.sin(a)]); return Math.atan2(v[1], v[0]); };

    /** Copies d'une pose par les symétries, sans doublon pour ce qui est posé sur l'axe. */
    function copiesOf(pose) {
      const out = [];
      for (const s of syms) {
        const p = s.pose(pose);
        if (out.some((o) => Math.hypot(o.pose.x - p.x, o.pose.y - p.y) < 0.5)) continue;
        out.push({ pose: p, shift: s.shift, sym: s });
      }
      return out;
    }

    const colorOf = (type, idx) => {
      if (type !== 'feuille' && FLEURS[type] && FLEURS[type].natural && (S.fleurs[type] ?? 'auto') === 'auto') return FLEURS[type].natural;
      return pal.fleurs[((idx % 4) + 4) % 4];
    };

    let group = 0;
    /**
     * Pose un élément et ses reflets, si tous tiennent : dans le cadre, hors
     * de l'ouverture, à l'écart de tout le reste et les uns des autres.
     */
    function tryPlace(type, size, pose, colorIdx, opts = {}) {
      const seed = opts.seed ?? R.seed();
      const def0 = buildDef(type, size, seed, sp, colorOf(type, colorIdx), pal.feuille, S.vue);
      if (!def0) return null;
      const copies = copiesOf(pose);
      const worldCircles = copies.map((cp) => { const f = poseFn(cp.pose); return def0.circles.map((c) => [...f(c), c[2]]); });
      for (const wc of worldCircles) for (const c of wc) if (!circleFits(c, opts.ignoreGroup, opts.ignoreStroke)) return null;
      for (let a = 0; a < worldCircles.length; a++)
        for (let b = a + 1; b < worldCircles.length; b++)
          for (const c1 of worldCircles[a]) for (const c2 of worldCircles[b]) if (Math.hypot(c1[0] - c2[0], c1[1] - c2[1]) < c1[2] + c2[2] + sp) return null;
      if (opts.check && !opts.check(copies, def0)) return null;

      const fixed = S.fleurs[type] !== undefined && S.fleurs[type] !== 'auto';
      const g = ++group;
      const made = copies.map((cp, i) => {
        const shift = S.croise && !fixed ? cp.shift : 0;
        const def = shift ? buildDef(type, size, seed, sp, colorOf(type, colorIdx + shift), pal.feuille, S.vue) : def0;
        const f = poseFn(cp.pose);
        const inst = {
          type, role: opts.role, group: g, primary: i === 0, sym: cp.sym,
          pieces: def.pieces.map((p) => ({ ...p, pts: p.pts.map(f) })),
          polys: def.polys.map((poly) => poly.map(f)),
          circles: worldCircles[i],
          anchor: f(def.anchor),
          cone: def.cone ? { dir: poseAngle(cp.pose, def.cone.dir), half: def.cone.half } : null,
          kind: def.kind, rExit: def.rExit, maxDeg: def.maxDeg, deg: 0, exits: [],
        };
        insts.push(inst);
        for (const c of inst.circles) bodies.push({ x: c[0], y: c[1], r: c[2], inst });
        return inst;
      });
      return { made, area: def0.circles.reduce((s, c) => s + Math.PI * c[2] * c[2], 0) * made.length };
    }

    /* ---- tirage de positions */
    const dom = { x1: useV ? cx : ib.x1, y1: useH ? cy : ib.y1 };
    function samplePoint() {
      for (let k = 0; k < 40; k++) {
        const p = [R.range(ib.x0, dom.x1), R.range(ib.y0, dom.y1)];
        if (inside(p)) return p;
      }
      return null;
    }
    /** Meilleur emplacement parmi quelques tirages : celui qui laisse le plus de place. */
    function bestSpot(rt, rMin) {
      let best = null;
      for (let k = 0; k < 16; k++) {
        const p = samplePoint();
        if (!p) continue;
        let rf = room(p);
        // près d'un axe de symétrie : soit l'élément s'y pose, soit il laisse la place à son reflet
        if (useV && cx - p[0] < rf + sp / 2) { if (cx - p[0] < Math.min(rt, rf) * 0.6) { p[0] = cx; rf = room(p); } else rf = Math.min(rf, cx - p[0] - sp / 2); }
        if (useH && cy - p[1] < rf + sp / 2) { if (cy - p[1] < Math.min(rt, rf) * 0.6) { p[1] = cy; rf = room(p); } else rf = Math.min(rf, cy - p[1] - sp / 2); }
        const r = Math.min(rt, rf);
        if (r < rMin) continue;
        if (!best || r + R() * rMin * 0.4 > best.r) best = { p, r };
      }
      return best;
    }
    /** Direction « vers l'intérieur » depuis le bord le plus proche. */
    function inwardAt(p) {
      let best = Infinity, dir = [0, -1];
      for (let i = 0; i < inner.length; i++) {
        const a = inner[i], b = inner[(i + 1) % inner.length], d = segDist(p, a, b);
        if (d < best) { best = d; const L = dist(a, b) || 1; const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; const s = Math.sign(polyArea(inner)) || 1; dir = [-t[1] * s, t[0] * s]; }
      }
      return dir;
    }
    function tangentAt(p) { const n = inwardAt(p); return [-n[1], n[0]]; }

    const pickColor = (type) => { const v = S.fleurs[type]; return v === undefined || v === 'auto' ? Math.floor(R() * 4) : Number(v); };

    function placeOne(type, role) {
      const RO = ROLES[role];
      const isSpike = type !== 'bouton' && FLEURS[type] && FLEURS[type].spike;
      const col = pickColor(type);
      if (isSpike) {
        const Lr = RO.L || ROLES.hauteur.L, wdf = RO.wd || ROLES.hauteur.wd;
        for (let k = 0; k < 10; k++) {
          const p = samplePoint();
          if (!p) continue;
          const t = tangentAt(p), n = inwardAt(p);
          const d = R() < 0.7 ? (R() < 0.5 ? t : [-t[0], -t[1]]) : n;
          const a = Math.atan2(d[1], d[0]) + R.range(-0.25, 0.25);
          let L = R.range(Lr[0], Lr[1]) * U * S.taille;
          const wd = Math.max(wdf * U * S.taille, sp * 2.8);
          for (let s = 0; s < 4; s++, L *= 0.85) {
            if (L < wd * 2.2) break;
            const res = tryPlace(type, { L, wd }, { x: p[0], y: p[1], th: a + Math.PI / 2, sx: 1, sy: 1 }, col, { role });
            if (res) return res;
          }
        }
        return null;
      }
      const rr = RO.r;
      // sur un petit panneau, la bande fleurie est étroite : les fleurs s'y adaptent
      const fit = Math.min(1, (bandMax * 0.42) / (rr[1] * U * S.taille));
      const rt = R.range(rr[0], rr[1]) * U * S.taille * fit;
      const rMin = Math.max(RO.min * U * S.taille * fit, RO.minSp * sp);
      if (rt < rMin) return null;
      const spot = bestSpot(rt, rMin);
      if (!spot) return null;
      const def = type === 'bouton' || FLEURS[type].build === tulipe || FLEURS[type].build === pois;
      if (def) {
        // fleur de profil : le pied vers le bord, la corolle vers l'intérieur
        const n = inwardAt(spot.p);
        const a = Math.atan2(n[1], n[0]) + R.range(-0.9, 0.9);
        const probe = buildDef(type, spot.r, 1, sp, '#000000', '#000000');
        const off = probe.centerOff;
        const pose = { x: spot.p[0] - Math.cos(a) * off, y: spot.p[1] - Math.sin(a) * off, th: a + Math.PI / 2, sx: R.sign(), sy: 1 };
        return tryPlace(type, spot.r, pose, col, { role });
      }
      const onAxis = (useV && Math.abs(spot.p[0] - cx) < 0.01) || (useH && Math.abs(spot.p[1] - cy) < 0.01);
      let th = onAxis ? 0 : R() * TAU;
      if (TROIS_QUARTS.has(type) && S.vue !== 'dessus') {
        // une fleur de trois-quarts regarde vers l'extérieur, un peu vers le haut
        const out = unit0([spot.p[0] - rcx, spot.p[1] - rcy]);
        const look = unit0([out[0] * 0.7, out[1] - 1.4]);
        th = Math.atan2(look[1], look[0]) + Math.PI / 2 + (onAxis ? 0 : R.range(-0.2, 0.2));
      }
      return tryPlace(type, spot.r, { x: spot.p[0], y: spot.p[1], th, sx: R() < 0.5 && !onAxis ? -1 : 1, sy: 1 }, col, { role });
    }

    /* ---- géométrie du cadre : sert aux tiges qui en partent et aux carreaux */
    const FR = S.cadre === 'aucun' ? null : (() => {
      const n = inner.length, cum = [0];
      for (let i = 0; i < n; i++) cum.push(cum[i] + dist(inner[i], inner[(i + 1) % n]));
      const Lp = cum[n], sA = Math.sign(polyArea(inner)) || 1;
      const at = (s) => {
        s = ((s % Lp) + Lp) % Lp;
        let i = 0;
        while (i < n - 1 && cum[i + 1] <= s) i++;
        const a = inner[i], b = inner[(i + 1) % n], L = cum[i + 1] - cum[i] || 1, t = (s - cum[i]) / L;
        const d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
        return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], out: [d[1] * sA, -d[0] * sA] };
      };
      // départ sur l'axe de symétrie : haut du panneau, ou talon de la flèche
      let startPt = [W / 2, ib.y0];
      if (S.format === 'fleche') startPt = S.sens === 'gauche' ? [ib.x1, H / 2] : [ib.x0, H / 2];
      let s0 = 0, bestD = Infinity;
      for (let i = 0; i < n; i++) {
        const a = inner[i], b = inner[(i + 1) % n], L = cum[i + 1] - cum[i];
        for (let k = 0; k <= 20; k++) { const p = [a[0] + ((b[0] - a[0]) * k) / 20, a[1] + ((b[1] - a[1]) * k) / 20]; const d = dist(p, startPt); if (d < bestD) { bestD = d; s0 = cum[i] + (L * k) / 20; } }
      }
      const corners = [];
      for (let i = 0; i < n; i++) {
        const p0 = inner[(i - 1 + n) % n], p1 = inner[i], p2 = inner[(i + 1) % n];
        const t = angDiff(Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), Math.atan2(p2[1] - p1[1], p2[0] - p1[0]));
        if (t > 0.45) corners.push(i);
      }
      const nearCorner = (s, m) => corners.some((i) => { const d = Math.abs((((s - cum[i]) % Lp) + Lp + Lp / 2) % Lp - Lp / 2); return d < m; });
      const nU = Math.max(4, Math.round(Lp / clamp(U0 * 0.16, sp * 6, 170) / 4) * 4);
      return { n, cum, Lp, at, s0, corners, nearCorner, nU, u: Lp / nU };
    })();

    /* ---- remplissage : les vedettes d'abord, posées librement */
    const chosen = Object.keys(S.fleurs).filter((k) => FLEURS[k]);
    const byRole = {};
    for (const k of chosen) (byRole[FLEURS[k].role] = byRole[FLEURS[k].role] || []).push(k);
    if (S.boutons) byRole.bouton = ['bouton'];
    const freeArea = Math.abs(polyArea(inner)) - Math.abs(polyArea(reserve));
    const target = freeArea * clamp(S.densite, 0.1, 0.8);
    // les épis ont besoin de longs couloirs libres : ils passent juste après les vedettes
    const roles = ['vedette', 'hauteur', 'secondaire', 'remplissage', 'bouton'].filter((r) => byRole[r]);
    const shareSum = roles.reduce((s, r) => s + ROLES[r].share, 0);
    function fillRole(role, place) {
      const goal = (target * ROLES[role].share) / shareSum;
      let covered = 0, fails = 0, placed = 0;
      const max = ROLES[role].max || Infinity;
      while (covered < goal && fails < 30 && placed < max) {
        const res = place(R.pick(byRole[role]), role);
        if (res) { covered += res.area; placed++; } else fails++;
      }
    }

    /* ---- tiges : outils communs */
    const stems = [];
    const unit = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
    const mul = (v, k) => [v[0] * k, v[1] * k];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const tangentOf = (pts, i) => unit([pts[Math.min(pts.length - 1, i + 2)][0] - pts[Math.max(0, i - 2)][0], pts[Math.min(pts.length - 1, i + 2)][1] - pts[Math.max(0, i - 2)][1]]);

    /** Courbe d'Hermite dense de a à b, avec les tangentes ta et tb. */
    function hermite(a, ta, b, tb) {
      const n = Math.max(6, Math.ceil((dist(a, b) + 0.3 * (Math.hypot(...ta) + Math.hypot(...tb))) / 1));
      const out = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, t2 = t * t, t3 = t2 * t;
        const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
        out.push([h00 * a[0] + h10 * ta[0] + h01 * b[0] + h11 * tb[0], h00 * a[1] + h10 * ta[1] + h01 * b[1] + h11 * tb[1]]);
      }
      return out;
    }

    /** Vérifie qu'un trait passe au large de tout, sauf de ce qu'il relie. */
    function strokeClear(run, { ends = [], frameHead = false, frameTail = false, ignore = [] } = {}) {
      const nH = sp * 2.5;
      for (let i = 0; i < run.length; i++) {
        const q = run[i];
        const head = frameHead && i < nH, tail = frameTail && i > run.length - 1 - nH;
        if (!head && !tail && (!inPoly(inner, q) || polyDist(inner, q) < sp)) return false;
        if (inPoly(reserve, q) || polyDist(reserve, q) < sp) return false;
        for (const b of bodies) if (!ends.includes(b.inst) && Math.hypot(b.x - q[0], b.y - q[1]) < b.r + sp) return false;
        const free = ends.some((e) => dist(q, e.anchor) < e.rExit + sp * 2.2) || ignore.some((z) => dist(q, z.p) < z.r);
        if (!free && !strokeNear(q, sp, (it) => dist(it.p, q) >= sp)) return false;
      }
      return true;
    }
    function exitOk(inst, ang) {
      if (!inst || inst.kind !== 'radial') return true;
      const need = Math.max(0.55, (1.6 * sp) / Math.max(inst.rExit, 1));
      return inst.exits.every((e) => angDiff(e, ang) >= need);
    }
    /** Reflets d'un trait par les symétries ; null si deux reflets se frôlent. */
    function runCopies(run) {
      const near = (a, b) => dist(a, b) < 0.6;
      const last = (r) => r[r.length - 1];
      const copies = [];
      for (const s of syms) {
        const r2 = run.map(s.pt);
        if (copies.some((c) => (near(c.run[0], r2[0]) && near(last(c.run), last(r2))) || (near(c.run[0], last(r2)) && near(last(c.run), r2[0])))) continue;
        copies.push({ run: r2, s });
      }
      for (let i = 1; i < copies.length; i++) {
        const ends = [copies[i].run[0], last(copies[i].run)];
        for (let k = 0; k < copies[i].run.length; k += 2) {
          const q = copies[i].run[k];
          if (ends.some((e) => dist(e, q) < sp * 2.5)) continue;
          for (let j = 0; j < i; j++) if (copies[j].run.some((p) => dist(p, q) < sp)) return null;
        }
      }
      return copies;
    }
    const twin = (inst, s) => (s === syms[0] ? inst : insts.find((o) => o.group === inst.group && dist(o.anchor, s.pt(inst.anchor)) < 0.5) || inst);
    function commitRun(copies, A, B, kind) {
      for (const c of copies) {
        const a2 = A && twin(A, c.s), b2 = B && twin(B, c.s);
        const pts = c.run;
        stems.push({ pts, A: a2, B: b2, kind, primary: c.s === syms[0] });
        addStrokePts(pts, stems.length - 1);
        const first = pts[0], last = pts[pts.length - 1];
        if (a2) { a2.deg++; a2.exits.push(Math.atan2(first[1] - a2.anchor[1], first[0] - a2.anchor[0])); }
        if (b2) { b2.deg++; b2.exits.push(Math.atan2(last[1] - b2.anchor[1], last[0] - b2.anchor[0])); }
      }
    }

    /* ---- la liane : une ligne médiane fait le tour de l'ouverture */
    const gc = [rcx, rcy];
    const angleOf = (p) => Math.atan2(p[1] - gc[1], p[0] - gc[0]);
    const GN = 180, guide = [];
    for (let k = 0; k < GN; k++) {
      const a = (k / GN) * TAU, d = [Math.cos(a), Math.sin(a)];
      const hr = rayHit(reserve, gc, d) || gc, hi = rayHit(inner, gc, d) || hr;
      guide.push([(hr[0] + hi[0]) / 2, (hr[1] + hi[1]) / 2]);
    }
    const gIndex = (a) => ((Math.round(((((a % TAU) + TAU) % TAU) / TAU) * GN) % GN) + GN) % GN;
    /** Sens de la liane (angle croissant autour du centre) au droit du point p. */
    const guideTan = (p) => { const k = gIndex(angleOf(p)); return unit([guide[(k + 3) % GN][0] - guide[(k - 3 + GN) % GN][0], guide[(k + 3) % GN][1] - guide[(k - 3 + GN) % GN][1]]); };

    function tryVine(A, B) {
      const a = A.anchor, b = B.anchor, len = dist(a, b);
      if (len > U * 0.8 || len < A.rExit + B.rExit + sp * 2) return false;
      let da = angleOf(b) - angleOf(a);
      while (da <= -Math.PI) da += TAU;
      while (da > Math.PI) da -= TAU;
      const dir = Math.sign(da) || 1;
      const ta = mul(guideTan(a), dir), tb = mul(guideTan(b), dir);
      const midA = angleOf(a) + da / 2;
      const gm = guide[gIndex(midA)];
      for (const k of [0.9, 0.6, 1.25]) for (const off of [0, 0.12, -0.12]) {
        let dense;
        if (!off) dense = hermite(a, mul(ta, len * k), b, mul(tb, len * k));
        else {
          const nIn = unit([gc[0] - gm[0], gc[1] - gm[1]]);
          const m = add(gm, mul(nIn, off * U));
          const tm = mul(guideTan(m), dir * len * 0.5 * k);
          dense = [...hermite(a, mul(ta, len * 0.5 * k), m, tm), ...hermite(m, tm, b, mul(tb, len * 0.5 * k)).slice(1)];
        }
        const runs = clipOutside(dense, [...A.polys, ...B.polys]);
        if (runs.length !== 1 || runs[0].length < sp * 2) continue;
        const run = runs[0], last = run[run.length - 1];
        if (!exitOk(A, Math.atan2(run[0][1] - a[1], run[0][0] - a[0])) || !exitOk(B, Math.atan2(last[1] - b[1], last[0] - b[0]))) continue;
        if (!strokeClear(run, { ends: [A, B] })) continue;
        const copies = runCopies(run);
        if (!copies) continue;
        commitRun(copies, A, B, 'vine');
        return true;
      }
      return false;
    }

    /** Relie une fleur au cadre par une tige qui en sort d'équerre. */
    function tryFrameStem(B) {
      if (!FR) return false;
      const n = inwardAt(B.anchor);
      const P = rayHit(inner, B.anchor, [-n[0], -n[1]]);
      if (!P) return false;
      for (const twist of [0, 0.35, -0.35]) {
        const start = rayHit(inner, B.anchor, rot([-n[0], -n[1]], twist)) || P;
        const len = dist(start, B.anchor);
        if (len > U * 0.45) continue;
        const dense = hermite(start, mul(n, len * 0.9), B.anchor, mul(unit([B.anchor[0] - start[0], B.anchor[1] - start[1]]), len * 0.5));
        const runs = clipOutside(dense, B.polys);
        if (runs.length !== 1 || runs[0].length < sp * 2) continue;
        const run = runs[0], last = run[run.length - 1];
        if (!exitOk(B, Math.atan2(last[1] - B.anchor[1], last[0] - B.anchor[0]))) continue;
        if (!strokeClear(run, { ends: [B], frameHead: true })) continue;
        const copies = runCopies(run);
        if (!copies) continue;
        commitRun(copies, null, B, 'frame');
        return true;
      }
      return false;
    }

    /**
     * Fait pousser un élément au bout d'une petite branche : sur une tige
     * existante le plus souvent, sinon depuis le cadre.
     */
    function placeOnBranch(type, role) {
      const RO = ROLES[role];
      const col = pickColor(type);
      const isSpike = type !== 'bouton' && FLEURS[type] && FLEURS[type].spike;
      const isSide = type === 'bouton' || FLEURS[type].build === tulipe || FLEURS[type].build === pois;
      for (let tries = 0; tries < 14; tries++) {
        const hosts = stems.filter((s) => s.primary && s.kind !== 'branch' && s.pts.length > sp * 8);
        let P, T, host = null;
        if (hosts.length && (R() < 0.85 || !FR)) {
          const st = R.pick(hosts);
          const i = Math.floor(R.range(0.2, 0.8) * (st.pts.length - 1));
          P = st.pts[i];
          T = mul(tangentOf(st.pts, i), R.sign());
          host = st;
        } else if (FR) {
          const s = R() * FR.Lp;
          if (FR.nearCorner(s, band + sp * 3)) continue;
          const q = FR.at(s);
          P = q.p;
          T = [-q.out[0], -q.out[1]];
        } else return null;
        const side = R.sign();
        // la branche quitte la tige franchement, puis s'incurve vers sa fleur
        const T0 = host ? rot(T, side * R.range(0.6, 0.9)) : T;
        const dirE = host ? rot(T, side * R.range(0.9, 1.5)) : rot(T, R.range(-0.5, 0.5));
        let size, reachOut;
        if (isSpike) {
          const Lr = RO.L || ROLES.hauteur.L, wdf = RO.wd || ROLES.hauteur.wd;
          size = { L: R.range(Lr[0], Lr[1]) * U * S.taille, wd: Math.max(wdf * U * S.taille, sp * 2.8) };
          reachOut = 0;
        } else {
          const r = Math.max(R.range(RO.r[0], RO.r[1]) * U * S.taille, RO.minSp * sp);
          size = r;
          reachOut = isSide ? 0 : r * 0.9;
        }
        const Lb = host ? sp * R.range(2, 3.2) + (isSpike ? 0 : (isSide ? size * 0.3 : size * 0.5)) : R.range(0.06, 0.16) * U + sp * 2;
        const E = add(P, add(mul(T0, Lb * 0.45), mul(dirE, Lb * 0.6)));
        const C = add(E, mul(dirE, reachOut));
        const th = Math.atan2(dirE[1], dirE[0]) + Math.PI / 2;
        const pose = { x: C[0], y: C[1], th: isSide || isSpike || TROIS_QUARTS.has(type) ? th : R() * TAU, sx: isSide ? R.sign() : 1, sy: 1 };
        let pending = null;
        const res = tryPlace(type, size, pose, col, {
          role,
          check: (copies, def) => {
            const f = poseFn(copies[0].pose);
            const polys = def.polys.map((p) => p.map(f));
            const end = isSide || isSpike ? f(def.anchor) : C;
            const dense = hermite(P, mul(T0, Lb * 0.9), end, mul(dirE, Lb * 0.9));
            const runs = isSide || isSpike ? [dense] : clipOutside(dense, polys);
            if (runs.length !== 1 || runs[0].length < sp * 1.2) return false;
            if (!strokeClear(runs[0], { frameHead: !host, ignore: host ? [{ p: P, r: sp * 2.5 }] : [] })) return false;
            pending = runCopies(runs[0]);
            return !!pending;
          },
        });
        if (res) { commitRun(pending, null, res.made[0], 'branch'); return res; }
      }
      return null;
    }

    if (byRole.vedette) fillRole('vedette', placeOne);
    if (S.tiges) {
      // la liane enfile les vedettes dans l'ordre où on les rencontre autour du texte
      const hubs = insts.filter((i) => i.role === 'vedette' && i.kind === 'radial').sort((a, b) => angleOf(a.anchor) - angleOf(b.anchor));
      if (hubs.length > 1) for (let k = 0; k < hubs.length; k++) {
        const A = hubs[k], B = hubs[(k + 1) % hubs.length];
        if (A === B || (!A.primary && !B.primary)) continue;
        if (stems.some((s) => (s.A === A && s.B === B) || (s.A === B && s.B === A))) continue;
        // deux fleurs qui se touchent presque forment déjà un bouquet : pas besoin de tige
        const gap = dist(A.anchor, B.anchor) - A.rExit / 0.85 - B.rExit / 0.85;
        if (gap < sp * 3) { A.deg++; B.deg++; continue; }
        tryVine(A, B);
      }
      for (const A of insts.filter((i) => i.role === 'vedette' && i.primary && i.deg === 0)) tryFrameStem(A);
      for (const role of roles) if (role !== 'vedette') fillRole(role, placeOnBranch);
      // quelques tiges venues du cadre rejoignent la liane
      if (FR && S.lignes > 0) {
        const want = S.lignes >= 2 ? 6 : 3;
        let made = 0;
        for (let k = 0; k < FR.nU && made < want; k += 2) {
          const s = FR.s0 + k * FR.u;
          if (FR.nearCorner(s, band + sp * 3)) continue;
          const q = FR.at(s), nIn = [-q.out[0], -q.out[1]];
          const vines = stems.filter((st) => st.kind === 'vine');
          let best = null;
          for (const st of vines) for (let i = Math.round(sp * 3); i < st.pts.length - sp * 3; i += 3) {
            const d = dist(st.pts[i], q.p);
            if (d < sp * 5 || d > U * 0.3) continue;
            const v = unit([st.pts[i][0] - q.p[0], st.pts[i][1] - q.p[1]]);
            if (v[0] * nIn[0] + v[1] * nIn[1] < 0.6) continue;
            if (!best || d < best.d) best = { d, st, i };
          }
          if (!best) continue;
          const Q = best.st.pts[best.i], Tq = tangentOf(best.st.pts, best.i);
          const toQ = unit([Q[0] - q.p[0], Q[1] - q.p[1]]);
          // arrivée en biais sur la liane, jamais tangente : pas de pointe trop fine
          const tq = rot(Tq, (Tq[0] * toQ[1] - Tq[1] * toQ[0] > 0 ? 1 : -1) * 0.75);
          const tIn = (tq[0] * toQ[0] + tq[1] * toQ[1]) < 0 ? mul(tq, -1) : tq;
          const run = hermite(q.p, mul(nIn, best.d * 0.8), Q, mul(tIn, best.d * 0.6));
          if (!strokeClear(run, { frameHead: true, ignore: [{ p: Q, r: sp * 3 }] })) continue;
          const copies = runCopies(run);
          if (!copies) continue;
          commitRun(copies, null, null, 'frame');
          made++;
        }
      }
      // ce qui n'a pu être relié à rien disparaît : pas de fleur posée au hasard
      const lonely = new Set(insts.filter((i) => i.kind !== 'leaf').map((i) => i.group));
      for (const i of insts) if (i.deg > 0) lonely.delete(i.group);
      if (lonely.size) {
        for (let k = insts.length - 1; k >= 0; k--) if (lonely.has(insts[k].group)) insts.splice(k, 1);
        for (let k = bodies.length - 1; k >= 0; k--) if (lonely.has(bodies[k].inst.group)) bodies.splice(k, 1);
      }
    } else {
      for (const role of roles) if (role !== 'vedette') fillRole(role, placeOne);
    }
    if (!insts.length) warnings.push("Aucune fleur n'a trouvé sa place : agrandis le panneau, réduis l'ouverture ou l'écart minimal.");

    /* ---- feuilles : elles poussent le long des tiges, dans le sens de la tige */
    const leafLen = () => Math.max(R.range(0.09, 0.14) * U * S.taille, sp * R.range(4.5, 5.5));
    const minLeaf = sp * 3.5;
    function placeLeaf(P, ang, side) {
      const mirrorsOfP = syms.map((s) => s.pt(P));
      let L = leafLen();
      for (let s = 0; s < 3 && L >= minLeaf; s++, L *= 0.82) {
        const reach = L * 0.45;
        const res = tryPlace('feuille', L, { x: P[0], y: P[1], th: ang, sx: 1, sy: side }, 0, {
          ignoreStroke: (it) => mirrorsOfP.some((m) => dist(it.p, m) < reach),
        });
        if (res) return true;
      }
      return false;
    }
    if (S.feuillage > 0) {
      for (const st of stems.filter((s) => s.primary)) {
        const n = st.pts.length;
        if (n < sp * 5) continue;
        const gap = clamp(U * 0.13, sp * 6, 110);
        const want = Math.max(1, Math.round((n / gap) * 1.6 * S.feuillage));
        // une branche pousse vers sa fleur ; une liane, dans un sens ou l'autre
        const grow = st.kind === 'vine' ? R.sign() : 1;
        const spots = [];
        for (let d = sp * 2.5; d < n - sp * 2.5; d += sp * 1.5) spots.push(Math.round(d));
        for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
        let placed = 0, side = R.sign();
        for (const i of spots) {
          if (placed >= want) break;
          const T = mul(tangentOf(st.pts, i), grow), base = Math.atan2(T[1], T[0]);
          for (const sd of [side, -side]) {
            if (placeLeaf(st.pts[i], base + sd * R.range(0.5, 0.85), sd)) { placed++; side = -sd; break; }
          }
        }
      }
    }

    /* ---- cadre : filets et carreaux colorés */
    const framePieces = [], tileFills = [];
    if (FR) {
      framePieces.push(piece(frameLine, { corners: new Set(frameLine.map((_, i) => i)) }));
      if (S.cadre !== 'simple') framePieces.push(piece(inner, { corners: new Set(inner.map((_, i) => i)) }));
      if (S.format === 'arche' || S.format === 'rond') { framePieces.forEach((p) => { p.corners = new Set(S.format === 'arche' ? [0, p.pts.length - 1] : []); }); }
      const { n, cum, Lp, at, s0, corners, nearCorner, nU, u } = FR;
      const bandW = S.cadre === 'simple' ? 0 : band;

      if (S.cadre === 'tuiles') {
        for (const i of corners) {
          const p0 = inner[(i - 1 + n) % n], p1 = inner[i], p2 = inner[(i + 1) % n];
          const d1 = [p1[0] - p0[0], p1[1] - p0[1]], l1 = Math.hypot(...d1), d2 = [p1[0] - p2[0], p1[1] - p2[1]], l2 = Math.hypot(...d2);
          const h1 = rayHit(frameLine, p1, [d1[0] / l1, d1[1] / l1]), h2 = rayHit(frameLine, p1, [d2[0] / l2, d2[1] / l2]);
          if (!h1 || !h2) continue;
          framePieces.push(segment(p1, h1), segment(p1, h2));
          tileFills.push(facets([p1, h1, frameLine[i], h2], { fill: pal.tuiles[0], stroke: false }));
        }
        const a = clamp(band, sp, u * 0.35), A = u - a;
        const divider = (s) => { const q = at(s), o = rayHit(frameLine, q.p, q.out); if (o) framePieces.push(segment(q.p, o)); return o; };
        for (let k = 0; k < nU; k++) {
          const sA0 = s0 + A / 2 + k * u, sB = sA0 + a;
          if (nearCorner(sA0, band + sp) || nearCorner(sB, band + sp) || nearCorner((sA0 + sB) / 2, band + sp)) continue;
          const qa = at(sA0), qb = at(sB);
          const oa = divider(sA0), ob = divider(sB);
          if (!oa || !ob) continue;
          const inPts = [qa.p], outPts = [oa];
          for (let i = 0; i < n; i++) {
            const ci = cum[i], rel = (((ci - sA0) % Lp) + Lp) % Lp;
            if (rel > 0 && rel < a) { const q = at(ci + 0.01); inPts.push(inner[i]); outPts.push([inner[i][0] + q.out[0] * bandW, inner[i][1] + q.out[1] * bandW]); }
          }
          inPts.push(qb.p); outPts.push(ob);
          const tc = Math.min(k, nU - 1 - k) % 2;
          tileFills.push(facets([...inPts, ...outPts.reverse()], { fill: pal.tuiles[tc], stroke: false }));
        }
        // un séparateur au milieu des grands carreaux, comme dans un vrai vitrail
        for (let k = 1; k < nU; k += 2) if (!nearCorner(s0 + k * u, band + sp * 2)) divider(s0 + k * u);
      }
    }

    /* ---- texte */
    const textLines = S.texte.filter((l) => l && String(l.t || '').trim());
    const rb = bbox(reserve);
    const resH = rb.y1 - rb.y0;
    const blocks = textLines.map((l) => {
      const st = TEXT_STYLES[l.s] || TEXT_STYLES.caps;
      return { text: st.upper ? String(l.t).toUpperCase() : String(l.t), style: l.s in TEXT_STYLES ? l.s : 'caps', size: resH * 0.12 * st.k * clamp(Number(l.k) || 1, 0.3, 2) };
    });
    const lineH = (b) => b.size * (TEXT_STYLES[b.style].lh || 1.15);
    let totalH = blocks.reduce((s, b) => s + lineH(b), 0);
    if (totalH > resH * 0.82) { const f = (resH * 0.82) / totalH; blocks.forEach((b) => { b.size *= f; }); totalH *= f; }
    const widthOf = (b) => (S.__measure ? S.__measure(b.text, b.style, b.size) : b.text.length * b.size * 0.55);
    // sur une flèche, le texte grandit jusqu'à occuper l'ouverture
    if (S.format === 'fleche' && blocks.length && S.__measure) {
      const rw = (rb.x1 - rb.x0) * 0.86;
      const f = Math.min(2.5, (resH * 0.8) / totalH, ...blocks.map((b) => rw / widthOf(b)));
      if (f > 1) { blocks.forEach((b) => { b.size *= f; }); totalH *= f; }
    }
    let y = rcy - totalH / 2;
    for (const b of blocks) {
      const h = lineH(b);
      b.y = y + h * 0.72;
      const avail = chordAt(reserve, y + h / 2) * 0.86;
      const w = widthOf(b);
      if (w > avail && avail > 0) { b.size *= avail / w; if (w > avail * 1.25) warnings.push(`Le texte « ${b.text} » a été réduit pour tenir dans l'ouverture.`); }
      y += h;
    }

    const flowers = insts.filter((i) => i.type !== 'feuille');
    return {
      S, W, H, sp, outline, frameLine, inner, reserve, zone, rcx,
      insts, stems, framePieces, tileFills, blocks, warnings,
      stats: {
        fleurs: flowers.length,
        feuilles: insts.length - flowers.length,
        tiges: stems.length,
        parType: flowers.reduce((m, i) => { m[i.type] = (m[i.type] || 0) + 1; return m; }, {}),
      },
    };
  }

  const TEXT_STYLES = {
    caps:     { nom: 'Capitales',          family: "'Cormorant Garamond', Georgia, serif", weight: 500, upper: true, ls: 0.14, k: 1 },
    petites:  { nom: 'Petites capitales',  family: "'Cormorant Garamond', Georgia, serif", weight: 500, upper: true, ls: 0.32, k: 0.55 },
    script:   { nom: 'Calligraphie',       family: "'Pinyon Script', cursive", weight: 400, ls: 0, k: 1.9, lh: 1.2 },
    italique: { nom: 'Italique',           family: "'Cormorant Garamond', Georgia, serif", weight: 500, italic: true, ls: 0.02, k: 0.9 },
  };
  const textAttrs = (style, size) => {
    const st = TEXT_STYLES[style];
    return `font-family="${st.family.replace(/"/g, "'")}" font-size="${fmt(size)}" font-weight="${st.weight}"${st.italic ? ' font-style="italic"' : ''}${st.ls ? ` letter-spacing="${fmt(st.ls * size)}"` : ''}`;
  };

  /* ------------------------------------------------------------ RENDU */

  const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Pinyon+Script&display=swap');";

  function render(input, { mode = 'vitrail', measure } = {}) {
    const g = generate({ ...input, __measure: measure });
    const { S, W, H } = g;
    const cerneCol = CERNES[S.palette.cerne] || CERNES.or;
    const ink = mode === 'vitrail' ? cerneCol : '#161412';
    const sw = mode === 'gabarit' ? 0.35 : S.cerne;

    const all = [...g.tileFills, ...g.stems.map((s) => piece(thin(s.pts), { closed: false })), ...g.framePieces];
    // feuilles d'abord, fleurs ensuite : dans l'ordre où l'œil les lit
    const ordered = [...g.insts.filter((i) => i.type === 'feuille'), ...g.insts.filter((i) => i.type !== 'feuille')];
    for (const i of ordered) all.push(...i.pieces);

    const fills = [], strokes = [];
    for (const p of all) {
      const d = pathD(p);
      if (!d) continue;
      if (p.fill && p.closed && mode === 'vitrail') fills.push(`<path d="${d}" fill="${p.fill}"/>`);
      if (p.stroke) strokes.push(`<path d="${d}"/>`);
    }
    if (S.filetZone) strokes.push(`<path d="${pathD(piece(g.reserve))}"/>`);

    const out = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(W)} ${fmt(H)}" width="${fmt(W)}mm" height="${fmt(H)}mm">`);
    out.push(`<title>${esc(S.nom || 'Signalétique')}</title>`);
    out.push(`<defs><style>${FONT_IMPORT}</style></defs>`);
    const plexi = `M${g.outline.map(pt).join('L')}Z`;
    if (mode === 'vitrail') {
      const fond = FONDS[S.palette.fond] ?? FONDS.clair;
      out.push(`<path d="${plexi}" fill="${fond === 'none' ? '#ffffff' : fond}" fill-opacity="${fond === 'none' ? 0.35 : 1}" stroke="#c9c1b3" stroke-width="0.6"/>`);
      // opacité de groupe : les pétales qui se recouvrent ne se mélangent pas
      out.push(`<g stroke="none" opacity="0.88">${fills.join('')}</g>`);
    } else {
      out.push(`<path d="${plexi}" fill="#ffffff" stroke="#9a948a" stroke-width="0.3" stroke-dasharray="3 2"/>`);
    }
    out.push(`<g fill="none" stroke="${ink}" stroke-width="${fmt(sw)}" stroke-linecap="round" stroke-linejoin="round">${strokes.join('')}</g>`);
    if (g.blocks.length) {
      out.push(`<g fill="${ink}" text-anchor="middle">`);
      for (const b of g.blocks) out.push(`<text x="${fmt(g.rcx)}" y="${fmt(b.y)}" ${textAttrs(b.style, b.size)}>${esc(b.text)}</text>`);
      out.push('</g>');
    }
    out.push('</svg>');
    return { svg: out.join(''), W, H, stats: g.stats, warnings: [...new Set(g.warnings)], settings: S };
  }

  /** Planche d'essai : une fleur seule, à plat, pour régler son dessin. */
  function specimen(type, { r = 50, ecart = 4, cerne = 1.2, col = '#e0b3ae', leaf = '#a3b08f', mode = 'vitrail', vue = 'mixte', seed = 7 } = {}) {
    const sp = ecart + cerne;
    const size = FLEURS[type] && FLEURS[type].spike ? { L: r * 3, wd: r } : r;
    const def = buildDef(type, size, seed, sp, col, leaf, vue);
    if (!def) return '';
    const bb = bbox(def.pieces.flatMap((p) => p.pts)), m = 6;
    const fills = [], strokes = [];
    for (const p of def.pieces) {
      const d = pathD(p);
      if (p.fill && p.closed && mode === 'vitrail') fills.push(`<path d="${d}" fill="${p.fill}"/>`);
      if (p.stroke) strokes.push(`<path d="${d}"/>`);
    }
    const ink = mode === 'vitrail' ? CERNES.or : '#161412';
    const vb = [bb.x0 - m, bb.y0 - m, bb.x1 - bb.x0 + 2 * m, bb.y1 - bb.y0 + 2 * m].map(fmt).join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><g opacity="0.88">${fills.join('')}</g>`
      + `<g fill="none" stroke="${ink}" stroke-width="${cerne}" stroke-linecap="round" stroke-linejoin="round">${strokes.join('')}</g></svg>`;
  }

  return { render, generate, specimen, normalize, DEFAULTS, FLEURS, ROLES, FORMATS, PALETTES, CERNES, FONDS, TEXT_STYLES, clone };
})();

window.Vitrail = Vitrail;
