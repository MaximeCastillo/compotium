# ROADMAP.md — le plan vivant

Relire en début de session. Retirer un item dès qu'il est livré (le résumer dans
« Livré récemment »). Court : c'est un plan, pas un backlog exhaustif.

## En cours

- [ ] Ressenti sur téléphone : valider double-tap stop, carillon, durée réglable.
- [ ] **Valider le timer en arrière-plan** : restent le test « taps en rafale = une seule
  notif à l'heure » et le test « permission refusée = l'app marche quand même ».
  ⚠️ Prérequis dev : accorder « Alarmes et rappels » à Expo Go (voir `DECISIONS.md`).

## À faire (prochain — MVP)

- [ ] Icône & splash aux couleurs de Compotium.
- [ ] Installer ESLint (`npx expo lint` échoue : le paquet n'a jamais été installé, alors
  que la boucle de vérif du `CLAUDE.md` le mentionne).

## Plus tard / idées

- **Dev build (Skia)** : vraie désintégration en particules + fond liquide/nébuleuse +
  halo « Gargantua » (style Interstellar : trou sombre, disque lumineux asymétrique).
- **Son de notification personnalisé** (le carillon au lieu du son système) — exige le
  config plugin `expo-notifications` + un dev build. À grouper avec l'item Skia.
- ⚠️ **Bloquant avant toute distribution** : déclarer `USE_EXACT_ALARM` dans le manifeste
  du build natif, sinon les notifications repartent en retard de ~40 s chez tout le monde
  (voir `DECISIONS.md` du 2026-08-09).
- V2 : **« Ne pas déranger »** pendant le timer (permission Android ; iOS via Focus/
  Screen Time).
- Build Android installable hors Expo Go (APK via EAS) ; portage iOS.

## Livré récemment

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
