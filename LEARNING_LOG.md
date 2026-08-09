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

## 2026-08-09 — Dessiner avec un moteur graphique

**Construit.** Le dépôt privé GitHub. Un panneau de réglages qui **se ferme** (glissement
vers le bas + croix) — sa poignée n'avait jamais été qu'un dessin. Et la direction
artistique : fond nébuleuse en bruit fractal, halo **« Gargantua »** sur le bouton `+`,
désintégration en vraies particules au STOP. Palettes intactes.

**Appris.**
- 🆕 **SVG décrit, Skia dessine.** SVG est une liste d'objets que le système rasterise ;
  Skia est le moteur 2D de Chrome et d'Android — on touche au pipeline graphique. D'où le
  vrai flou gaussien, les modes de fusion et le bruit procédural, hors de portée en SVG.
- 🆕 **Le thread d'UI.** Reanimated compile les fonctions d'animation en **worklets** qui
  tournent hors du JS. C'est ce qui rend un geste fluide même quand le JS travaille — et
  c'est la vraie réponse au « JS gelé » croisé toute la journée sur le timer.
- 🆕 **L'ordre de dessin fait le volume.** Le halo n'est lisible comme trou noir que parce
  que le disque est peint *avant* le cœur, puis l'arc vertical *après*. Il a fallu que
  Skia peigne aussi le bouton — une vue native au-dessus aurait masqué la partie censée
  passer devant.
- 🆕 **Un geste sans arbitrage vole les appuis.** Gesture Handler arbitre nativement ; j'ai
  quand même sorti la croix de la zone de geste, parce que la meilleure gestion d'un
  conflit reste de ne pas le créer.
- 🆕 **Le JS est gratuit, le natif non.** Le build lancé avant d'écrire une ligne de design
  contient tout le nécessaire : il n'embarque que les modules natifs, le JS vient de Metro.

**Victoires / galères.** Un `babel.config.js` écrit « par précaution » a cassé le bundle
sur un `transformFile` incompréhensible — le preset Expo injecte déjà le plugin worklets,
et le fichier manuel ne pouvait pas le résoudre. Diagnostic en écartant le fichier plutôt
qu'en lisant l'erreur : parfois le test le plus bête est le plus rapide.

**Prochaine fois.** Juger le rendu sur le téléphone — fluidité, tenue dans les deux
thèmes, chauffe. Puis le carillon en son de notification.

## 2026-08-09 — Rattraper trois SDK d'un coup

**Construit.** Migration **Expo 54 → 55 → 56 → 57** (React Native 0.81 → 0.86), sur une
branche, palier par palier, un commit par palier vert. Trois correctifs seulement dans tout
le code. Au passage : suppression des permissions de service audio en avant-plan.

**Appris.**
- 🆕 **Être en retard sur le SDK est une taxe, pas un état neutre.** Les paquets `expo-*`
  portent désormais le numéro du SDK (`expo-audio@57.x`) : en SDK 54, npm résolvait les
  dépendances transitives vers la génération 57 et l'app crashait au démarrage. En 57, la
  résolution par défaut est simplement correcte — le problème ne se pose plus.
- 🆕 **`expo-doctor` est l'outil qui manquait.** Il détecte les doublons de modules natifs
  et valide le schéma de config. `expo install --check` ne voit **que** les dépendances
  directes — c'est précisément l'angle mort qui nous a coûté un build.
- 🆕 **Migrer ≠ recréer.** 1 317 lignes, 11 dépendances légères : c'était un bump de
  versions. Recréer aurait risqué de perdre les palettes verrouillées et les cas limites
  durcis, pour zéro gain. Le monter **palier par palier** localise la casse gratuitement,
  puisqu'on ne compile en natif qu'à l'arrivée.
- 🆕 **Un bundle qui passe ne prouve rien sur les types.** `StyleSheet.absoluteFillObject`
  a disparu en RN 0.85 : Metro bundlait sans broncher, seul `tsc` l'a vu. Les deux vérifs
  ne se remplacent pas.
- 🆕 **Une rustine de version a une date de péremption.** Les `overrides` posés le matin
  pour survivre en SDK 54 auraient recréé le même crash **à l'envers** en SDK 57. Épingler
  une version, c'est contracter une dette qu'il faut penser à rembourser.

