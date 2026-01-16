---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-wedding-2026-01-14.md'
  - 'document_de_base/Mariage.pdf'
  - 'document_de_base/Domaine de Mont - Liste prestataires.pdf'
  - 'document_de_base/cbb1a9e7-a2ca-4066-9fe1-3f76b6264987.jpg'
  - 'document_de_base/e5d9c4d1-89d8-4aea-b2d7-08dbcbc97283.jpg'
  - 'document_de_base/7a8e66b3-36c3-4496-9d96-d2b064316e4c.jpg'
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 5
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'greenfield'
---

# Product Requirements Document - Site de Mariage

**Author:** Quentin
**Date:** 2026-01-15
**Événement:** Mariage Quentin & Élisa - Juin 2027
**Contexte:** 121 invités, Domaine de Mont, budget ≤10€

## Success Criteria

### User Success

Le site est un succès pour les invités si :

- **Moment "wow" dès l'arrivée** : L'animation d'ouverture révélant "Quentin & Élisa" et la date crée un effet immédiat et mémorable
- **90%+ des invités font leur RSVP via le site** (vs par téléphone/WhatsApp)
- **Les invités reviennent consulter le site 2-3 fois** entre mars 2026 et juin 2027, prouvant qu'il est leur référence
- **Le cercle proche (29 personnes) utilise activement l'URL privée** pour coordonner le weekend (Phase 2)
- **Aucun invité perdu ou en retard le jour J** à cause d'infos manquantes
- **Retours positifs spontanés** des invités sur le design et l'expérience

**Indicateurs comportementaux :**
- Les invités partagent le lien entre eux plutôt que de vous poser des questions
- Les invités trouvent rapidement l'info qu'ils cherchent (horaires, dress code, hébergements)

### Business Success

Le projet vaut le coup si :

- **Gain de temps et réduction de stress** : Beaucoup moins de sollicitations répétitives
- **Autonomie d'Élisa** : Elle peut mettre à jour le planning cercle proche via Google Sheets (Phase 2)
- **Suivi RSVP efficace** : Chiffres exacts pour le traiteur sans refaire le calcul
- **Satisfaction personnelle** : Fierté d'avoir créé quelque chose d'unique pour votre mariage
- **Souvenir durable** : Le site reste un beau souvenir de cette période

### Technical Success

- ✅ MVP prêt mars 2026 (avant envoi faire-parts)
- ✅ Coût total ≤ 10€ (domaine uniquement)
- ✅ Hébergement gratuit (Vercel hobby plan)
- ✅ Site rapide et fluide sur mobile
- ✅ Code maintenable
- ✅ Site non-indexé (robots.txt + meta noindex)
- ✅ Emails RSVP fonctionnels (Resend)

### Measurable Outcomes

**Succès global le jour du mariage (juin 2027) :**
- Tous les invités bien informés et préparés
- Pas d'heures perdues à répondre aux mêmes questions
- Cercle proche coordonné via planning (Phase 2)
- Fierté du résultat visuel et technique
- Beau souvenir de cette période

## User Journeys

### Journey 1 : Sophie - L'Invité Standard (Parcours Principal)

**Qui est Sophie ?**

Sophie, 32 ans, amie proche depuis l'université. Vit à Lyon (2h30 du domaine). Entre boulot et vie sociale, elle perd souvent les détails d'invitations dans ses emails.

**Le problème :**

Mars 2026, elle reçoit le faire-part. Ravie mais stressée : "C'est où ? Hébergement ? Dress code ? Liste de mariage ?" Elle déteste appeler pour des questions basiques et risque de remettre à plus tard.

**La solution :**

**Mars 2026 - Scène d'ouverture :**
Sophie scanne le QR code du faire-part. Animation élégante révélant "Quentin & Élisa" et "Juin 2027" en palette pastel dorée. "Wow !" Le site la plonge dans l'ambiance.

**Action immédiate :**
Infos essentielles claires. RSVP en 2 minutes. Email de confirmation instantané. "Top, c'est fait !"

**Avril-Mai 2026 :**
Retour 2-3 fois pour la liste de mariage. Choix cadeau, réservation via lien direct. Site en favoris.

