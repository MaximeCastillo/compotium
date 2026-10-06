# Compotium

**D'un simple tapotement, tu t'offres des minutes de calme.**

Une app mobile minimaliste : chaque tap ajoute 5 minutes et un compte à rebours épuré démarre. C'est un geste unique pour se poser et se recentrer. Le nom fond *compos mentis*, « maître de son esprit », et *otium*, « le repos contemplatif ».

## Pourquoi ce projet

Je suis développeur web (Rails / React), et je n'avais jamais fait de mobile natif. J'ai appliqué à Compotium la méthode « apprendre en construisant » rodée sur [FitBatchCooker](https://github.com/MaximeCastillo/fitbatchcooker). Je travaille avec un agent IA (Claude Code) : je cadre, je décide et je vérifie sur un vrai téléphone, l'agent écrit l'essentiel du code et m'explique chaque concept nouveau.

En 3 jours (8 → 10/08/2026), je suis allé de la page blanche à une app installée sur mon téléphone, avec un development build Android.

## Ce qu'il y a à voir

| Quoi | Où |
|---|---|
| **20 décisions datées**, avec leur pourquoi : cross-platform plutôt que natif, le timer est une date de fin et pas un compteur, c'est l'OS qui sonne la fin et pas le JS, la fluidité prime sur l'effet… | [`DECISIONS.md`](./DECISIONS.md) |
| **Le journal d'apprentissage** : moteur graphique, build natif, timer qui survit à l'arrière-plan | [`LEARNING_LOG.md`](./LEARNING_LOG.md) |
| **Les principes produit** | [`PRINCIPLES.md`](./PRINCIPLES.md) |
| **La constitution donnée à l'agent**, y compris trois pièges qui échouent en silence | [`CLAUDE.md`](./CLAUDE.md) |

## Quelques problèmes intéressants résolus

- **Un timer qui survit à l'app tuée** : on stocke une date de fin, pas un compteur. La sonnerie est confiée à l'OS par une notification programmée, ce qui demande une alarme *exacte* sous Android 12+.
- **La fluidité d'abord** : Skia dessine le décor et les chiffres, Reanimated anime sur le thread d'UI. Un shader se construit une seule fois puis se déplace par transformation.
- **Sortir d'Expo Go** : passage à un development build EAS, et rattrapage de trois versions du SDK d'un coup.

## Stack

Expo SDK 57 · React Native 0.86 · TypeScript strict · Skia · Reanimated 4 · Gesture Handler · expo-notifications · EAS Build.

## État

Prototype personnel, Android d'abord, iOS gardé ouvert par construction. L'app n'est pas publiée sur les stores.

## Lancer le projet

```bash
npm install
npx expo start          # nécessite le development build installé sur le téléphone
```
