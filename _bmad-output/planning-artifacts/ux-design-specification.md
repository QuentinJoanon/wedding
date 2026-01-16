---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-wedding-2026-01-14.md'
  - '_bmad-output/planning-artifacts/prd.md'
  - 'document_de_base/cbb1a9e7-a2ca-4066-9fe1-3f76b6264987.jpg'
  - 'document_de_base/e5d9c4d1-89d8-4aea-b2d7-08dbcbc97283.jpg'
  - 'document_de_base/7a8e66b3-36c3-4496-9d96-d2b064316e4c.jpg'
  - 'document_de_base/Mariage.pdf'
  - 'document_de_base/Domaine de Mont - Liste prestataires.pdf'
---

# UX Design Specification wedding

**Author:** Quentin
**Date:** 2026-01-15

---

## Executive Summary

### Project Vision

Site de mariage sur-mesure pour Quentin & Élisa (juin 2027, 121 invités, Domaine de Mont) qui transforme l'expérience d'information traditionnelle en un moment immersif et mémorable. L'objectif est double : réduire drastiquement les questions répétitives des invités tout en créant un effet "wow" dès la première visite grâce à une animation d'ouverture sophistiquée et un design élégant qui reflète fidèlement l'univers visuel du mariage.

**Différenciateur clé :** Ne se contente pas d'informer - crée une première impression émotionnelle forte qui plonge les invités dans l'ambiance du mariage dès l'ouverture du site.

### Target Users

**Invité Standard (Sophie) - Utilisateur Principal**
- 32 ans, consultation principalement mobile
- Besoin d'accès rapide à l'information pratique (horaires, dress code, hébergements)
- Niveau technique varié dans l'audience globale (de personnes âgées à tech-savvy)
- Recherche une expérience sans friction, sans avoir à solliciter les mariés
- Contexte : Consultation en mobilité et à domicile en préparation

**Administrateurs (Quentin & Élisa)**
- Développeur + utilisatrice Google Sheets
- Besoin de contrôle total et autonomie
- Objectif : Diviser par 5 les questions répétitives
- Gestion RSVP manuelle acceptable pour MVP

**Note :** Cercle proche (29 personnes, accès privé) reporté en Phase 2

### Key Design Challenges

**1. Animation d'ouverture technique et mémorable**
- Créer un effet sophistiqué combinant élégance et émerveillement romantique
- Concept : Image fixe avec noms/date qui se dessine, puis s'ouvre en scrollant pour révéler le site
- Contrainte technique : Performance mobile 60fps sur 4G (NFR-PERF-3)
- Nécessite libs d'animation modernes (Framer Motion, GSAP, ou React Spring)

