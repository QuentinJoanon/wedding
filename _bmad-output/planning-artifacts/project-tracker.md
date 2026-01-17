# 📋 Project Tracker - Site de Mariage Quentin & Élisa

**Deadline MVP:** Mars 2026 (avant envoi faire-parts)
**Événement:** Juin 2027 - Domaine de Mont
**Budget:** ≤10€ (domaine uniquement)

---

## 📚 Documents de référence

### Documents de planification
- [Product Brief](./product-brief-wedding-2026-01-14.md) - Vue d'ensemble du projet
- [PRD - Product Requirements](./prd.md) - Spécifications fonctionnelles détaillées
- [UX Design Specification](./ux-design-specification.md) - Stratégie UX et design

### Documents sources
- [document_de_base/Mariage.pdf](../../document_de_base/Mariage.pdf) - Informations principales du mariage
- [document_de_base/Domaine de Mont - Liste prestataires.pdf](../../document_de_base/Domaine%20de%20Mont%20-%20Liste%20prestataires.pdf) - Liste hébergements et prestataires
- [document_de_base/cbb1a9e7-a2ca-4066-9fe1-3f76b6264987.jpg](../../document_de_base/cbb1a9e7-a2ca-4066-9fe1-3f76b6264987.jpg) - Exemple déco 1
- [document_de_base/e5d9c4d1-89d8-4aea-b2d7-08dbcbc97283.jpg](../../document_de_base/e5d9c4d1-89d8-4aea-b2d7-08dbcbc97283.jpg) - Exemple déco 2
- [document_de_base/7a8e66b3-36c3-4496-9d96-d2b064316e4c.jpg](../../document_de_base/7a8e66b3-36c3-4496-9d96-d2b064316e4c.jpg) - Exemple déco 3

---

## 🎯 Phase 1 : Configuration & Foundation

### ✅ Setup Technique
- [x] Initialiser projet Vite + React + TypeScript
- [x] Installer et configurer Tailwind CSS v4
- [x] Installer Framer Motion et headlessui
- [x] Configurer palette de couleurs pastel/doré
- [x] Installer polices manuscrites (Great Vibes, Dancing Script, Allura)
- [x] Créer structure de dossiers (components, utils)
- [x] Configurer npm scripts pour dev/build
- [ ] Setup Vercel pour hébergement
- [ ] Configurer nom de domaine