**Juin 2027 (une semaine avant) :**
Vérification dress code, plan d'accès Lyon, horaires, liste hébergements pour coordination amis.

**Résultat :**
Arrive parfaitement préparée, détendue. Aucun appel nécessaire. Complimente le site : "Tellement pratique et beau !"

---

### Journey 2 : Thomas & Mathilde - Cercle Proche avec Enfants

**Qui sont-ils ?**

Témoins avec bébé 18 mois. Cercle proche (29 hébergés). Aident installation/rangement weekend.

**Le problème :**

Besoin d'organisation : arrivée vendredi ? Qui garde bébé pendant installation ? Activités enfants ? Sans coordination = stress.

**La solution :**

**Mars 2026 - Site Public :**
RSVP 3 personnes, note "bébé 18 mois". Animation top.

**Phase 2 - URL Privée :**
Message WhatsApp avec URL privée + mot de passe. Planning détaillé :
- Vendredi 14h : arrivée, installation orangerie, déco
- Samedi matin : cérémonie, fleurs
- Dimanche : rangement

Google Sheet synchronisé par Élisa. Tâches assignées visible (Thomas sono, Mathilde garde enfants).

**Juin 2027 :**
Consultation section enfants : baby-sitting, activités, consignes. Rassurée.

**Jour J :**
Planning mobile temps réel. "15h tables, 17h sono." Coordination parfaite.

**Résultat :**
Détendus. Savent quoi faire, quand. Bébé pris en charge. Efficaces et profitent. Zéro stress.

---

### Journey 3 : Quentin & Élisa - Administrateurs

**Qui sont-ils ?**

Quentin développeur, Élisa à l'aise Google Sheets. Organisent 121 invités, budget, prestataires. Pas de temps à perdre.

**Besoin :**
- Moins de questions répétitives
- Vision claire RSVP
- Autonomie Élisa (planning sans Quentin)
- Coût minimal

**La solution :**

**Janvier-Mars 2026 - Développement :**
Vite + React. Design pastel/doré inspiré photos. Animation, RSVP Resend, catalogue hébergements PDF. Tests mobiles Élisa. Feedback intégré. Déploiement Vercel gratuit, domaine 10€, robots.txt.

**Mars 2026 - Juin 2027 - Utilisation :**

**RSVP :** Email reçu → Google Sheet manuel. Suivi toutes les 2 semaines. "95 confirmés, 26 manquants." Relance ciblée.

**Liste mariage :** Invités achètent, cochage manuel doublons.

**Phase 2 - Planning :** Élisa modifie Google Sheet (horaires, tâches). Sync automatique. Autonomie totale.

**Juin 2027 - Jour J :**
Site a rempli mission. Invités informés, RSVP clairs, cercle coordonné. Profitent mariage sans stress logistique. Fiers de leur création.

**Post-Mariage :**
Transformation galerie photos. Code source = mémoire technique et émotionnelle.

**Résultat :**
Questions divisées par 5. Stress réduit. Autonomie Élisa. Mission accomplie !

## Project Scoping & Développement par Phases

### Philosophie MVP

**Approche : Product MVP orienté expérience utilisateur**

Expérience complète et mémorable dès le lancement (vs produit minimal).

**Justification :**
- **Contexte événementiel** : Une seule chance (mariage juin 2027)
- **Pas d'itération** : Infos complètes requises mars 2026
- **Différenciation expérience** : Animation et design = succès
- **Réduction support** : Site complet évite questions

**Ressources :**
- Développeur : Quentin (temps partiel, janvier-mars 2026)
- Product owner : Élisa (feedback/validation)
- Budget : ≤10€ (domaine)
- Timeline : 2-3 mois

### MVP - Phase 1 (Mars 2026)

**User journeys supportés :**
- ✅ Sophie (invité standard) - Parcours complet
- ✅ Quentin & Élisa (admin) - Gestion RSVP manuel
- ⏳ Thomas & Mathilde - Public uniquement (privé Phase 2)

**10 Fonctionnalités Core :**

