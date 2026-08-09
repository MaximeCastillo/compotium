# ROADMAP.md — le plan vivant

Relire en début de session. Retirer un item dès qu'il est livré (le résumer dans
« Livré récemment »). Court : c'est un plan, pas un backlog exhaustif.

## En cours

- [ ] **Valider le design Skia** (branche `design-skia`) — fond nébuleuse, halo
  « Gargantua », particules au STOP, glissement du panneau de réglages + croix.
  Points sensoriels à juger : **fluidité** (le fond a déjà causé des micro-freezes),
  tenue du design dans **les deux thèmes**, et **chauffe** après 10 min. Fusionner
  seulement après.
- [ ] Ressenti sur téléphone : valider double-tap stop, carillon, durée réglable.

## À faire (prochain — MVP)

- [ ] **Carillon en son de notification** — les deux `.wav` sont déjà embarqués dans le
  binaire, donc c'est **du JS pur, sans rebuild**. Piège : un canal Android est
  **immuable une fois créé** ; changer son son impose un **nouvel identifiant** de canal.
- [ ] Icône & splash aux couleurs de Compotium (la config splash vit maintenant dans le
  plugin `expo-splash-screen` d'`app.json`).
- [ ] **Traiter les 46 erreurs ESLint** — le lint tourne enfin (ESLint installé avec le
  SDK 57) et découvre du code jamais linté. Dominante : `react-hooks/refs`. Aucun rapport
  avec la migration, c'est de la dette révélée. Session dédiée.

## Plus tard / idées

- V2 : **« Ne pas déranger »** pendant le timer (permission Android ; iOS via Focus/
  Screen Time).
- Avant toute distribution : relire les permissions du manifeste et affiner
  `SCHEDULE_EXACT_ALARM` avec un `maxSdkVersion="32"` (Google Play regarde ça de près).
- Portage iOS.

## Livré récemment

- 2026-08-09 : **Dépôt privé GitHub** (`MaximeCastillo/compotium`).
- 2026-08-09 : **Panneau de réglages fermable** — glissement vers le bas (Gesture Handler
  + Reanimated, sur le thread d'UI) et croix de fermeture. La poignée n'était que décor.
- 2026-08-09 : **Direction artistique Skia** — fond nébuleuse (bruit fractal + auras
  déphasées), halo « Gargantua » sur le bouton `+` (disque d'accrétion asymétrique, anneau
  de photons, arc vertical), désintégration en vraies particules au STOP.
- 2026-08-09 : **Migration Expo SDK 54 → 57** (RN 0.81 → 0.86), palier par palier.
  Fin de la taxe de décalage de versions ; permissions de service audio en avant-plan
  retirées au passage.
- 2026-08-09 : **Development build Android (EAS)** — sortie d'Expo Go. Permissions
  d'alarme exacte déclarées, les deux carillons embarqués, `RECORD_AUDIO` retiré.
  APK produit en 8 min ; validation téléphone en cours.
- 2026-08-09 : **Timer robuste en arrière-plan** — compte à rebours basé sur une date de
  fin (resynchro via `AppState`), session persistée (survit à la fermeture de l'app), et
  **notification locale** planifiée pour sonner écran verrouillé ou app tuée.
- 2026-08-08 : **Persistance des réglages** (AsyncStorage) + **switch de thème quasi
  instantané** (auras rendues en petit SVG puis agrandies par le GPU).
- 2026-08-08 : **Réglage son Court / Long** (version longue ~6,8 s du son cinématique) ;
  palettes validées & verrouillées.
- 2026-08-08 : **2 thèmes** (Calme spatial / Énergie solaire) via ThemeContext, **saisie
  clavier** de la durée, **son cinématique grave** (façon THX/Inception), **fix perf**
  (fond découplé du timer, plus de micro-freeze au start/stop).
- 2026-08-08 : **Réglages durée par tap** (stepper + choix min/sec, défaut 5 min),
  **STOP en double-tap** (arme puis confirme + désintégration), carillon adouci &
  allégé, retrait des vibrations de fin/stop, fix barre d'état (safe-area-context),
  fond mémoïsé (fluidité).
- 2026-08-08 : **Sonnerie de fin** (carillon synthétisé, expo-audio, seulement sur fin
  naturelle) + **réglages** (bouton engrenage + panneau) + **keep-awake** activable.
- 2026-08-08 : **Bouton STOP hold-to-confirm** (anneau horaire + désintégration), halo
  « éclipse » du bouton +5, secondes réécrites (single-layer, robustes), suppression du
  texte, plafond 60 min.
- 2026-08-08 : **Direction artistique** — fond spatial qui respire (auras radiales SVG),
  palette bleu profond/teal, chiffres en dissolution.
- 2026-08-08 : **MVP écran Compotium** — fond calme, bouton `+5 min`, compte à rebours,
  retour haptique. Tourne sur Android via Expo Go.
- 2026-08-08 : **1er run** — app scaffoldée (Expo SDK 54) et affichée sur le téléphone.
- 2026-08-08 : **Kickoff** — nom (Compotium), stack décidée (Expo + RN + TS), constitution
  et doc vivante posées.
