# DECISIONS.md — journal des décisions (ADR)

Append-only. Une entrée = une décision. On ne réécrit jamais le passé : si une décision
est revue, on ajoute une **nouvelle** entrée qui la remplace. Court, daté, orienté
**pourquoi**.

Format :

```
## YYYY-MM-DD — <Titre>
**Contexte.** <Le choix à trancher, 1-2 phrases.>
**Décision.** <Ce qu'on a retenu.>
**Pourquoi.** <La raison ; ce qu'on a écarté et pourquoi.>
```

---

## 2026-08-08 — Cross-platform plutôt que natif

**Contexte.** App = un timer 100 % UI custom, aucune logique propre à un OS.
**Décision.** Un seul code cross-platform (React Native), pas de natif Swift/Kotlin.
**Pourquoi.** Écrire deux fois n'apporterait rien ici ; le cross-platform est gratuit
pour ce type d'app et Maxime capitalise sur React (qu'il maîtrise déjà).

## 2026-08-08 — Expo (managed) plutôt que React Native nu

**Contexte.** Il faut installer l'app sur le téléphone **ce soir**, sans usine à gaz.
**Décision.** Expo (managed workflow) + Expo Router + TypeScript.
**Pourquoi.** Expo est la surcouche « Rails-like » de RN : conventions + outillage, et
surtout **Expo Go** installe l'app en scannant un QR (aucun build natif, aucun Xcode/
Android Studio requis pour démarrer). RN nu = setup lourd, écarté pour un premier projet.

## 2026-08-08 — Android d'abord, iOS gardé ouvert

**Contexte.** Pas d'iPhone à disposition ; Maxime veut néanmoins un apprentissage qui
ouvre les deux plateformes.
**Décision.** Développer et tester sur Android maintenant ; iOS portable par construction
(même code, run/build iOS plus tard sur le Mac).
**Pourquoi.** Choix de commodité, pas d'enfermement. Bonus : le « Ne pas déranger » (V2)
est justement pilotable sur Android.

## 2026-08-08 — Nom du projet : Compotium

