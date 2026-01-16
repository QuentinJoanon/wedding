---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - document_de_base/Mariage.pdf
  - document_de_base/cbb1a9e7-a2ca-4066-9fe1-3f76b6264987.jpg
  - document_de_base/e5d9c4d1-89d8-4aea-b2d7-08dbcbc97283.jpg
  - document_de_base/7a8e66b3-36c3-4496-9d96-d2b064316e4c.jpg
  - document_de_base/Domaine de Mont - Liste prestataires.pdf
  - https://www.domainedemont.com/
date: 2026-01-14
author: Quentin
---

# Product Brief: wedding

## Executive Summary

Le site de mariage de Quentin & Élisa est une plateforme web informative sur-mesure destinée à centraliser toutes les informations pratiques pour leurs 121 invités. Prévu pour juin 2027 au Domaine de Mont, ce mariage nécessite une coordination complexe (weekend complet, 29 personnes hébergées sur place, 19 enfants, logistique multi-voitures).

Le site vise à éliminer le stress et la perte de temps liés aux questions répétitives des invités tout en offrant une expérience visuelle élégante qui reflète l'univers du mariage (déco pastel/doré, ambiance romantique). Développé en interne avec contrôle total et hébergement gratuit, le site se distingue par sa personnalisation poussée, sa flexibilité d'édition (synchronisation Google Sheets), et son design "wow" qui fait bien plus qu'informer - il immerge les invités dans l'atmosphère du mariage dès leur première visite.

**Deadline MVP:** Mars 2026 (avant envoi des faire-parts)

---

## Core Vision

### Problem Statement

Organiser un mariage de 121 personnes sur un weekend complet génère une avalanche de questions logistiques répétitives : horaires détaillés, dress code, hébergements à proximité, liste de mariage, plan d'accès, coordination des transports, gestion des enfants, etc.

Sans centralisation, ces informations se dispersent entre appels téléphoniques, messages WhatsApp, faire-parts papier incomplets, créant stress et perte de temps pour les mariés qui ont déjà une charge organisationnelle considérable. Les invités, de leur côté, risquent d'arriver mal informés ou mal préparés, impactant négativement leur expérience et celle des organisateurs.

### Problem Impact

