# ROADMAP.md — le plan vivant

Relire en début de session. Retirer un item dès qu'il est livré (le résumer dans
« Livré récemment »). Court : c'est un plan, pas un backlog exhaustif.

## En cours

- [ ] Scaffolder l'app Expo (TypeScript + Expo Router) et **la faire tourner sur le
  téléphone** via Expo Go (le premier « ça marche ! »).

## À faire (prochain — MVP)

- [ ] Écran unique, épuré et moderne (fond calme, un bouton central).
- [ ] Bouton **tap → +5 min** (incréments de 5).
- [ ] **Compte à rebours** lisible et doux ; un tap pendant qu'il tourne ajoute 5 min.
- [ ] **Retour haptique** au tap (expo-haptics) — la sensation « native » qui n'existe
  pas sur le web.
- [ ] Fin de timer en douceur (vibration/animation apaisante), retour à l'état de repos.
- [ ] Polish des animations (Reanimated).

## Plus tard / idées

- V2 : **« Ne pas déranger »** pendant le timer (permission Android ; iOS via Focus/
  Screen Time plus tard).
- Persistance du timer si l'app passe en arrière-plan / se ferme.
- Icône & splash screen aux couleurs de Compotium.
- Build Android installable hors Expo Go (APK via EAS) ; portage iOS.

## Livré récemment

- 2026-08-08 : **Kickoff** — nom (Compotium), stack décidée (Expo + RN + TS), constitution
  et doc vivante posées.