**Contexte.** Chercher un nom latin/philo mêlant contrôle, focus, se recomposer, créer.
**Décision.** **Compotium** (slug `compotium`), fusion de *compos (mentis)* et *otium*.
**Pourquoi.** Porte les deux idées (maîtrise + repos contemplatif) en un mot unique et
ownable. Écartés : Composium (plus fluide mais perd l'*otium*), Recompose, Serenus, Otium.

## 2026-08-08 — Réalité produit : la V2 ne peut pas activer le « mode avion »

**Contexte.** Idée V2 initiale : mettre le téléphone en mode avion pendant le timer.
**Décision.** On abandonne le mode avion automatique ; la V2 visera **« Ne pas déranger /
couper les notifications »** pendant le compte à rebours.
**Pourquoi.** Le **bac à sable** de l'OS interdit à toute app d'activer le mode avion
(ni iOS, ni Android — l'API n'existe pas). En revanche le « Ne pas déranger » est
pilotable sur Android avec une permission utilisateur ; sur iOS ça passera par Focus /
Screen Time. C'est le cœur d'apprentissage de la V2.

## 2026-08-08 — Expo Go plafonne au SDK 54 → on aligne le projet sur SDK 54

**Contexte.** `create-expo-app` génère du SDK 57, mais l'Expo Go des stores ne lit que
le **SDK 54** (le nouveau SDK n'est pas encore déployé sur les stores ; Expo pousse
désormais les *development builds* pour le vrai dev).
**Décision.** Développer le MVP en **SDK 54**, sur base `blank-typescript`, lancé dans
Expo Go.
**Pourquoi.** Chemin le plus rapide vers « app dans la main ce soir », sans compte ni
build. Le MVP (tap + compte à rebours + haptique) n'a besoin de rien qu'Expo Go n'ait
déjà. On migrera vers un **development build** à la V2, quand un module natif (« Ne pas
déranger ») le rendra obligatoire. Remplace le SDK 57 du scaffold initial.

## 2026-08-08 — Démarrer sans Expo Router (YAGNI)

**Contexte.** La base blank n'embarque pas de routeur ; l'app MVP tient sur un seul écran.
**Décision.** Pas de routeur au MVP (un `App.tsx` unique) ; on ajoutera **Expo Router**
au premier vrai 2ᵉ écran (réglages en V2).
**Pourquoi.** Minimalisme / YAGNI : un routeur pour un seul écran est du poids inutile.
Ajuste la mention « Expo Router » de la stack initiale — on le réintroduit dès qu'un
besoin concret apparaît.

## 2026-08-08 — Theming par contexte (2 palettes)

**Contexte.** On veut plusieurs thèmes visuels (Calme spatial, Énergie solaire)
basculables à chaud depuis les réglages.
**Décision.** Deux palettes aux **mêmes clés** (`spatial`, `solar`) + un **ThemeContext** ;
les composants lisent la palette active via `useTheme()`, et les styles colorés sont
construits via `makeStyles(palette)`.
**Pourquoi.** Une source unique par thème, bascule instantanée, aucune couleur à faire
transiter en props. Écarté : dupliquer des composants par thème (ingérable).

## 2026-08-08 — Fond découplé de l'état du timer (perf)

**Contexte.** Micro-freezes au démarrage/arrêt : changer `isRunning` re-rendait les 3
grands dégradés SVG du fond.
**Décision.** Le fond ne dépend plus que du thème (mémoïsé) ; il ne se re-rend jamais sur
un changement d'état du timer.
**Pourquoi.** Le re-render SVG était la cause des saccades. Le fond respire en continu,
indépendamment du minuteur.

## 2026-08-08 — Palettes validées (verrouillées)

**Contexte.** Les deux thèmes (Calme spatial bleu-vert profond / Énergie solaire feu)
correspondent exactement à l'intention produit.
**Décision.** Les valeurs des palettes `spatial` et `solar` sont **validées** ; on n'y
touche plus sauf raison explicite.
**Pourquoi.** L'identité visuelle est trouvée et fait partie de l'âme de Compotium
(désactiver les pollutions de l'esprit dans un espace apaisant). Éviter de dériver.

## 2026-08-09 — Le timer est une date de fin, pas un compteur

**Contexte.** Le compte à rebours décrémentait un compteur toutes les secondes. L'OS gèle
le thread JS dès que l'app passe en arrière-plan : le timer dérivait, s'arrêtait, et ne
sonnait jamais écran verrouillé.
**Décision.** La source de vérité devient `endsAt`, un timestamp d'horloge murale ; les
secondes restantes en sont dérivées à chaque tick et à chaque retour au premier plan
(`AppState`). `endsAt` est persisté (AsyncStorage) pour survivre à la fermeture de l'app.
**Pourquoi.** Une horloge absolue est auto-correctrice : peu importe si les ticks sont en
retard ou absents. Écarté : garder `setInterval` en espérant qu'il survive (faux sur
mobile), et une tâche de fond (interdite par le bac à sable pour ce besoin).

## 2026-08-09 — L'OS sonne la fin, pas le JS

**Contexte.** Même avec une horloge juste, aucun code JS ne tourne pour jouer le carillon
si l'app est endormie ou tuée.
**Décision.** Une **notification locale** est planifiée à `endsAt` et replanifiée à chaque
changement. Permission demandée au **premier tap qui lance un timer**, jamais au
lancement ; l'app reste pleinement fonctionnelle si elle est refusée. Premier plan = le
carillon in-app, arrière-plan = la notification, jamais les deux.
**Pourquoi.** Seul l'OS peut réveiller le téléphone à l'heure dite. La demande
contextuelle protège le « geste unique » (`PRINCIPLES.md`) et le taux d'acceptation.
Limite acceptée : le **son personnalisé** d'une notification exige un development build ;
en Expo Go c'est le son système par défaut.

## 2026-08-09 — Les notifications exigent une alarme *exacte* (Android 12+)

**Contexte.** Les notifications de fin arrivaient ~40 s en retard. Cause trouvée dans le
module natif (`ExpoSchedulingDelegate.setupAlarm`) : sans la permission d'alarme exacte,
Android bascule silencieusement sur `setAndAllowWhileIdle`, une alarme **inexacte** qu'il
regroupe pour économiser la batterie.
**Décision.** En dev, on accorde « Alarmes et rappels » à Expo Go à la main (validé : à la
seconde). Tout **build natif devra déclarer `USE_EXACT_ALARM`** dans son manifeste, sans
quoi le retard revient chez tous les utilisateurs.
**Pourquoi.** Une minuterie qui sonne en retard n'est pas une minuterie. `USE_EXACT_ALARM`
est réservé par Google Play aux réveils/minuteries/agendas — Compotium en est un, donc
l'usage est légitime. Écarté : planifier la notif en avance pour compenser (le retard est
imprévisible), et une tâche de fond (15 min minimum sur Android, inutilisable ici).

