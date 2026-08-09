# LEARNING_LOG.md — journal de progression

Le journal d'apprentissage de Maxime. Relire en début de session pour se situer. Après
une session notable, ajouter un bilan daté : **concis, donnant envie de relire.**

Format :

```
## YYYY-MM-DD — <Titre>
**Construit.** <Ce qu'on a livré.>
**Appris.** <Concepts neufs digérés — ce que je sais maintenant ré-expliquer.>
**Victoires / galères.** <Ce qui a bien marché, ce qui a coincé.>
**Prochaine fois.** <Le fil à reprendre.>
```

---

## 2026-08-09 — Le timer qui survit à l'arrière-plan

**Construit.** Le compte à rebours ne compte plus les secondes, il vise une **date de
fin**. Il se resynchronise au retour au premier plan, **survit à la fermeture de l'app**
(deadline persistée), et une **notification locale** planifiée sonne la fin même écran
verrouillé ou app tuée. Permission demandée au premier tap, jamais au lancement.

**Appris.**
- 🆕 **Horloge relative vs absolue.** `remaining - 1` chaque seconde suppose que le JS
  tourne en continu — faux sur mobile, l'OS gèle le thread en arrière-plan. Viser un
  timestamp est **auto-correcteur** : peu importe si un tick est en retard ou manquant.
  Même intuition qu'un `expires_at` en base plutôt qu'un compteur dans un process web.
- 🆕 **`AppState`** : le cycle de vie mobile (`active` / `background` / `inactive`).
  C'est *l'*événement qui dit « le JS vient de se réveiller, recalcule ».
- 🆕 **Ce qu'une app a le droit de faire endormie : rien.** Pour agir à une heure donnée,
  on ne *reste* pas éveillé — on **délègue à l'OS** (notification planifiée). Renversement
  de perspective par rapport au serveur, où le process est toujours là.
- 🆕 **Permission contextuelle.** Android 13+ exige `POST_NOTIFICATIONS` à l'exécution.
  Demander au moment où ça a du sens (le premier tap) plutôt qu'au lancement, et **coder
  le refus comme un cas normal**, pas comme une erreur.
- 🆕 **Coordonner deux sources de son.** Carillon in-app *et* notif système pouvaient
  se déclencher ensemble : un `setNotificationHandler` supprime la notif au premier plan.
- **Rappel utile** : les appels asynchrones en rafale (taps répétés) veulent une **file
  de promesses**, sinon une annulation peut arriver après la planification qu'elle visait.

**Victoires / galères.** Le refactor a **simplifié** le hook au lieu de l'alourdir :
supprimer la deadline démonte l'effet, donc le « pas de carillon au STOP » est vrai *par
construction* — le ref `manualStop` a disparu. Piège évité de justesse : un tick pouvait
rejouer le carillon avant le démontage (latch `hasEnded`). Et un faux positif marrant :
`tsc` a craché 30 erreurs parce que mon shell était resté dans `node_modules/`.

**Prochaine fois.** Valider les 9 scénarios sur le téléphone (notif écran verrouillé, app
tuée, silence après STOP, refus de permission). Puis icône/splash, et le **development
build** — qui débloque d'un coup Skia *et* le carillon comme son de notification.

## 2026-08-08 — De la page blanche à l'app aboutie (grosse session)

**Construit.** Compotium, complet dans Expo Go : écran unique avec fond spatial vivant,
bouton `+5` à halo « éclipse », compte à rebours en dissolution, bouton **STOP double-tap**
(arme puis confirme + désintégration), **sonnerie de fin** (court/long, son cinématique
synthétisé), **réglages persistés** (durée min/sec avec saisie clavier + stepper,
keep-awake, thème, son) et **2 thèmes** basculables (Calme spatial / Énergie solaire).

**Appris.**
- 🆕 **Bac à sable mobile** ; **Expo Go vs development build** ; pourquoi le SDK 57 ne
  passe pas dans Expo Go (→ SDK 54).
- 🆕 **Composants natifs** (View/Text/Pressable), **styles = objets JS** (Flexbox par
  défaut, pas de `px`).
- 🆕 **API `Animated`** (boucles de respiration, `useNativeDriver`) ; le liquide/particules
  réels demandent **Skia** (dev build).
- 🆕 **react-native-svg** pour des dégradés radiaux doux + astuce perf **« rasteriser
  petit, agrandir au GPU »**.
- 🆕 **Séparer logique/UI** (hook `useCountdown`) ; **theming par contexte**
  (`ThemeProvider`/`useTheme` + `makeStyles`).
- 🆕 **Re-renders & perf** : pourquoi start/stop figeait (fond re-rendu) → découplage +
  mémoïsation.
- 🆕 **Piège Fast Refresh** après gros refactor → `expo start -c`.
- 🆕 **Vérif élargie** : `tsc` **+ build bundle** (`expo export`).
- 🆕 **Persistance locale** (AsyncStorage) ; **réalité des timers en arrière-plan**
  (timestamp + notifications, pas de `setInterval` en fond).

**Victoires / galères.** Nom trouvé (Compotium) ; identité visuelle validée et verrouillée
(2 thèmes). Boucle de feedback très efficace (tu testes sur le tel, tu décris, je corrige).
Galères instructives : compat Expo Go/SDK, bug d'affichage du compteur (course de rendu à
2 calques → réécrit en 1 calque), micro-freezes (rasterisation SVG).

**Prochaine fois.** Le **timer robuste en arrière-plan** (`AppState` + timestamp de fin +
`expo-notifications`) — ouvre la voie à la V2 « couper les notifs ». Puis icône/splash, et
le passage au **development build (Skia)** pour le fond liquide + les vraies particules.

## 2026-08-08 — Kickoff de Compotium

**Construit.** Le cadrage du projet : nom, stack, constitution (`CLAUDE.md`) et doc
vivante (décisions, principes, roadmap, ce journal).

**Appris.**
- 🆕 **Le bac à sable (sandbox) mobile** : une app ne peut pas toucher aux réglages
  système sensibles. → activer le *mode avion* depuis une app est **impossible** (iOS
  comme Android). D'où le pivot de la V2 vers « Ne pas déranger ».
- 🆕 **Expo = la surcouche « Rails-like » de React Native** : conventions + outillage.
  **Expo Go** installe l'app en scannant un QR, sans build natif ni Xcode.
- 🆕 **Cross-platform par construction** : Android d'abord ≠ enfermement ; le même code
  ira sur iOS plus tard. Choisir Android est un choix de commodité.
- **Expo Router = le App Router de Next.js** (routing par fichiers) — terrain connu.

**Victoires / galères.** Nom trouvé et qui a du sens (Compotium). Compris tôt que la V2
« mode avion » n'était pas réalisable — mieux vaut le savoir maintenant qu'après.

**Prochaine fois.** Scaffolder l'app Expo et voir le premier écran tourner sur le
téléphone. L'objectif du soir : le tout premier « ça marche ! » dans la main.