**2. Navigation intuitive multi-générationnelle**
- Audience hétérogène (personnes âgées jusqu'aux tech-savvy)
- Doit être immédiatement compréhensible sans courbe d'apprentissage
- Mobile-first mais expérience desktop équivalente
- 10 sections MVP à organiser sans submerger

**3. Architecture d'information claire**
- Équilibre entre beauté visuelle et accès rapide à l'info pratique
- Les invités doivent trouver l'info essentielle en quelques secondes
- Sections : Infos pratiques, RSVP, Liste mariage, Hébergements, Plans, Timeline, Enfants, FAQ

### Design Opportunities

**1. Expérience immersive narrative**
- Animation d'ouverture comme introduction émotionnelle au mariage
- Palette pastel/doré (rose poudré, pêche, bleu ciel, blanc crème, touches dorées) créant atmosphère cohérente
- Intégration subtile des références florales comme éléments décoratifs

**2. Micro-interactions élégantes personnalisées**
- Timeline avec icônes SVG qui se dessinent progressivement
- Génération d'assets visuels personnalisés (nano-banana-pro) : icônes aquarelle/pastel, illustrations florales dorées, éléments décoratifs
- Transitions fluides entre sections
- Animations subtiles au hover (feuillages dorés, pétales)
- Feedback visuel raffiné pour actions (RSVP, liste mariage)

**3. Design system unique et cohérent**
- Composants réutilisables inspirés de l'univers visuel du mariage
- Typographie élégante à définir (serif titres vs sans-serif lisibilité)
- Espacements et rythme vertical créant respiration
- Style illustration unifié pour tous les assets générés
- Véritable "brand" visuel unique pour le mariage

---

## Core User Experience

### Defining Experience

**L'action principale : Consulter les informations pratiques**

Les invités reviendront principalement pour consulter les informations essentielles : horaires, lieu, dress code. C'est l'action la plus fréquente qui définit l'utilité du site au-delà de la première impression.

**L'interaction critique : Animation d'ouverture**

Si l'animation d'ouverture échoue, l'expérience entière est compromise. C'est le moment qui différencie ce site d'une simple page d'informations et crée l'émerveillement romantique souhaité. Elle doit combiner élégance sophistiquée et performance technique impeccable (60fps sur mobile 4G).

**Les moments "aha!" multiples :**

1. **Émerveillement immédiat** : Dès l'animation d'ouverture, l'invité comprend que ce mariage sera spécial
2. **Soulagement informationnel** : Découverte que TOUTE l'information est centralisée et accessible
3. **Facilité d'action** : RSVP complété en 2 minutes sans friction

### Platform Strategy

**Type d'application : One-page web responsive**

- Site web une seule page (SPA) avec scroll vertical
- Mobile-first avec navigation tactile prioritaire
- Support desktop équivalent (souris/clavier)
- Pas d'application native nécessaire

**Pas de fonctionnalité offline**

- Connexion requise pour consultation
- Pas de cache offline des informations
- Architecture simplifiée

**Capacités device : Approche minimaliste**

- Pas d'intégration calendrier automatique
- Pas de geolocalisation
- Pas de partage natif complexe
- Focus sur l'expérience web pure et performante

### Effortless Interactions

**RSVP sans friction (2 minutes maximum)**

- Formulaire simple sans création de compte
- Pas d'authentification nécessaire
- Confirmation immédiate par email
- Régimes alimentaires intégrés dans le flow

**Navigation one-page intuitive**

- Tout accessible en scroll vertical
- Pas de navigation complexe multi-niveaux
- Architecture d'information prévisible
- Menu fixe pour accès rapide aux sections (optionnel)

**Retour invité facilité**

- Structure prévisible : les invités savent où retrouver l'info
- Sections clairement identifiées
- Infos essentielles (horaires, lieu, dress code) accessibles rapidement

**Timeline weekend visuellement claire**

- Format visuel avec icônes SVG qui se dessinent
- Horaires et moments clés immédiatement compréhensibles
- Pas besoin d'interprétation

**Liste mariage directe**

- Liens directs vers produits/boutiques
- Système de réservation simple pour éviter doublons
- Pas de compte requis

### Critical Success Moments

**Moment 1 : Les 3 premières secondes (Animation d'ouverture)**

- L'invité découvre l'animation révélant "Quentin & Élisa" et la date
- Si réussie : Émerveillement, anticipation, impression de qualité
- Si échouée : Frustration, déception, perception de mariage ordinaire
- **Make-or-break** : Performance 60fps mobile + élégance visuelle

**Moment 2 : Première consultation info pratique (Dans les 30 secondes)**

- L'invité cherche horaires, lieu, ou dress code
- Si réussie : Trouvé en quelques secondes, soulagement
- Si échouée : Frustration, risque de solliciter les mariés
- **Make-or-break** : Architecture d'information claire

**Moment 3 : Complétion RSVP (Dans les 2 minutes)**

- L'invité veut confirmer sa présence rapidement
- Si réussie : RSVP complété, email reçu, satisfaction
- Si échouée : Abandon du formulaire, RSVP par téléphone/WhatsApp
- **Make-or-break** : Simplicité du formulaire, zéro friction

**Moment 4 : Retour invité (Mois après première visite)**

- Sophie revient vérifier le dress code 1 semaine avant le mariage
- Si réussie : Info retrouvée immédiatement, confiance renforcée
- Si échouée : Navigation confuse, appel aux mariés
- **Make-or-break** : Cohérence et prévisibilité de la structure

### Experience Principles

**Principe 1 : "Émerveillement immédiat, utilité durable"**

L'animation d'ouverture crée l'émerveillement romantique et l'effet "wow" dès la première seconde. Mais c'est l'utilité pratique (consulter horaires, lieu, dress code) qui génère les visites répétées et la vraie valeur. Les deux doivent coexister en équilibre.

**Principe 2 : "Zero friction, zero compte"**

One-page application où tout est accessible en scroll vertical sans navigation complexe. Aucune authentification requise pour RSVP. L'objectif : 2 minutes maximum pour toute action. Navigation simple adaptée à toutes les générations (personnes âgées jusqu'aux tech-savvy).

**Principe 3 : "Mobile-first, beauté partout"**

Optimisation tactile prioritaire car consultation principalement mobile. Performance 60fps garantie même sur 4G rural. Le design élégant pastel/doré doit être identique et impeccable sur tous les devices (mobile, tablette, desktop).

**Principe 4 : "Information instantanée"**

Les invités doivent trouver les infos essentielles en quelques secondes maximum. Architecture claire avec 10 sections MVP organisées logiquement. Structure prévisible pour faciliter le retour des invités plusieurs mois après leur première visite.

---

## Desired Emotional Response

### Primary Emotional Goals

**Émerveillement romantique immédiat**

Dès l'animation d'ouverture, les invités doivent ressentir que ce mariage est spécial, raffiné et unique. L'émotion principale recherchée est l'émerveillement - ce moment où on réalise qu'on assiste à quelque chose de vraiment pensé et élégant.

**Confiance et sérénité**

Une fois passée la première impression, les invités doivent se sentir en confiance : toutes les informations sont là, clairement organisées, facilement accessibles. Plus besoin de stresser ou de déranger les mariés.

### Emotional Journey Mapping

**Découverte (Scan QR code faire-part)**
- Curiosité : "Voyons voir ce site..."
- Anticipation : "Ça a l'air soigné"

**Animation d'ouverture (3 premières secondes)**
- Émerveillement : "Wow, c'est magnifique !"
- Impression de qualité : "Ce mariage va être exceptionnel"
- Anticipation excitante : "J'ai encore plus hâte d'y être"

**Navigation et consultation (30 secondes - 2 minutes)**
- Soulagement : "Tout est là, parfait"
- Confiance : "C'est clair, je sais où trouver ce qu'il me faut"
- Facilité : "C'est fluide et agréable à consulter"

**RSVP (2 minutes)**
- Satisfaction : "C'était simple et rapide"
- Accomplissement : "Voilà, c'est fait !"

**Retour 3 mois après**
- Familiarité rassurante : "Je reconnais la structure, je sais où aller"
- Efficacité : "Info trouvée en 10 secondes"

### Micro-Emotions

**Priorité 1 : Émerveillement > Satisfaction**
L'objectif n'est pas juste "ok c'est bien" mais "wow c'est magnifique". Le site doit créer une réaction émotionnelle forte, pas juste remplir sa fonction.

**Priorité 2 : Confiance > Confusion**
Navigation limpide, architecture prévisible. Aucun moment où l'invité se demande "où est l'info que je cherche ?". Zero courbe d'apprentissage.

**Priorité 3 : Anticipation > Anxiété**
Le site doit donner envie d'être au mariage, pas créer du stress logistique. Les informations rassurent et excitent en même temps.

**Priorité 4 : Appartenance**
Les invités se sentent inclus dans quelque chose de spécial dès la première visite. L'attention aux détails du site reflète l'attention qu'on leur porte.

### Design Implications

**Émerveillement romantique → Animation d'ouverture sophistiquée**
- Performance 60fps impeccable (pas de lag qui casse la magie)
- Concept "dessin progressif puis ouverture" exécuté avec élégance
- Palette pastel/doré cohérente dès les premières secondes
- Transitions fluides et raffinées

**Confiance → Architecture d'information claire**
- Sections logiquement organisées (Infos pratiques en haut, FAQ en bas)
- Titres explicites, pas de langage créatif qui confond
- Hiérarchie visuelle forte (ce qui est important saute aux yeux)
- Navigation prévisible (structure qu'on mémorise facilement)

**Sérénité → Zero friction partout**
- RSVP : formulaire minimal, pas de compte, confirmation immédiate
- Pas de pop-ups intrusifs ou d'interactions qui dérangent
- Temps de chargement rapides (pas d'anxiété pendant le loading)
- Feedback visuel rassurant pour chaque action

**Anticipation excitante → Micro-interactions délicates**
- Icônes timeline qui se dessinent (créent du mouvement et de la vie)
- Animations hover subtiles (feuillages dorés, pétales)
- Transitions entre sections fluides (scroll agréable)
- Éléments décoratifs floraux qui rappellent l'univers du mariage

**Appartenance → Personnalisation unique**
- Assets générés sur-mesure (pas de templates génériques)
- Design qui reflète précisément la déco réelle (palette exacte)
- Attention aux détails visible (typographie, espacements, rythme)
- Site qui dit "on a pensé à vous" par son niveau de finition

### Emotional Design Principles

**Principe 1 : "Magie technique invisible"**

La sophistication technique (animations SVG, performance 60fps, transitions fluides) doit créer de l'émerveillement sans que l'invité comprenne "comment c'est fait". La technique au service de l'émotion, jamais l'inverse.

**Principe 2 : "Beauté qui rassure"**

Le design élégant n'est pas juste esthétique - il communique que tout est sous contrôle, que le mariage sera aussi bien organisé que ce site. La beauté visuelle crée la confiance.

**Principe 3 : "Simplicité sophistiquée"**

One-page, zero compte, 2 minutes pour RSVP - mais avec un niveau de finition exceptionnel. Simple ne veut pas dire basique. Chaque interaction doit être à la fois effortless et élégante.

**Principe 4 : "Anticipation croissante"**

Chaque visite doit renforcer l'envie d'être au mariage. Les micro-interactions, les visuels floraux, la palette pastel/doré - tout contribue à construire l'anticipation positive jusqu'en juin 2027.

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Apple Product Pages (apple.com)**

**Ce qu'ils font bien :**
- Animations scroll-triggered élégantes et fluides (60fps garanti)
- Hero sections avec visuels qui se révèlent progressivement
- Transitions douces entre sections lors du scroll
- Performance impeccable même sur mobile
- Typographie sophistiquée avec hiérarchie visuelle forte

**Patterns applicables :**
- Animation d'ouverture avec reveal progressif → Parfait pour votre concept "dessin puis ouverture"
- Scroll fluide avec parallax subtil → Transitions entre sections du site
- Performance 60fps mobile → Critère make-or-break pour votre animation

---

**Airbnb Experiences**

**Ce qu'ils font bien :**
- Architecture d'information claire (trouve l'info en quelques secondes)
- Cards visuelles avec hiérarchie évidente
- Timeline visuelle pour les activités (similaire à votre timeline weekend)
- Navigation simple, zéro compte pour consulter
- Mobile-first impeccable

**Patterns applicables :**
- Timeline avec icônes et horaires → Directement applicable à votre timeline weekend
- Cards pour hébergements → Catalogue d'hébergements recommandés
- Navigation sticky subtile → Menu fixe optionnel

---

**Stripe Documentation & Checkout**

**Ce qu'ils font bien :**
- Formulaires ultra-simples, zero friction
- Feedback visuel immédiat sur chaque action
- Messages d'erreur clairs et rassurants
- Performance instantanée
- Design élégant sans sacrifier la clarté

**Patterns applicables :**
- Formulaire RSVP minimaliste → 2 minutes maximum
- Feedback visuel rassurant → Confirmation immédiate
- Validation inline → Évite frustration

---

**Awwwards Sites (animations premium)**

**Ce qu'ils font bien :**
- SVG draw animations (traits qui se dessinent)
- Micro-interactions hover délicates
- Transitions page sophistiquées
- Palette couleurs cohérente partout
- Attention extrême aux détails (espacements, rythme)

**Patterns applicables :**
- SVG path animation → Icônes timeline qui se dessinent
- Hover states subtils → Feuillages dorés, pétales
- Design system cohérent → Brand visuel unique mariage

### Transferable UX Patterns

**Pattern 1 : Hero Reveal Animation**
- **Source :** Apple product pages
- **Application :** Animation d'ouverture "Quentin & Élisa" + date
- **Adaptation :** Utiliser SVG draw pour dessiner les noms progressivement, puis transition "ouverture" au scroll
- **Tech :** Framer Motion ou GSAP avec scroll trigger

**Pattern 2 : Visual Timeline**
- **Source :** Airbnb Experiences
- **Application :** Timeline weekend samedi-dimanche
- **Adaptation :** Icônes SVG personnalisées (cérémonie, repas, soirée) qui se dessinent au scroll
- **Bénéfice :** Compréhension immédiate du déroulé

**Pattern 3 : Sticky Section Headers**
- **Source :** Sites one-page modernes
- **Application :** Navigation entre les 10 sections MVP
- **Adaptation :** Menu fixe discret, pas intrusif, disparaît au scroll down / réapparaît au scroll up
- **Bénéfice :** Accès rapide aux sections sans pollution visuelle

**Pattern 4 : Minimal Form with Inline Validation**
- **Source :** Stripe checkout
- **Application :** Formulaire RSVP
- **Adaptation :** Validation temps réel, feedback positif (✓ vert), messages d'erreur constructifs
- **Bénéfice :** Confiance et rapidité (2 min max)

**Pattern 5 : Scroll-Triggered Micro-Animations**
- **Source :** Awwwards sites premium
- **Application :** Éléments décoratifs floraux, icônes, transitions sections
- **Adaptation :** Animations subtiles (fade-in, slide-up, draw) déclenchées au scroll
- **Bénéfice :** Fluidité et élégance sans ralentir navigation

**Pattern 6 : Card-Based Information Architecture**
- **Source :** Airbnb
- **Application :** Catalogue hébergements, liste mariage
- **Adaptation :** Cards avec visuels, infos essentielles, CTA clair (lien direct)
- **Bénéfice :** Scannable, mobile-friendly

### Anti-Patterns to Avoid

**Anti-Pattern 1 : Parallax excessif**
- **Problème :** Ralentit performance mobile, donne le mal de mer
- **Pourquoi éviter :** Votre critère 60fps mobile 4G est non-négociable
- **Alternative :** Parallax subtil uniquement pour hero, pas dans le contenu

**Anti-Pattern 2 : Navigation hamburger cachée**
- **Problème :** Force les utilisateurs à chercher, pas intuitif pour personnes âgées
- **Pourquoi éviter :** Audience multi-générationnelle, info doit être accessible immédiatement
- **Alternative :** Navigation sticky visible ou scroll vertical évident

**Anti-Pattern 3 : Auto-play vidéo/audio**
- **Problème :** Consommation data mobile, intrusion, stress
- **Pourquoi éviter :** Consultation mobile prioritaire, principe "zero friction"
- **Alternative :** Animations statiques élégantes (SVG, CSS)

**Anti-Pattern 4 : Formulaires multi-étapes pour actions simples**
- **Problème :** Augmente friction, risque abandon
- **Pourquoi éviter :** RSVP doit être 2 minutes max, zero compte
- **Alternative :** Formulaire une page, champs groupés logiquement

**Anti-Pattern 5 : Pop-ups intrusifs**
- **Problème :** Frustration, impression de spam, bloque contenu
- **Pourquoi éviter :** Principe "sérénité", pas d'interactions qui dérangent
- **Alternative :** Informations intégrées naturellement dans le flow

**Anti-Pattern 6 : Animations qui bloquent l'accès au contenu**
- **Problème :** Utilisateur impatient ne peut pas skip, frustration
- **Pourquoi éviter :** Info pratique doit être accessible rapidement (moment critique #2)
- **Alternative :** Animation d'ouverture skippable au scroll, contenu immédiatement accessible après

**Anti-Pattern 7 : Design "créatif" au détriment de la clarté**
- **Problème :** Titres de sections obscurs, navigation non-standard confuse
- **Pourquoi éviter :** Principe "confiance > confusion", architecture prévisible
- **Alternative :** Titres explicites ("Horaires" pas "Le Grand Jour"), structure mémorisable

### Design Inspiration Strategy

**Ce qu'on adopte directement :**

1. **SVG Draw Animations (Awwwards)**
   - Icônes timeline qui se dessinent progressivement
   - Noms "Quentin & Élisa" tracés à la main (effet calligraphie)
   - Justification : Crée émerveillement sans sacrifier performance

2. **Scroll-Triggered Reveals (Apple)**
   - Sections qui apparaissent avec fade-in + slight slide-up au scroll
   - Hero animation déclenchée puis transitions fluides
   - Justification : Fluidité one-page, guide l'œil naturellement

3. **Minimal Form Design (Stripe)**
   - RSVP : champs essentiels uniquement, validation inline, feedback immédiat
   - Justification : Atteint objectif 2 minutes, zero friction

**Ce qu'on adapte pour notre contexte :**

1. **Timeline Visuelle (Airbnb) → Timeline Weekend Mariage**
   - Adapter le pattern pour déroulé samedi-dimanche
   - Icônes personnalisées générées (nano-banana-pro) style aquarelle/pastel
   - Horaires clairs avec descriptions courtes
   - Justification : Contexte mariage unique, pas voyage

2. **Navigation Sticky (Sites one-page) → Menu Discret**
   - Adapter pour être minimal et non-intrusif
   - Disparaît au scroll down, réapparaît au scroll up (comportement moderne)
   - Justification : Utile pour retour invité, mais ne doit pas polluer l'élégance

3. **Cards (Airbnb) → Hébergements & Liste Mariage**
   - Adapter le layout cards pour palette pastel/doré
   - Bordures subtiles dorées, hover states élégants
   - Justification : Pattern efficace mais doit matcher univers visuel

**Ce qu'on évite complètement :**

1. **Templates de sites de mariage génériques**
   - Raison : Vous voulez design unique sur-mesure, pas cookie-cutter
   - Impact : Différenciateur clé = personnalisation totale

2. **Mega-menus complexes**
   - Raison : One-page scroll vertical, pas besoin navigation lourde
   - Impact : Simplicité architecturale

3. **Authentification pour consulter infos**
   - Raison : Friction inutile, invités veulent accès immédiat
   - Impact : Principe "zero compte"

4. **Animations lourdes non-optimisées**
   - Raison : Performance 60fps mobile 4G non-négociable
   - Impact : Animation d'ouverture = make-or-break moment

**Stratégie de mise en œuvre :**

**Phase 1 : Animation d'ouverture (Critique)**
- Recherche libs animation (Framer Motion vs GSAP vs React Spring)
- POC SVG draw + scroll reveal semaine 1
- Performance testing mobile immédiat

**Phase 2 : Architecture & Navigation**
- Structure one-page avec sections claires
- Menu sticky optionnel (tester avec/sans)
- Scroll fluide entre sections

**Phase 3 : Micro-interactions**
- Timeline SVG animations
- Hover states subtils
- Transitions entre sections

**Phase 4 : Forms & Interactions**
- RSVP minimaliste avec validation inline
- Feedback visuel raffiné
- Test utilisateur (Élisa + 2-3 personnes)

---

## Design System Foundation

### Design System Choice

**Tailwind CSS + headlessui (composants headless)**

Approche utility-first sans design pré-imposé, permettant un contrôle total du visuel tout en accélérant le développement.

**Stack complet :**
- **Tailwind CSS** : Framework CSS utility-first pour styling rapide et personnalisé
- **headlessui** : Composants headless (logique sans style) pour éléments interactifs
- **Framer Motion** : Animations SVG draw et scroll-triggered
- **Alternative considérée** : shadcn/ui (Tailwind + Radix UI) pour components pré-faits copiables

### Rationale for Selection

**1. Performance 60fps mobile non-négociable**
- Tailwind compile en CSS statique (zero runtime JavaScript)
- JIT compiler génère uniquement le CSS utilisé
- Pas de styles CSS-in-JS qui ralentissent le rendering
- Optimal pour animations fluides critiques

**2. Personnalisation totale de l'univers visuel**
- Palette pastel/doré définie en `tailwind.config.js`
- Pas de thème Material/Bootstrap à surcharger
- headlessui = logique sans style imposé
- Contrôle 100% du design pour design unique mariage

**3. Rapidité de développement (timeline 2-3 mois)**
- Utility classes = pas de CSS custom à écrire
- Prototypage rapide directement en JSX
- Documentation exhaustive et communauté massive
- Développement solo facilité

**4. Intégration parfaite avec Framer Motion**
- Combo Tailwind + Framer Motion = standard industrie
- Classes utility pour états hover/focus + animations JS sophistiquées
- SVG draw animations compatibles out-of-the-box

**5. Maintenance et évolutivité**
- Stack maîtrisée par vous
- Pas de dépendance à un design system externe complexe
- Facilité d'ajout de fonctionnalités Phase 2
- Code propre et lisible pour reprise ultérieure

### Implementation Approach

**1. Configuration Tailwind (Semaine 1)**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Palette mariage
        pastel: {
          rose: '#F8D7DA',     // Rose poudré
          peach: '#FADADD',    // Pêche
          blue: '#B0C4DE',     // Bleu ciel
          cream: '#FFF9E6',    // Blanc crème
        },
        gold: {
          light: '#F4E3C1',    // Or clair
          DEFAULT: '#D4AF37',  // Or
          dark: '#B8860B',     // Or foncé
        }
      },
      fontFamily: {
        // À définir (serif titres, sans-serif body)
        heading: ['serif-font', 'Georgia', 'serif'],
        body: ['sans-font', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Rythme vertical custom
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'draw': 'draw 2s ease-in-out forwards',
      }
    }
  }
}
```

**2. headlessui pour composants interactifs**
- Menu navigation sticky (optionnel)
- Transitions entre sections
- Validation formulaire RSVP

**3. Framer Motion pour animations critiques**
- Animation d'ouverture SVG draw
- Scroll-triggered reveals
- Micro-interactions hover

**4. Structure fichiers**
```
src/
  components/
    Hero/          # Animation d'ouverture
    Timeline/      # Timeline SVG animée
    RSVPForm/      # Formulaire avec validation
    Card/          # Cards hébergements/liste mariage
  styles/
    tailwind.css   # Import Tailwind
  utils/
    animations.ts  # Helpers Framer Motion