1. **Informations Pratiques** : Lieu, horaires, dress code, contacts
2. **RSVP** : Formulaire + régimes alimentaires + emails Resend
3. **Liste Mariage** : Présentation + liens + réservation
4. **Hébergements** : Liste + carte interactive + infos pratiques
5. **Plans Accès** : Cartes + itinéraires + parking
6. **Timeline Weekend** : Déroulé samedi-dimanche
7. **Section Enfants** : Baby-sitting + activités (19 enfants)
8. **FAQ** : Questions anticipées
9. **Design** : Animation ouverture + palette pastel/doré + responsive
10. **Anti-Spam** : robots.txt + meta noindex

**Critères lancement :**
- ✅ 10 fonctionnalités testées
- ✅ Design pastel/doré finalisé
- ✅ Performance mobile optimale
- ✅ Lien prêt faire-parts mars 2026

### Phase 2 (Mars 2026 - Juin 2027)

**Fonctionnalités Post-MVP :**

1. **URL Privée** : Authentification mot de passe cercle proche (29 personnes)
2. **Planning Weekend** : Détail vendredi-dimanche, tâches assignées
3. **Sync Google Sheets** : Élisa modifie planning sans Quentin
4. **Transport** : Coordination 9 voitures, covoiturage

**Rationale :** Non bloquant envoi faire-parts. Coordination initiale via WhatsApp possible.

**Pas de Phase 3 :** Événement unique, pas de roadmap long terme.

### Stratégie d'Atténuation des Risques

**Risques Techniques :**

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Animation complexe | Moyen | Faible | Libs React (Framer Motion, GSAP, React Spring), POC semaine 1 |
| Resend emails | Faible | Faible | Documentation, fallback Google Sheet manuel |
| Performance mobile 4G | Moyen | Moyen | Code splitting, WebP, tests Lighthouse réguliers |
| Vercel | Faible | Faible | Plateforme mature, gratuit éprouvé |

**Approche :** Stack maîtrisée réduit risques. Recherche libs animation avant custom.

**Risques Ressources :**

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Manque temps Quentin | Élevé | Moyen | Timeline 2-3 mois réaliste, scope défini, réduction possible |
| Phase 2 non livrée | Faible | Moyen | WhatsApp viable, Phase 2 = nice-to-have |

**Contingency timeline :**
- Réduction : Supprimer enfants, FAQ, catalogue (garder PDF)
- Minimum : Animation + Infos + RSVP + Liste mariage + Plans

**Risques Métier :**

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Site non utilisé | Élevé | Faible | QR code faire-part, design wow, relance WhatsApp |
| Spam/indexation | Moyen | Faible | robots.txt + noindex dès J1 |

**Plan B :** Coordination WhatsApp traditionnelle viable.

## Technical Architecture

### Architecture Applicative

**Type :** SPA (Single Page Application)
- React Router
- Navigation côté client sans rechargement
- Expérience fluide moderne

**Stack :**
- Frontend : Vite + React
- Hosting : Vercel (gratuit)
- Email : Resend
- Data : Google Sheets (manuel Phase 1, sync Phase 2)

### Browser Support & Compatibility

**Navigateurs cibles :**
- Chrome/Safari/Firefox modernes uniquement
- Focus mobile (Safari iOS, Chrome Android)
- Pas IE11 ni anciens

**Responsive Design :**
- Mobile : 320-768px (priorité)
- Tablette : 768-1024px
- Desktop : 1024px+
- Approche Mobile-First

### SEO & Indexation

**Stratégie :** Blocage total
- robots.txt tous crawlers
- Meta `noindex, nofollow` toutes pages
- Pas sitemap.xml ni Open Graph

**Objectif :** Éviter indexation Google et spam.

### Temps Réel

**Approche :** Aucune fonctionnalité temps réel
- Pas WebSockets/Server-Sent Events
- RSVP : Email + copie manuelle
- Sync Google Sheets (Phase 2) : Polling/rechargement manuel

**Justification :** Simplicité, pas besoin métier.

### Accessibility

**Niveau :** Navigation base fonctionnelle
- Pas WCAG AA formelle
- Contraste couleurs suffisant
- Clavier + lecteurs écran basiques

**Justification :** Projet personnel, invités connus, pas exigence légale.

## Functional Requirements

### Gestion Invités & RSVP

- **FR1** : Confirmer présence via formulaire
- **FR2** : Indiquer régimes alimentaires
- **FR3** : Email confirmation après soumission
- **FR4** : Admin reçoit email par RSVP
- **FR5** : Consulter comptage confirmations (optionnel)