**Pour les mariés (Quentin & Élisa):**
- Stress accru et perte de temps à répondre aux mêmes questions
- Risque d'informations contradictoires communiquées
- Difficulté à gérer les mises à jour (changements d'horaires, nouveaux hébergements, etc.)
- Charge mentale supplémentaire alors que l'organisation est déjà dense

**Pour les invités:**
- Informations dispersées difficiles à retrouver
- Incertitude sur les aspects pratiques (où dormir, comment s'habiller, quoi offrir)
- Hésitation à poser des questions pour ne pas déranger les mariés
- Risque d'arriver mal préparés (oubli d'éléments importants, retards)

**Pour le cercle proche (29 personnes hébergées):**
- Coordination complexe du weekend (vendredi installation, dimanche rangement)
- Besoin de clarté sur le planning d'aide et les tâches
- Nécessité de s'organiser pour le transport (9 voitures coordonnées)

### Why Existing Solutions Fall Short

**Solutions clés en main (Zankyou, Withjoy):**
- Coût récurrent non justifié pour un événement ponctuel
- Templates rigides qui ne reflètent pas l'identité unique du mariage
- Impossibilité d'intégrer des fonctionnalités sur-mesure (sync Google Sheets, planning détaillé cercle proche)
- Manque de contrôle total sur le design et le contenu
- Dépendance à un tiers pour les modifications

**Solutions "low-tech" (Google Doc, WhatsApp):**
- Expérience utilisateur médiocre, pas d'immersion visuelle
- Difficile à maintenir à jour de manière centralisée
- Ne crée pas l'effet "wow" souhaité
- Peu adapté pour le RSVP et la gestion structurée des données

**Absence de solution:**
- Multiplication des canaux de communication
- Perte d'informations
- Expérience invité fragmentée et frustrante

### Proposed Solution

Un site web informatif sur-mesure, développé en interne, qui centralise toutes les informations pratiques du mariage tout en offrant une expérience visuelle élégante et immersive.

**Caractéristiques clés:**

**Architecture dual-audience:**
- **URL publique**: Accessible à tous les invités avec informations générales (horaires à partir de la cérémonie laïque, hébergements, dress code, RSVP, liste de mariage, etc.)
- **URL privée avec mot de passe**: Réservée au cercle proche hébergé au domaine, incluant le planning détaillé d'aide du weekend (vendredi à dimanche)

**Fonctionnalités MVP (Mars 2026):**
- ✅ Informations pratiques complètes (lieu, horaires, dress code)
- ✅ Système de RSVP avec gestion des régimes alimentaires
- ✅ Liste de mariage intégrée
- ✅ Catalogue d'hébergements recommandés avec liens directs
- ✅ Plans d'accès et cartes interactives
- ✅ Timeline détaillée samedi-dimanche pour tous les invités
- ✅ Coordination transport/covoiturage
- ✅ Section dédiée enfants (baby-sitters, activités prévues)
- ✅ FAQ pour anticiper les questions courantes
- ✅ Planning détaillé cercle proche synchronisé avec Google Sheets (édition facile pour Élisa)

**Fonctionnalités Phase 2 (Nice-to-have):**
- 📸 Galerie photos partagée (must-have post-mariage)
- 🎵 Playlist/suggestions musicales
- Autres améliorations basées sur les retours

**Expérience utilisateur:**
- **Animation d'ouverture élégante** révélant les noms "Quentin & Élisa" et la date, créant un effet "wow" immédiat
- **Design sur-mesure** reflétant la déco du mariage (palette pastel - rose poudré, pêche, bleu ciel - avec touches dorées)
- **Navigation fluide et intuitive** pour trouver l'information rapidement
- **Responsive design** pour consultation mobile/tablette/desktop

**Infrastructure technique:**
- Hébergement gratuit (Vercel hobby plan)
- Coût limité au nom de domaine uniquement
- Contrôle total du code source
- Synchronisation Google Sheets pour édition facile des contenus dynamiques
- Performance et rapidité optimales

### Key Differentiators

**1. Contrôle total et coût minimal**
- Développé en interne par Quentin (développeur)
- Hébergement gratuit, coût limité au domaine
- Aucune dépendance à une plateforme tierce
- Modifications illimitées sans contraintes

**2. Hyper-personnalisation**
- Design unique reflétant précisément l'univers visuel du mariage
- Fonctionnalités sur-mesure adaptées aux besoins spécifiques (dual-audience, sync Google Sheets, gestion enfants)
- Expérience immersive dès l'animation d'ouverture
- Contenu organisé selon la logique propre au mariage (timeline détaillée, coordination complexe)

**3. Flexibilité technique et éditoriale**
- Synchronisation Google Sheets permettant à Élisa de modifier le planning sans intervention technique
- Architecture dual-audience (public/privé) pour gérer cercle proche vs tous invités
- Évolutivité facile pour ajouter fonctionnalités post-lancement

**4. Expérience "wow" et pratique**
- Ne se contente pas d'informer : crée une première impression mémorable
- Moodboard intégré naturellement dans le design du site
- Équilibre parfait entre beauté visuelle et utilité pratique
- Reflète l'attention aux détails et la personnalité des mariés

**5. Solution pérenne et réutilisable**
- Code source conservé comme souvenir technique
- Peut servir de portfolio/démonstration de compétences
- Lien personnel entre le métier de Quentin (dev) et son mariage
- Potentiel de réutilisation pour d'autres événements familiaux

---

## Target Users

### Primary Users

**Persona 1: L'Invité Standard - "Sophie"**

**Profil:**
Sophie, 32 ans, amie du couple, vit à Lyon (à 2h30 du Domaine de Mont). Elle a reçu le faire-part en mars 2026 avec le lien du site imprimé dessus. Elle consulte principalement le site sur son smartphone.

**Parcours utilisateur:**
1. **Mars 2026 - Découverte:** Reçoit le faire-part, visite immédiatement le site, impressionnée par l'animation d'ouverture élégante. Découvre le déroulé du weekend.
2. **Première action:** Fait son RSVP (confirme sa présence + régime alimentaire)
3. **Avril-Mai 2026:** Revient 2-3 fois pour consulter la liste de mariage et choisir son cadeau
4. **Mai-Juin 2027:** Revient quelques jours avant le mariage pour vérifier les horaires précis, le dress code, et le plan d'accès

**Besoins clés:**
- Trouver rapidement l'info essentielle (horaires, lieu, dress code)
- RSVP simple et rapide
- Liste de mariage accessible
- Plan d'accès clair depuis Lyon

**Moment "aha!":** Quand elle réalise que TOUTES les infos sont au même endroit et qu'elle n'a pas besoin d'appeler pour poser des questions.

---

**Persona 2: L'Invité avec Enfants - "Thomas & Mathilde"**

**Profil:**
Thomas et Mathilde, couple de témoins, parents d'un bébé. Vivent en région, font partie des 29 personnes hébergées au domaine. Ont reçu l'URL privée via WhatsApp en plus de l'URL publique.

**Parcours utilisateur:**
1. **Mars 2026:** Visitent le site public, font RSVP pour 3 personnes (eux + bébé)
2. **Mars 2026:** Reçoivent l'URL privée, consultent le planning détaillé vendredi-dimanche
3. **Mai 2027:** Reviennent régulièrement sur l'URL privée pour voir les mises à jour du planning (Élisa ajuste via Google Sheets)
4. **Une semaine avant:** Consultent la section enfants pour connaître les baby-sitters et activités prévues
5. **Vendredi matin (jour J-1):** Consultent le planning sur mobile pour savoir quand arriver et quelles tâches d'installation leur sont assignées

**Besoins clés:**
- Accès double: infos générales (URL publique) + planning détaillé (URL privée)
- Informations spécifiques enfants (baby-sitting, activités)
- Planning d'aide clair et à jour pour coordination vendredi-dimanche
- Coordination transport (quelle voiture, quel matériel)

**Moment "aha!":** Quand ils réalisent qu'ils n'ont pas besoin de demander "qu'est-ce qu'on apporte?" ou "à quelle heure on arrive vendredi?" - tout est déjà planifié et accessible.

---

### Secondary Users

**Persona 3: Les Administrateurs - "Quentin & Élisa"**

**Profil:**
Quentin (développeur) et Élisa (à l'aise avec Google Sheets), les mariés et créateurs du site.

**Besoins:**
- **Quentin:** Contrôle total du code, hébergement gratuit, possibilité de faire des mises à jour techniques rapidement
- **Élisa:** Pouvoir modifier facilement le planning du cercle proche via Google Sheets sans dépendre de Quentin pour chaque petit changement
- **Ensemble:** Réduire drastiquement les questions répétitives des invités, suivre les RSVP, gérer la liste de mariage

**Usage:**
- **Mars-Juin 2026:** Quentin développe le MVP, Élisa teste et donne du feedback
- **Juin 2026-Juin 2027:** Élisa met à jour le planning cercle proche au fil de l'organisation via Google Sheets
- **Post-faire-parts:** Consultent régulièrement les RSVP pour ajuster les chiffres avec le traiteur
- **Mai-Juin 2027:** Mises à jour finales (horaires précis, derniers ajustements)

**Moment "aha!":** Quand ils réalisent qu'ils ne reçoivent presque plus de messages "c'est à quelle heure déjà?" ou "où on dort?" - le site fait son job!

---

### User Journey

**Timeline globale:**

**Phase 1: Découverte (Mars 2026)**
- Réception faire-part → Visite site → Effet "wow" animation
- RSVP immédiat
- Exploration des infos pratiques

**Phase 2: Planification (Avril-Décembre 2026)**
- Consultations occasionnelles pour liste de mariage
- Cercle proche commence à consulter l'URL privée pour anticiper le weekend

**Phase 3: Préparation (Janvier-Mai 2027)**
- Retours réguliers pour vérifier détails pratiques
- Familles avec enfants consultent la section dédiée
- Invités de loin réservent hébergements via les liens fournis

**Phase 4: Dernière ligne droite (1 semaine avant)**
- Pics de visites: vérification horaires, dress code, plan d'accès
- Cercle proche consulte intensément l'URL privée pour le planning

**Phase 5: Weekend du mariage (Juin 2027)**
- Cercle proche: consultation mobile du planning en temps réel
- Tous invités: consultation rapide des horaires si besoin

**Phase 6: Post-mariage (Juillet 2027+)**
- Galerie photos partagée (Phase 2)
- Souvenir numérique de l'événement

---

## Success Metrics

### Critères de Succès Utilisateurs (Invités)

**Le site fonctionne si:**
- **90%+ des invités font leur RSVP via le site** (vs par téléphone/WhatsApp)
- **Réduction drastique des questions répétitives** - objectif: diviser par 5 les "c'est à quelle heure?", "où on dort?", "qu'est-ce qu'on met?"
- **Le cercle proche (29 personnes) utilise activement l'URL privée** pour le planning du weekend
- **Aucun invité perdu ou en retard le jour J** à cause d'infos manquantes

**Comportements indicateurs de succès:**
- Les invités reviennent 2-3 fois consulter le site
- Les invités partagent le lien entre eux plutôt que de vous poser des questions
- Retours positifs spontanés sur le design et l'effet "wow"

---

### Objectifs Personnels (Quentin & Élisa)

**Le projet vaut le coup si:**
- **Gain de temps et réduction de stress** - Moins de sollicitations, plus de sérénité dans l'organisation
- **Autonomie d'Élisa** - Elle peut mettre à jour le planning du cercle proche via Google Sheets sans dépendre de vous
- **Suivi RSVP en temps réel** - Chiffres exacts pour communiquer au traiteur sans refaire le calcul
- **Satisfaction personnelle** - Fierté d'avoir créé quelque chose d'unique et beau pour votre mariage

---

### Contraintes & Objectifs Techniques

**Objectifs concrets:**
- ✅ **MVP prêt mars 2026** - Avant envoi des faire-parts
- ✅ **Coût total: ~10€** (nom de domaine uniquement)
- ✅ **Hébergement gratuit** (Vercel hobby)
- ✅ **Site rapide et fluide** (bonne expérience mobile, pas de temps de chargement frustrant)
- ✅ **Code propre et maintenable** - Facilité pour vous d'ajouter/modifier fonctionnalités
- ✅ **Souvenir numérique durable** - Conservation du site comme mémoire après le mariage

---

### Indicateur de Succès Global

**"Mission accomplie" si le jour du mariage:**
- Tous les invités sont bien informés et arrivent préparés
- Vous n'avez pas passé des heures à répondre aux mêmes questions
- Le cercle proche s'est coordonné facilement grâce au planning
- Vous êtes fiers du résultat visuel et technique
- Le site reste un beau souvenir de cette période d'organisation

---

## MVP Scope & Roadmap

### Core Features (MVP - Mars 2026)

**Fonctionnalités essentielles pour le lancement:**

1. **Informations Pratiques Complètes**
   - Lieu du mariage (Domaine de Mont)
   - Horaires détaillés (cérémonie laïque samedi + déroulé dimanche)
   - Dress code
   - Contacts d'urgence

2. **Système de RSVP**
   - Formulaire de confirmation de présence
   - Gestion des régimes alimentaires (allergies, végétarien, etc.)
   - Comptage automatique pour le traiteur
   - Interface d'administration pour consulter les réponses

3. **Liste de Mariage**
   - Présentation des cadeaux souhaités
   - Liens directs vers les boutiques/registres
   - Système de réservation/validation

4. **Catalogue d'Hébergements**
   - Liste des hébergements recommandés (du PDF prestataires)
   - Informations pratiques (capacité, distance, prix indicatif)
   - Liens directs vers les sites de réservation
   - Carte interactive des hébergements

5. **Plans d'Accès et Cartes**
   - Carte interactive vers le Domaine de Mont
   - Itinéraires depuis principales villes
   - Informations parking
   - Conseils transport

6. **Timeline Samedi-Dimanche**
   - Déroulé détaillé du weekend pour tous les invités
   - Horaires de chaque moment clé
   - Présentation claire et visuelle

7. **Section Enfants**
   - Informations sur les baby-sitters disponibles
   - Activités prévues pour les enfants
   - Consignes pratiques pour les parents

8. **FAQ**
   - Questions fréquentes anticipées
   - Réponses claires et complètes
   - Réduction des sollicitations directes

9. **Design & Expérience**
   - Animation d'ouverture élégante révélant "Quentin & Élisa" et la date
   - Design sur-mesure palette pastel/doré
   - Navigation fluide et intuitive
   - Responsive (mobile/tablette/desktop)

---

### Out of Scope for MVP

**Fonctionnalités reportées en Phase 2 (Mars 2026 - Juin 2027):**

- **URL privée avec mot de passe** pour le cercle proche
- **Planning détaillé cercle proche** (vendredi installation, tâches, etc.)
- **Synchronisation Google Sheets** pour édition facile par Élisa
- **Coordination transport/covoiturage** (gestion des 9 voitures)

**Rationale:** Ces fonctionnalités sont utiles mais pas bloquantes pour l'envoi des faire-parts en mars 2026. La coordination du cercle proche peut se faire via WhatsApp initialement, puis être intégrée au site si le temps le permet.

**Fonctionnalités reportées en Phase 3 (Post-mariage Juillet 2027+):**

- **Galerie photos partagée** - Must-have après le mariage pour partager souvenirs
- **Playlist/suggestions musicales** - Nice-to-have
- Autres améliorations basées sur retours utilisateurs

---

### MVP Success Criteria

**Le MVP est considéré comme réussi si:**

**Critères de lancement (Mars 2026):**
- ✅ Site déployé et accessible via le nom de domaine
- ✅ Toutes les 9 fonctionnalités core implémentées et testées
- ✅ Design finalisé reflétant l'univers pastel/doré du mariage
- ✅ Performance mobile optimale (chargement rapide)
- ✅ Lien imprimé sur les faire-parts et prêt à être partagé

**Critères d'adoption (Mars - Juin 2026):**
- ✅ 90%+ des invités font leur RSVP via le site
- ✅ Réduction significative des questions logistiques répétitives
- ✅ Retours positifs sur le design et l'expérience utilisateur
- ✅ Aucun bug bloquant remonté

**Critères de validation technique:**
- ✅ Code propre et maintenable
- ✅ Hébergement Vercel stable et gratuit
- ✅ Coût total ≤ 10€ (nom de domaine uniquement)
- ✅ Facilité pour ajouter fonctionnalités Phase 2 si besoin

---

### Future Vision

**Si le projet fonctionne au-delà des attentes:**

**Court terme (Phase 2 - avant le mariage):**
- Ajout progressif des fonctionnalités Phase 2 si le temps le permet
- Optimisations basées sur les retours des premiers utilisateurs (invités)
- Intégration planning cercle proche si la demande est forte

**Post-mariage (Phase 3):**
- Transformation en site souvenir avec galerie photos
- Conservation du code source comme mémoire technique du projet
- Potentiel portfolio/démonstration de compétences

**Long terme (Évolution potentielle):**
- Réutilisation du code pour d'autres événements familiaux (anniversaires, baptêmes, etc.)
- Possibilité de template open-source pour d'autres mariages (si motivation)
- **OU** simplement un beau projet perso qui reste privé et précieux

**Principe directeur:** Rester flexible et ne pas sur-engineer. Le site doit servir son objectif principal (informer les invités, réduire le stress), tout en restant un projet plaisir et non une contrainte.

---