```

### Customization Strategy

**Design Tokens (via Tailwind config)**

**Couleurs :**
- Palette pastel/doré définie précisément
- Variations (_light, DEFAULT, _dark) pour flexibilité
- Variables CSS custom pour gradients si nécessaire

**Typographie :**
- **Heading (Titres)** : Serif élégante (à choisir : Playfair Display, Cormorant, ou custom)
- **Body (Texte)** : Sans-serif lisible (à choisir : Inter, Outfit, ou system-ui)
- Scale typographique harmonieuse (text-xs → text-6xl)

**Espacements & Rythme :**
- Rythme vertical cohérent (multiples de 8px ou 4px)
- Sections avec breathing room (py-16, py-24, py-32)
- Cards avec padding généreux

**Animations :**
- Durées : 200ms (micro), 400ms (transitions), 600ms+ (hero)
- Easing : ease-out (apparitions), ease-in-out (mouvements)
- Keyframes custom pour SVG draw

**Composants réutilisables :**

**Button Component :**
```jsx
// Variants: primary (gold), secondary (pastel), ghost
className="px-6 py-3 rounded-md bg-gold hover:bg-gold-dark
           transition-colors duration-200 font-heading"
```

**Card Component :**
```jsx
// Pour hébergements et liste mariage
className="p-6 rounded-lg border border-gold-light
           hover:shadow-lg transition-shadow duration-300
           bg-pastel-cream"
```

**Timeline Icon Component :**
```jsx
// SVG avec path animation
<motion.svg>
  <motion.path
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  />
</motion.svg>
```

**Form Input Component :**
```jsx
// Validation inline, feedback visuel
className="border-2 border-pastel-blue focus:border-gold
           rounded-md px-4 py-2 transition-colors"
```

**Assets personnalisés (nano-banana-pro) :**
- Icônes timeline style aquarelle/pastel
- Éléments décoratifs floraux (feuillages dorés)
- Illustrations pour séparateurs de sections
- Style cohérent défini en prompt model

**Stratégie de personnalisation progressive :**

**Phase MVP :**
1. Configuration Tailwind avec palette exacte
2. Typographie définie et testée
3. Composants de base (Button, Card, Input)
4. Animation hero avec Framer Motion

**Phase Polish :**
1. Micro-interactions hover raffinées
2. Assets générés intégrés
3. Design tokens ajustés basés sur tests visuels
4. Performance optimization (PurgeCSS automatique)

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->