### Informations Pratiques

- **FR6** : Consulter lieu (Domaine de Mont)
- **FR7** : Horaires détaillés weekend
- **FR8** : Dress code
- **FR9** : Contacts urgence
- **FR10** : Timeline samedi-dimanche

### Navigation & Accès

- **FR11** : Carte interactive Domaine de Mont
- **FR12** : Itinéraires villes principales
- **FR13** : Infos parking
- **FR14** : Conseils transport

### Hébergement

- **FR15** : Liste hébergements recommandés
- **FR16** : Infos pratiques (capacité, distance, prix)
- **FR17** : Liens réservation
- **FR18** : Carte interactive hébergements

### Liste Mariage

- **FR19** : Consulter liste cadeaux
- **FR20** : Liens boutiques/registres
- **FR21** : Réserver cadeau (anti-doublon)

### Enfants

- **FR22** : Infos baby-sitters
- **FR23** : Activités enfants
- **FR24** : Consignes parents

### Auto-Service

- **FR25** : FAQ questions anticipées
- **FR26** : Réponses sans sollicitation

### UX & Design

- **FR27** : Animation ouverture révélant noms + date
- **FR28** : Interface responsive
- **FR29** : Navigation fluide SPA

### Protection

- **FR30** : Blocage indexation moteurs
- **FR31** : Pas résultats Google

### Admin Phase 1

- **FR32** : RSVP par email
- **FR33** : Copie manuelle Google Sheet

### Cercle Proche Phase 2

- **FR34** : URL privée mot de passe
- **FR35** : Planning weekend détaillé
- **FR36** : Tâches assignées visibles
- **FR37** : Sync planning Google Sheet
- **FR38** : Élisa modifie planning sans Quentin
- **FR39** : Coordination transport 9 voitures

## Non-Functional Requirements

### Performance

- **NFR-PERF-1** : FCP < 1.5s (4G)
- **NFR-PERF-2** : TTI < 3s mobile 4G
- **NFR-PERF-3** : Animation 60fps fluide
- **NFR-PERF-4** : Images WebP + fallback
- **NFR-PERF-5** : Code splitting bundle initial
- **NFR-PERF-6** : Lighthouse mobile > 90

**Rationale :** Animation = critère succès #1. Mobile prioritaire.

### Security & Privacy

- **NFR-SEC-1** : Données RSVP stockées sécurisé
- **NFR-SEC-2** : Emails HTTPS/TLS
- **NFR-SEC-3** : URL privée auth mot de passe (Phase 2)
- **NFR-SEC-4** : Pas LocalStorage données sensibles

**Rationale :** Données personnelles nécessitent protection basique.

### Reliability

- **NFR-REL-1** : Disponibilité 99% (mars 2026 - juin 2027)
- **NFR-REL-2** : Emails RSVP livrés < 5min
- **NFR-REL-3** : Panne Resend = données sauvegardées/accessibles

**Rationale :** Événement unique, pas seconde chance.

### Compatibility

- **NFR-COMPAT-1** : Chrome/Safari/Firefox modernes
- **NFR-COMPAT-2** : Pas IE11
- **NFR-COMPAT-3** : Focus mobile iOS/Android
- **NFR-COMPAT-4** : Responsive breakpoints définis

### Integration

- **NFR-INT-1** : Resend taux succès > 95%
- **NFR-INT-2** : Sync Google Sheets < 10s (Phase 2)
- **NFR-INT-3** : Cartes interactives < 2s

**Rationale :** Intégrations tierces critiques UX.

### Maintainability

- **NFR-MAIN-1** : Code maintenable par Quentin seul
- **NFR-MAIN-2** : Élisa modifie planning sans assistance (Phase 2)
- **NFR-MAIN-3** : Mises à jour contenu sans redéploiement

**Rationale :** Pas équipe support. Autonomie essentielle.

### SEO

- **NFR-SEO-1** : Aucune optimisation
- **NFR-SEO-2** : robots.txt tous crawlers
- **NFR-SEO-3** : Meta `noindex, nofollow`
- **NFR-SEO-4** : Pas sitemap/Open Graph

**Rationale :** Éviter spam.