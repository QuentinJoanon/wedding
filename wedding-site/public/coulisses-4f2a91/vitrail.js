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

  /** Feuille en amande, du pied (origine) vers +x, avec sa nervure si elle a la place. */
  function feuille(L, R, sp, col) {
    const Wd = L * 0.36 * R.range(0.9, 1.1);
    const bend = R.range(-0.07, 0.07) * L;
    const by = (x) => bend * Math.sin((Math.PI * x) / L);
    const prof = [[0.18, 0.36], [0.42, 0.5], [0.68, 0.4], [0.88, 0.18]];
    const top = prof.map(([u, w]) => [u * L, by(u * L) - w * Wd]);
    const bot = prof.slice().reverse().map(([u, w]) => [u * L, by(u * L) + w * Wd]);
    const pts = [[0, 0], ...top, [L, 0], ...bot];
    const pieces = [piece(pts, { corners: new Set([0, top.length + 1]), fill: col })];
    if (Wd / 2 >= sp * 1.15) pieces.push(piece([0.14, 0.45, 0.72].map((u) => [u * L, by(u * L)]), { closed: false }));
    const cr = (u, w) => [u * L, by(u * L), Math.max(w * Wd, 0.14 * L)];
    return { pieces, circles: [cr(0.25, 0.375), cr(0.5, 0.5), cr(0.75, 0.375), [0.92 * L, 0, 0.08 * L]], polys: [pts], anchor: [0, 0], cone: null, kind: 'leaf', rExit: 0, maxDeg: 0 };
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
    vedette:     { nom: 'Vedettes',    share: 0.6,  r: [0.12, 0.18],  min: 0.075, minSp: 3.2 },
    secondaire:  { nom: 'Secondaires', share: 0.2,  r: [0.07, 0.1],   min: 0.05,  minSp: 2.2, L: [0.2, 0.26], wd: 0.08 },
    hauteur:     { nom: 'En hauteur',  share: 0.14, L: [0.28, 0.4], wd: 0.1 },
    remplissage: { nom: 'Remplissage', share: 0.04, r: [0.05, 0.07],  min: 0.04,  minSp: 1.8, max: 3 },
    bouton:      { nom: 'Boutons',     share: 0.04, r: [0.03, 0.042], min: 0.022, minSp: 1.4, max: 4 },
  };

  /** Construit le dessin local d'un élément (même graine → même géométrie). */
  function buildDef(type, size, seed, sp, col, leaf) {
    const R = makeRng(seed);
    if (type === 'bouton') return bouton(size, R, sp, col, leaf);
    if (type === 'feuille') return feuille(size, R, sp, leaf);
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
      for (const b of bodies) if (b.inst.group !== ignoreGroup && Math.hypot(b.x - p[0], b.y - p[1]) < c[2] + b.r + sp) return false;
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
      const def0 = buildDef(type, size, seed, sp, colorOf(type, colorIdx), pal.feuille);
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
        const def = shift ? buildDef(type, size, seed, sp, colorOf(type, colorIdx + shift), pal.feuille) : def0;
        const f = poseFn(cp.pose);
        const inst = {
          type, group: g, primary: i === 0, sym: cp.sym,
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
            const res = tryPlace(type, { L, wd }, { x: p[0], y: p[1], th: a + Math.PI / 2, sx: 1, sy: 1 }, col);
            if (res) return res;
          }
        }
        return null;
      }
      const rr = RO.r;
      const rt = R.range(rr[0], rr[1]) * U * S.taille;
      const rMin = Math.max(RO.min * U * S.taille, RO.minSp * sp);
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
        return tryPlace(type, spot.r, pose, col);
      }
      const onAxis = (useV && Math.abs(spot.p[0] - cx) < 0.01) || (useH && Math.abs(spot.p[1] - cy) < 0.01);
      return tryPlace(type, spot.r, { x: spot.p[0], y: spot.p[1], th: onAxis ? 0 : R() * TAU, sx: 1, sy: 1 }, col);
    }

    /* ---- remplissage, rôle par rôle */
    const chosen = Object.keys(S.fleurs).filter((k) => FLEURS[k]);
    const byRole = {};
    for (const k of chosen) (byRole[FLEURS[k].role] = byRole[FLEURS[k].role] || []).push(k);
    if (S.boutons) byRole.bouton = ['bouton'];
    const freeArea = Math.abs(polyArea(inner)) - Math.abs(polyArea(reserve));
    const target = freeArea * clamp(S.densite, 0.1, 0.8);
    // les épis ont besoin de longs couloirs libres : ils passent juste après les vedettes
    const roles = ['vedette', 'hauteur', 'secondaire', 'remplissage', 'bouton'].filter((r) => byRole[r]);
    const shareSum = roles.reduce((s, r) => s + ROLES[r].share, 0);
    for (const role of roles) {
      const goal = (target * ROLES[role].share) / shareSum;
      let covered = 0, fails = 0, placed = 0;
      const max = ROLES[role].max || Infinity;
      while (covered < goal && fails < 30 && placed < max) {
        const res = placeOne(R.pick(byRole[role]), role);
        if (res) { covered += res.area; placed++; } else fails++;
      }
    }
    if (!insts.length) warnings.push("Aucune fleur n'a trouvé sa place : agrandis le panneau, réduis l'ouverture ou l'écart minimal.");

    /* ---- tiges */
    const stems = [];
    function registerStem(pts, A, B) {
      const id = stems.length;
      stems.push({ pts, A, B });
      addStrokePts(pts, id);
      return id;
    }
    /** Vérifie qu'un trait ouvert passe au large de tout, sauf de ses deux bouts. */
    function strokeClear(run, ends, skipFrameTail) {
      for (let i = 0; i < run.length; i++) {
        const q = run[i];
        const tail = skipFrameTail && i > run.length - 1 - (sp * 2.2);
        if (!inPoly(inner, q) && !tail) return false;
        if (!tail && polyDist(inner, q) < sp) return false;
        if (inPoly(reserve, q) || polyDist(reserve, q) < sp) return false;
        for (const b of bodies) if (!ends.includes(b.inst) && Math.hypot(b.x - q[0], b.y - q[1]) < b.r + sp) return false;
        const nearEnd = ends.some((e) => dist(q, e.anchor) < e.rExit + sp * 2.2);
        if (!nearEnd && !strokeNear(q, sp, (it) => dist(it.p, q) >= sp)) return false;
      }
      return true;
    }
    function exitOk(inst, ang) {
      if (inst.kind !== 'radial') return true;
      const need = Math.max(0.55, (1.6 * sp) / Math.max(inst.rExit, 1));
      return inst.exits.every((e) => angDiff(e, ang) >= need);
    }
    function coneOk(inst, from, to) {
      if (!inst.cone) return true;
      return angDiff(Math.atan2(to[1] - from[1], to[0] - from[0]), inst.cone.dir) <= inst.cone.half;
    }
    /** Trace une tige courbe entre deux éléments (ou vers le cadre si B est un point). */
    function stemBetween(A, B, toFrame) {
      const a = A.anchor, b = toFrame ? B : B.anchor;
      const len = dist(a, b);
      const nrm = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
      const bow = R.range(0.08, 0.2) * len * R.sign();
      const ctrl = [(a[0] + b[0]) / 2 + nrm[0] * bow, (a[1] + b[1]) / 2 + nrm[1] * bow];
      if (!coneOk(A, a, ctrl) || (!toFrame && !coneOk(B, b, ctrl))) return null;
      const dense = quadPts(a, ctrl, b, 1);
      const clipPolys = [...A.polys, ...(toFrame ? [] : B.polys)];
      const runs = clipOutside(dense, clipPolys);
      if (runs.length !== 1) return null;
      const run = runs[0];
      if (run.length < sp * 1.5) return null;
      const ends = toFrame ? [A] : [A, B];
      if (!strokeClear(run, ends, toFrame)) return null;
      const angA = Math.atan2(run[0][1] - A.anchor[1], run[0][0] - A.anchor[0]);
      const last = run[run.length - 1];
      const angB = toFrame ? 0 : Math.atan2(last[1] - B.anchor[1], last[0] - B.anchor[0]);
      if (!exitOk(A, angA) || (!toFrame && !exitOk(B, angB))) return null;
      return { run, angA, angB };
    }
    /** Pose une tige et ses reflets ; refuse si un reflet frôle l'original. */
    function addStem(A, B, toFrame) {
      const st = stemBetween(A, B, toFrame);
      if (!st) return false;
      const copies = [];
      for (const s of syms) {
        const run = st.run.map(s.pt);
        if (copies.some((c) => dist(c.run[0], run[0]) < 0.5 && dist(c.run[c.run.length - 1], run[run.length - 1]) < 0.5)) continue;
        copies.push({ run, s });
      }
      for (let i = 1; i < copies.length; i++)
        for (const q of copies[i].run) for (let j = 0; j < i; j++)
          if (copies[j].run.some((p) => dist(p, q) < sp) && dist(q, copies[i].run[0]) > A.rExit + sp * 2.2) return false;
      const twin = (inst, s) => (s === syms[0] ? inst : insts.find((o) => o.group === inst.group && dist(o.anchor, s.pt(inst.anchor)) < 0.5) || inst);
      for (const c of copies) {
        const a2 = twin(A, c.s), b2 = toFrame ? null : twin(B, c.s);
        const id = registerStem(c.run, a2, b2);
        a2.deg++; a2.exits.push(Math.atan2(c.run[0][1] - a2.anchor[1], c.run[0][0] - a2.anchor[0]));
        if (b2) { const l = c.run[c.run.length - 1]; b2.deg++; b2.exits.push(Math.atan2(l[1] - b2.anchor[1], l[0] - b2.anchor[0])); }
        if (c.s === syms[0]) stems[id].primary = true;
      }
      return true;
    }

    if (S.tiges) {
      const nodes = insts.filter((i) => i.kind !== 'leaf');
      const cands = [];
      for (const A of nodes.filter((n) => n.primary)) for (const B of nodes) {
        if (A === B || A.group === B.group) continue;
        const gap = dist(A.anchor, B.anchor) - A.rExit - B.rExit;
        if (gap < sp * 1.5 || gap > U * 0.32) continue;
        cands.push({ A, B, gap: gap * R.range(0.85, 1.15) });
      }
      cands.sort((x, y) => x.gap - y.gap);
      for (const { A, B } of cands) {
        if (A.deg >= A.maxDeg || B.deg >= B.maxDeg) continue;
        addStem(A, B, false);
      }
      // ce qui reste isolé s'accroche au cadre
      if (S.cadre !== 'aucun') for (const A of nodes.filter((n) => n.primary && n.deg === 0)) {
        let target;
        if (A.cone) target = rayHit(inner, A.anchor, [Math.cos(A.cone.dir), Math.sin(A.cone.dir)]);
        else { const n = inwardAt(A.anchor); target = rayHit(inner, A.anchor, [-n[0], -n[1]]); }
        if (target && dist(A.anchor, target) < U * 0.4) addStem(A, target, true);
      }
    }

    /* ---- feuilles : le long des tiges, puis au pied des fleurs */
    const leafLen = () => Math.max(R.range(0.08, 0.12) * U * S.taille, sp * R.range(4.2, 5.2));
    const minLeaf = sp * 4;
    /**
     * Pose une feuille au point P. Elle a le droit de toucher son support (la
     * tige, ou la fleur à son pied) — et seulement lui, reflets compris.
     */
    function placeLeaf(P, ang, side, host, onStem) {
      const mirrorsOfP = syms.map((s) => s.pt(P));
      const hostPolys = host ? insts.filter((i) => i.group === host.group).flatMap((i) => i.polys) : [];
      let L = leafLen();
      for (let s = 0; s < 3 && L >= minLeaf; s++, L *= 0.8) {
        const reach = L * 0.45;
        const res = tryPlace('feuille', L, { x: P[0], y: P[1], th: ang, sx: 1, sy: side }, 0, {
          ignoreGroup: host ? host.group : undefined,
          ignoreStroke: onStem ? (it) => mirrorsOfP.some((m) => dist(it.p, m) < reach) : null,
          check: host ? (copies, def) => copies.every((cp) => {
            const f = poseFn(cp.pose);
            return def.circles.slice(1).every((c) => { const w = f(c); return hostPolys.every((poly) => !inPoly(poly, w) && polyDist(poly, w) >= c[2] + sp); });
          }) : null,
        });
        if (res) return true;
      }
      return false;
    }
    if (S.feuillage > 0) {
      for (const st of stems.filter((s) => s.primary)) {
        const want = R() < S.feuillage ? (R() < S.feuillage * 0.8 ? 2 : 1) : 0;
        let side = R.sign();
        for (let k = 0; k < want; k++) {
          const t = want === 1 ? R.range(0.35, 0.65) : k === 0 ? R.range(0.25, 0.42) : R.range(0.58, 0.75);
          const i = clamp(Math.round(t * (st.pts.length - 1)), 1, st.pts.length - 2);
          const P = st.pts[i], T = [st.pts[i + 1][0] - st.pts[i - 1][0], st.pts[i + 1][1] - st.pts[i - 1][1]];
          const ang = Math.atan2(T[1], T[0]) + (R() < 0.5 ? 0 : Math.PI) + side * R.range(0.6, 1.0);
          placeLeaf(P, ang, side, null, true);
          side = -side;
        }
      }
      for (const A of insts.filter((i) => i.primary && i.kind === 'radial' && i.type !== 'feuille' && i.type !== 'myosotis')) {
        const want = Math.round(S.feuillage * 3 * R.range(0.6, 1.2));
        for (let k = 0, tries = 0; k < want && tries < 8; tries++) {
          const e = A.exits.length ? R.pick(A.exits) : R() * TAU;
          const s = R.sign();
          const a = e + s * R.range(0.45, 1.3);
          const P = rayHit(A.polys[0], A.anchor, [Math.cos(a), Math.sin(a)]);
          if (P && placeLeaf(P, a + s * R.range(0.25, 0.6), s, A, false)) k++;
        }
      }
    }

    /* ---- cadre : filets, tuiles colorées, amorces des lignes de fond */
    const framePieces = [], tileFills = [], starts = [];
    if (S.cadre !== 'aucun') {
      framePieces.push(piece(frameLine, { corners: new Set(frameLine.map((_, i) => i)) }));
      if (S.cadre !== 'simple') framePieces.push(piece(inner, { corners: new Set(inner.map((_, i) => i)) }));
      if (S.format === 'arche' || S.format === 'rond') { framePieces.forEach((p) => { p.corners = new Set(S.format === 'arche' ? [0, p.pts.length - 1] : []); }); }

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
        const unitT = clamp(U0 * 0.16, sp * 6, 170);
        let nU = Math.max(4, Math.round(Lp / unitT / 4) * 4);
        const u = Lp / nU, a = clamp(band, sp, u * 0.35), A = u - a;
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
        const step = S.lignes >= 2 ? 1 : 2;
        for (let k = 0; k < nU; k++) {
          const s = s0 + k * u;
          if (nearCorner(s, band + sp * 2)) continue;
          if (S.lignes >= 1 && k % 2 === 1) divider(s);
          if (S.lignes >= 1 && k % step === 0) { const q = at(s); starts.push({ p: q.p, dir: [-q.out[0], -q.out[1]] }); }
        }
      } else if (S.lignes >= 1) {
        const nU = Math.max(4, Math.round(Lp / clamp(U0 * 0.16, sp * 6, 170) / 4) * 4), u = Lp / nU;
        const step = S.lignes >= 2 ? 1 : 2;
        for (let k = 0; k < nU; k += step) {
          const s = s0 + k * u;
          if (nearCorner(s, sp * 3)) continue;
          const q = at(s);
          starts.push({ p: q.p, dir: [-q.out[0], -q.out[1]] });
        }
      }
    }

    /* ---- lignes de fond : du cadre jusqu'à la première fleur rencontrée */
    const bgLines = [];
    for (const st of starts) {
      const maxLen = U * 0.42;
      let hit = null, last = st.p, ok = true, graze = 0;
      const grazed = new Set();
      for (let s = 0.7; s <= maxLen; s += 0.7) {
        const q = [st.p[0] + st.dir[0] * s, st.p[1] + st.dir[1] * s];
        if (inPoly(reserve, q) || polyDist(reserve, q) < sp) { ok = false; break; }
        const hb = bodies.find((b) => Math.hypot(b.x - q[0], b.y - q[1]) < b.r && b.inst.polys.some((P) => inPoly(P, q)));
        if (hb) { hit = { inst: hb.inst, inside: q, out: last }; break; }
        if (s > sp) {
          for (const b of bodies) {
            if (Math.hypot(b.x - q[0], b.y - q[1]) > b.r + sp) continue;
            if (b.inst.polys.some((P) => polyDist(P, q) < sp)) { graze++; grazed.add(b.inst.group); break; }
          }
          if (graze > (sp * 2.5) / 0.7) { ok = false; break; }
          if (!strokeNear(q, sp, (it) => dist(it.p, q) >= sp)) { ok = false; break; }
        }
        last = q;
      }
      if (!ok || !hit || [...grazed].some((gr) => gr !== hit.inst.group)) continue;
      let a = hit.out, b = hit.inside;
      for (let k = 0; k < 12; k++) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (hit.inst.polys.some((P) => inPoly(P, m))) b = m; else a = m; }
      if (dist(st.p, a) < sp * 1.5) continue;
      bgLines.push(segment(st.p, a));
      const dense = [];
      for (let s = 0; s <= dist(st.p, a); s += 1) dense.push([st.p[0] + st.dir[0] * s, st.p[1] + st.dir[1] * s]);
      addStrokePts(dense, -1 - bgLines.length);
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
      insts, stems, bgLines, framePieces, tileFills, blocks, warnings,
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

    const all = [...g.tileFills, ...g.stems.map((s) => piece(thin(s.pts), { closed: false })), ...g.bgLines, ...g.framePieces];
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
      out.push(`<g stroke="none" fill-opacity="0.86">${fills.join('')}</g>`);
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

  return { render, generate, normalize, DEFAULTS, FLEURS, ROLES, FORMATS, PALETTES, CERNES, FONDS, TEXT_STYLES, clone };
})();

window.Vitrail = Vitrail;
