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
