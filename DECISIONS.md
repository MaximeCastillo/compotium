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