**Victoires / galères.** Trois majeures traversées avec 3 lignes de code touchées — le
minimalisme du produit (pas de routeur, pas de réseau, pas de webview) a payé
comptant. Et `expo-doctor` a signalé exactement la classe de bug qui nous avait coûté un
build, ce qui l'a fait entrer dans la boucle de vérif du `CLAUDE.md`.

**Prochaine fois.** Valider le build 57 sur le téléphone (surtout la fluidité du fond),
fusionner dans `master`. Puis le carillon en son de notification — toujours du JS pur.

## 2026-08-09 — Sortir d'Expo Go : le premier build natif

**Construit.** Un **development build Android** via EAS Build (cloud), en 8 min. Il déclare
`USE_EXACT_ALARM` — ce qui rend le minuteur ponctuel **pour un vrai utilisateur**, sans le
réglage manuel qu'il fallait bricoler dans Expo Go — et embarque les deux carillons pour
plus tard. `RECORD_AUDIO` retiré au passage.

**Appris.**
- 🆕 **Expo Go est un binaire figé.** Il a *son* manifeste ; une app qui tourne dedans ne
  peut donc jamais déclarer ses propres permissions ni embarquer ses propres ressources
  natives. C'est un plafond structurel, pas une suite de petits manques — d'où la sortie.
- 🆕 **Le cycle de dev ne change pas.** Metro et Fast Refresh continuent. **Seul le natif**
  (permissions, config plugins, ressources, modules) coûte un rebuild. La bonne habitude :
  **grouper** les changements natifs pour ne pas repayer la file d'attente.
- 🆕 **L'identifiant de package** : la clé primaire de l'app dans tout l'écosystème, en
  DNS inversé, **définitive**. Et le **keystore** : la clé de signature ; la perdre, c'est
  ne plus jamais pouvoir mettre à jour son app.
- 🆕 **Les noms de ressources Android deviennent du code** (`R.raw.chime_long`), donc pas
  de tiret. C'est ce qui a fait tomber le premier build en 26 s.
- 🆕 **Le natif rend visible ce qu'on ne voyait pas.** Le plugin `expo-audio` ajoutait
  `RECORD_AUDIO` : invisible dans Expo Go, bien réel dans un build. Une minuterie n'a
  aucune raison de demander le micro → `recordAudioAndroid: false`.

**Victoires / galères.** Bonne méthode sur l'échec de build : au lieu de deviner, lire la
source du plugin, trouver l'assertion exacte (`assertValidAndroidAssetName`), **l'exécuter
sur nos fichiers** pour voir lequel cassait, puis la rejouer après correction pour prouver
que ça passerait. Diagnostic en quelques minutes, sans brûler de build. Le log EAS, lui,
a résisté à toutes mes tentatives de décompression — l'indice « phase Prebuild, 26 s »
valait mieux que le log.

**Prochaine fois.** Valider sur le téléphone (surtout : « Alarmes et rappels » accordée
d'office). Puis le carillon en son de notification — **du JS pur, sans rebuild**.

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
- 🆕 **« Planifié » ≠ « garanti à la seconde ».** Android a deux qualités de service
  d'alarme, et l'exacte coûte une permission spéciale car elle réveille le processeur.
  Sans elle, le système regroupe l'alarme pour la batterie → ~40 s de retard. Diagnostic
  fait **en lisant la source native du module**, pas en devinant : la branche
  `canScheduleExactAlarms()` de `ExpoSchedulingDelegate` disait tout.
- **Rappel utile** : les appels asynchrones en rafale (taps répétés) veulent une **file
  de promesses**, sinon une annulation peut arriver après la planification qu'elle visait.

**Victoires / galères.** Le refactor a **simplifié** le hook au lieu de l'alourdir :
supprimer la deadline démonte l'effet, donc le « pas de carillon au STOP » est vrai *par
construction* — le ref `manualStop` a disparu. Piège évité de justesse : un tick pouvait
rejouer le carillon avant le démontage (latch `hasEnded`). Et un faux positif marrant :
`tsc` a craché 30 erreurs parce que mon shell était resté dans `node_modules/`.

**Vérifié sur le téléphone.** Notif écran verrouillé ✅, app tuée ✅, reprise du compteur à
la réouverture ✅, silence après un STOP ✅, pas de double son quand ça finit app ouverte ✅.
Restent les taps en rafale et le refus de permission.

**Prochaine fois.** Finir les deux derniers tests, puis icône/splash. Et le **development
build**, qui débloque d'un coup trois choses : l'alarme exacte pour tous les utilisateurs,
le carillon comme son de notification, et Skia pour le fond liquide.

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
