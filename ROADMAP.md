# ROADMAP.md — le plan vivant

Relire en début de session. Retirer un item dès qu'il est livré (le résumer dans
« Livré récemment »). Court : c'est un plan, pas un backlog exhaustif.

## En cours

- [ ] **Valider le development build sur le téléphone** :
  - « Alarmes et rappels » doit être **déjà accordée** sans intervention (c'est la preuve
    que `USE_EXACT_ALARM` fait son travail pour un vrai utilisateur) ;
  - rejouer le test « app tuée » → notif à la seconde ;
  - test reporté « taps en rafale = une seule notif à l'heure » ;
  - test reporté « permission notif refusée = l'app marche quand même ».
- [ ] Ressenti sur téléphone : valider double-tap stop, carillon, durée réglable.

## À faire (prochain — MVP)

- [ ] **Carillon en son de notification** — les deux `.wav` sont déjà embarqués dans le
  binaire, donc c'est **du JS pur, sans rebuild**. Piège : un canal Android est
  **immuable une fois créé** ; changer son son impose un **nouvel identifiant** de canal.
- [ ] Icône & splash aux couleurs de Compotium.
- [ ] Installer ESLint (`npx expo lint` échoue : le paquet n'a jamais été installé, alors
  que la boucle de vérif du `CLAUDE.md` le mentionne).

## Plus tard / idées

- **Skia** (débloqué par le dev build) : vraie désintégration en particules + fond
  liquide/nébuleuse + halo « Gargantua » (style Interstellar : trou sombre, disque
  lumineux asymétrique). Module natif → prévoir un rebuild.
- V2 : **« Ne pas déranger »** pendant le timer (permission Android ; iOS via Focus/
  Screen Time).
- Avant toute distribution : relire les permissions du manifeste et affiner
  `SCHEDULE_EXACT_ALARM` avec un `maxSdkVersion="32"` (Google Play regarde ça de près).
- Portage iOS.

## Livré récemment

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