**Référence:** [UX Design - Stack technique](./ux-design-specification.md#design-system-choice)

### ✅ Animation Hero (Critère Make-or-Break)
- [x] Créer composant AnimatedNames avec SVG
- [x] Implémenter animation d'écriture manuscrite (stroke drawing)
- [x] Police manuscrite Great Vibes
- [x] Timing 6 secondes avec transition fluide
- [x] Test performance 60fps
- [ ] Test responsive mobile/tablette/desktop
- [ ] Optimisation performance 4G (NFR-PERF-3)

**Référence:** [UX Design - Critical Success Moments](./ux-design-specification.md#critical-success-moments)

---

## 🎨 Phase 2 : Design & Composants Réutilisables

### Layout & Navigation
- [x] Créer Layout principal
- [ ] Navigation sticky (optionnel)
- [ ] Smooth scroll entre sections
- [ ] Menu mobile responsive
- [ ] Footer avec mentions légales

**Référence:** [UX Design - Navigation](./ux-design-specification.md#effortless-interactions)

### Composants de base
- [ ] Card component (pour hébergements/liste mariage)
- [ ] Button component (variants: primary gold, secondary pastel)
- [ ] Section component (avec animations scroll-triggered)
- [ ] Timeline icon component (SVG animés)
- [ ] Form Input component (validation inline)

**Référence:** [UX Design - Design System](./ux-design-specification.md#customization-strategy)

---

## 📝 Phase 3 : Sections MVP (Mars 2026)

### 1. ✅ Animation d'ouverture (Hero)
- [x] Animation SVG manuscrite "Quentin & Élisa"
- [x] Date "Juin 2027"
- [x] Gradient pastel background
- [x] Scroll indicator animé
- [ ] Message d'accueil personnalisé

**Source:** [Product Brief - Core Vision](./product-brief-wedding-2026-01-14.md#core-vision)

### 2. 📍 Informations Pratiques
- [ ] Lieu du mariage (Domaine de Mont)
- [ ] Horaires détaillés cérémonie laïque samedi
- [ ] Horaires dimanche
- [ ] Dress code
- [ ] Contacts d'urgence
- [ ] Carte interactive vers le domaine

**Source:** [PRD - FR6 à FR10](./prd.md#informations-pratiques)
**Données:** [Mariage.pdf](../../document_de_base/Mariage.pdf)

### 3. 💌 Système RSVP
- [ ] Formulaire de confirmation présence
- [ ] Champ régimes alimentaires (allergies, végétarien, etc.)
- [ ] Validation inline
- [ ] Email confirmation automatique (Resend)
- [ ] Email notification admin
- [ ] Interface admin pour consulter réponses
- [ ] Comptage automatique pour traiteur

**Source:** [PRD - FR1 à FR5](./prd.md#gestion-invités--rsvp)
**Tech:** Resend API + Google Sheets (Phase 1 manuel)

### 4. 🎁 Liste de Mariage
- [ ] Présentation cadeaux souhaités
- [ ] Cards avec visuels des produits
- [ ] Liens directs boutiques/registres
- [ ] Système réservation anti-doublon
- [ ] Interface simple sans compte

**Source:** [PRD - FR19 à FR21](./prd.md#liste-mariage)

### 5. 🏨 Catalogue Hébergements
- [ ] Liste hébergements recommandés du PDF prestataires
- [ ] Cards avec infos (capacité, distance, prix indicatif)
- [ ] Liens directs sites réservation
- [ ] Carte interactive hébergements
- [ ] Filtres par type/prix (optionnel)

**Source:** [PRD - FR15 à FR18](./prd.md#hébergement)
**Données:** [Liste prestataires.pdf](../../document_de_base/Domaine%20de%20Mont%20-%20Liste%20prestataires.pdf)

### 6. 🗺️ Plans d'Accès
- [ ] Carte interactive Google Maps vers Domaine de Mont
- [ ] Itinéraires depuis villes principales (Lyon, Paris, etc.)
- [ ] Informations parking
- [ ] Conseils transport
- [ ] Coordonnées GPS

**Source:** [PRD - FR11 à FR14](./prd.md#navigation--accès)

### 7. ⏰ Timeline Weekend
- [ ] Déroulé visuel samedi-dimanche
- [ ] Icônes SVG qui se dessinent (Framer Motion)
- [ ] Horaires clés (cérémonie, repas, soirée)
- [ ] Format visuel clair et scannable

**Source:** [PRD - FR10](./prd.md#informations-pratiques)
**UX:** [Timeline pattern](./ux-design-specification.md#transferable-ux-patterns)

### 8. 👶 Section Enfants
- [ ] Informations baby-sitters disponibles
- [ ] Activités prévues pour les 19 enfants
- [ ] Consignes pratiques parents
- [ ] Horaires garde

**Source:** [PRD - FR22 à FR24](./prd.md#enfants)

### 9. ❓ FAQ
- [ ] Questions fréquentes anticipées
- [ ] Réponses claires et complètes
- [ ] Format accordéon ou liste
- [ ] Recherche par mot-clé (optionnel)

**Source:** [PRD - FR25 à FR26](./prd.md#auto-service)

### 10. 🔒 Anti-Spam & SEO
- [ ] Créer robots.txt (blocage tous crawlers)
- [ ] Meta tags `noindex, nofollow` toutes pages
- [ ] Pas de sitemap.xml
- [ ] Pas d'Open Graph tags

**Source:** [PRD - NFR-SEO-1 à NFR-SEO-4](./prd.md#seo)

---

## ⚙️ Phase 4 : Intégrations & Backend

### Email (Resend)
- [ ] Créer compte Resend
- [ ] Configurer API key
- [ ] Template email confirmation RSVP invité
- [ ] Template email notification admin
- [ ] Tester envoi emails
- [ ] Vérifier taux succès > 95% (NFR-INT-1)

**Source:** [PRD - Technical Architecture](./prd.md#technical-architecture)

### Google Sheets (Phase 2)
- [ ] Créer Google Sheet planning cercle proche
- [ ] API intégration pour sync auto
- [ ] Interface édition pour Élisa
- [ ] Test synchronisation < 10s (NFR-INT-2)

**Note:** Phase 2 - Nice to have, pas bloquant pour MVP

---

## 🎨 Phase 5 : Polish & Optimisation

### Performance
- [ ] Code splitting bundles
- [ ] Images WebP + fallback
- [ ] Lazy loading images
- [ ] Test Lighthouse mobile > 90 (NFR-PERF-6)
- [ ] FCP < 1.5s sur 4G (NFR-PERF-1)
- [ ] TTI < 3s mobile 4G (NFR-PERF-2)
- [ ] Animation 60fps garantie (NFR-PERF-3)

**Source:** [PRD - Performance NFRs](./prd.md#performance)

### Responsive & Compatibility
- [ ] Test mobile (320-768px)
- [ ] Test tablette (768-1024px)
- [ ] Test desktop (1024px+)
- [ ] Test Chrome/Safari/Firefox modernes
- [ ] Test Safari iOS
- [ ] Test Chrome Android

**Source:** [PRD - Browser Support](./prd.md#browser-support--compatibility)

### Accessibility
- [ ] Contraste couleurs suffisant
- [ ] Navigation clavier fonctionnelle
- [ ] Lecteurs écran basiques
- [ ] Alt text images importantes

**Source:** [PRD - Accessibility](./prd.md#accessibility)

---

## 🚀 Phase 6 : Déploiement & Lancement

### Pré-lancement (Février 2026)
- [ ] Review final design avec Élisa
- [ ] Test utilisateur (2-3 personnes du cercle proche)
- [ ] Corrections bugs critiques
- [ ] Vérification contenus (typos, infos exactes)
- [ ] Test RSVP end-to-end

### Déploiement (Mars 2026)
- [ ] Build production
- [ ] Deploy sur Vercel
- [ ] Configurer domaine personnalisé
- [ ] Test site production
- [ ] Vérifier emails fonctionnels
- [ ] Backup code source

### Distribution
- [ ] Générer QR code pour faire-parts
- [ ] Préparer URL courte mémorisable
- [ ] Message WhatsApp cercle proche avec URL privée (Phase 2)
- [ ] Envoi faire-parts avec lien site

---

## 📊 Critères de Succès MVP

### Lancement (Mars 2026)
- [ ] Site déployé et accessible via domaine
- [ ] Toutes les 9 fonctionnalités core implémentées
- [ ] Design pastel/doré finalisé
- [ ] Performance mobile optimale
- [ ] Lien imprimé sur faire-parts
- [ ] Coût total ≤ 10€

### Adoption (Mars - Juin 2026)
- [ ] 90%+ invités font RSVP via site
- [ ] Réduction questions répétitives (objectif: ÷5)
- [ ] Retours positifs design
- [ ] Aucun bug bloquant

### Jour J (Juin 2027)
- [ ] Tous invités bien informés
- [ ] Pas d'heures perdues à répondre questions
- [ ] Aucun invité perdu/en retard
- [ ] Fierté du résultat

**Source:** [PRD - Success Criteria](./prd.md#success-criteria)

---

## 🎯 Phase 2 : Nice-to-Have (Optionnel)

### URL Privée Cercle Proche
- [ ] Authentification mot de passe
- [ ] Planning détaillé vendredi-dimanche
- [ ] Tâches assignées visibles
- [ ] Sync Google Sheets temps réel
- [ ] Coordination transport 9 voitures

**Source:** [PRD - Cercle Proche Phase 2](./prd.md#cercle-proche-phase-2)

### Post-Mariage (Juillet 2027+)
- [ ] Galerie photos partagée (must-have)
- [ ] Upload photos invités
- [ ] Playlist/suggestions musicales
- [ ] Transformation en site souvenir

---

## 📝 Notes & Décisions

### Décisions Techniques
- **Stack:** Vite + React + TypeScript + Tailwind v4 + Framer Motion
- **Hosting:** Vercel (hobby plan gratuit)
- **Email:** Resend API
- **Data:** Google Sheets (manuel Phase 1, sync Phase 2)
- **Polices:** Great Vibes (manuscrit) + Georgia (heading) + system-ui (body)

### Contraintes
- Deadline MVP: Mars 2026
- Budget: ≤10€ (domaine uniquement)
- Performance: 60fps mobile 4G obligatoire
- SEO: Blocage total (robots.txt + noindex)

### Risques Identifiés
- [ ] Manque de temps Quentin → Timeline 2-3 mois réaliste, scope réduit possible
- [ ] Animation complexe → POC Framer Motion semaine 1 validé ✅
- [ ] Performance mobile → Tests réguliers Lighthouse

**Source:** [PRD - Risk Mitigation](./prd.md#stratégie-datténuation-des-risques)

---

## 📅 Timeline Estimée

- **Janvier 2026:** Setup + Animation Hero ✅
- **Février 2026:** Développement sections MVP
- **Mars 2026:** Polish + Tests + Déploiement
- **Mars-Juin 2027:** Phase 2 optionnelle
- **Juin 2027:** Jour J 🎉
- **Juillet 2027+:** Post-mariage (galerie photos)

---

**Dernière mise à jour:** 2026-01-16
**Statut global:** 🟢 En cours - Phase 1 complétée (Setup + Hero)
