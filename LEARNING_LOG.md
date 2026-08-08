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