## 2026-08-09 — Passage au development build (Android, EAS)

**Contexte.** Trois besoins butaient sur la même limite : le manifeste d'Expo Go est figé,
donc une app qui y tourne ne peut jamais déclarer ses propres permissions ni embarquer ses
propres ressources natives. Bloqués : l'alarme exacte pour tous, le carillon en son de
notification, et Skia.
**Décision.** On quitte Expo Go pour un **development build** construit par **EAS Build
(cloud)**, profil `development` (APK, distribution interne). Le natif prévisible est
embarqué en une passe : permissions d'alarme exacte + les deux carillons.
**Pourquoi.** C'était le plafond, pas un contournement ponctuel. Build **cloud** et non
local : la machine n'a ni JDK, ni SDK Android, ni Android Studio. Le cycle de dev ne change
pas — Metro et Fast Refresh continuent ; seuls les changements **natifs** exigent un rebuild.
Écarté : rester en Expo Go (les trois besoins restent morts), build local (des heures
d'outillage pour le même résultat).

## 2026-08-09 — Migration vers Expo SDK 57 (remplace le choix du SDK 54)

**Contexte.** Le SDK 54 avait été retenu pour **une seule raison** : le SDK 57 ne passait
pas dans Expo Go. Le passage au development build a supprimé cette contrainte. Rester
trois SDK en arrière était devenu une taxe : le registre npm sert par défaut les paquets
de l'ère 57, et le crash `AnyTypeCache` du premier build natif en était le symptôme direct.
**Décision.** Migration **54 → 55 → 56 → 57** (React Native 0.81 → 0.86), palier par palier,
chacun vérifié en local (`expo-doctor`, `tsc`, bundle) et commité séparément ; **un seul**
build natif à l'arrivée. Les `overrides` qui épinglaient `expo-asset`/`expo-font` sont
supprimés — en SDK 57 les versions publiées par défaut sont les bonnes.
**Pourquoi.** Le bon moment : 15 jours d'existence, 1 317 lignes, aucun utilisateur.
Écarté : **recréer l'app** (risque de perdre les palettes verrouillées, les réglages
visuels et les cas limites durcis, pour zéro gain — c'était un bump de dépendances), et
rester en 54 (la taxe de décalage revient à chaque `npm install`).

## 2026-08-09 — Pas de lecture audio en arrière-plan

**Contexte.** Depuis le SDK 55, le plugin `expo-audio` active `enableBackgroundPlayback`
par défaut : deux permissions de service en avant-plan, un service Android, et le mode
audio de fond côté iOS.
**Décision.** `enableBackgroundPlayback: false` (comme `recordAudioAndroid: false`).
**Pourquoi.** L'architecture fait explicitement l'inverse : **premier plan = carillon
in-app, arrière-plan = notification planifiée**, jamais les deux. La lecture en fond n'est
jamais utilisée, et `FOREGROUND_SERVICE_MEDIA_PLAYBACK` est scrutée par Google Play.
Ne jamais demander une permission qu'on n'utilise pas.

## 2026-08-09 — Skia comme moteur de rendu (remplace SVG pour le décor)

**Contexte.** La direction artistique visée (fond liquide, halo « Gargantua », vraies
particules) demande du flou gaussien, des modes de fusion et du bruit procédural — hors
de portée de `react-native-svg` à coût raisonnable.
**Décision.** `@shopify/react-native-skia` pour le décor animé (fond, bouton `+`,
désintégration), avec **Reanimated 4 + worklets** pour animer sur le thread d'UI. Versions
imposées par le SDK 57. L'UI structurelle (textes, boutons, réglages) reste en composants
React Native.
**Pourquoi.** Skia est le moteur 2D de Chrome et d'Android : on accède au pipeline
graphique, pas à une description d'objets. Écarté : rester en SVG (le flou et le bruit
coûtent trop cher), et animer depuis le JS (le thread est gelé dès que l'app travaille).
Note : `babel-preset-expo` injecte **tout seul** le plugin worklets — pas de
`babel.config.js` à écrire (un fichier manuel casse même le bundle, le preset n'étant pas
remonté à la racine de `node_modules`).

## 2026-08-09 — Gesture Handler pour les gestes

**Contexte.** Le panneau de réglages ne se fermait qu'en visant une bande étroite de fond :
sa poignée était purement décorative. Il fallait un glissement.
**Décision.** `react-native-gesture-handler` plutôt que `PanResponder`. La zone de saisie
est limitée à la poignée et au titre ; la croix de fermeture est placée **hors** du
détecteur de geste.
**Pourquoi.** Reanimated arrivant de toute façon avec Skia, le couple fait courir geste
**et** animation sur le thread d'UI. Surtout, Gesture Handler apporte un vrai arbitrage :
c'est ce qui garantit que le glissement ne vole pas les appuis du stepper et du champ de
saisie. `PanResponder` n'a pas d'arbitrage — il aurait fallu bricoler. Piège retenu :
sans `GestureHandlerRootView` à la racine, **aucun geste ne se déclenche, sans erreur**.

## 2026-08-09 — Retour à l'éclipse : la référence est le produit, pas le film

**Contexte.** Le halo « Gargantua » a été construit puis testé : deux tentatives (flou large,
puis anneaux nets par ordre de dessin) ont été jugées moins bonnes que la corona
« éclipse » SVG qui existait avant Skia.
**Décision.** On **restaure l'éclipse** (dégradé radial à arrêts serrés, en `react-native-svg`)
et on abandonne Gargantua. Cette entrée remplace l'ambition « halo Gargantua » de la
roadmap. Skia reste pour le **fond** et les **chiffres**.
**Pourquoi.** L'app avait déjà **sa** signature visuelle, validée avec les palettes.
Gargantua était une idée de roadmap, pas une amélioration : partir d'une référence externe
a fait perdre l'identité du produit. Leçon retenue : quand une version existante est
validée, on la restaure depuis git au lieu de la réécrire de mémoire.

## 2026-08-09 — La fluidité prime sur l'effet

**Contexte.** La première passe Skia (bruit fractal plein écran + flous larges permanents +
particules) a rendu l'app non fluide. L'auteur a tranché : « la fluidité prime ».
**Décision.** Règles tenues pour le décor animé : **aucun flou au repos** ; un shader est
**construit une fois et déplacé par transformation**, jamais animé par son centre (ça le
reconstruit à chaque image) ; un effet coûteux n'est admis que **pendant une transition**
(le flou des chiffres est à zéro le reste du temps). Les particules du STOP sont supprimées.
**Pourquoi.** Le produit sert à se poser (`PRINCIPLES.md` : « calme visuel ») — une saccade
ruine l'intention bien plus qu'un effet manquant ne l'appauvrit.

## 2026-08-09 — Le compteur ne doit jamais pouvoir disparaître

**Contexte.** Passé en texte Skia, le compte à rebours est devenu **invisible** :
`matchFont` utilise par défaut la famille `"System"`, un nom iOS ; sur Android rien ne
correspond, la police revient sans fonte et le texte ne dessine rien — **sans erreur**.
**Décision.** Familles réelles par plateforme, **vérification** que `getTypeface()` a
répondu, et **repli en texte natif** si aucune ne résout.
**Pourquoi.** Le compte à rebours *est* l'application. Un effet manquant doit toujours
battre un timer manquant. Troisième échec silencieux de la journée après
`GestureHandlerRootView` et le plugin Babel : dans cet écosystème, on vérifie que ça a
marché, on ne suppose pas.
