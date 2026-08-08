# ROADMAP.md — le plan vivant

Relire en début de session. Retirer un item dès qu'il est livré (le résumer dans
« Livré récemment »). Court : c'est un plan, pas un backlog exhaustif.

## En cours

- [ ] Ressenti sur téléphone : valider sonnerie + réglages + keep-awake.

## À faire (prochain — MVP)

- [ ] Icône & splash aux couleurs de Compotium.
- [ ] Affiner la sonnerie si besoin (volume, timbre).

## Plus tard / idées

- **Dev build (Skia)** : vraie désintégration en particules + fond liquide/nébuleuse +
  halo « Gargantua » (style Interstellar : trou sombre, disque lumineux asymétrique).
- V2 : **« Ne pas déranger »** pendant le timer (permission Android ; iOS via Focus/
  Screen Time).
- Persistance des réglages (keep-awake) via AsyncStorage.
- Persistance du timer si l'app passe en arrière-plan / se ferme.
- Build Android installable hors Expo Go (APK via EAS) ; portage iOS.

## Livré récemment

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
