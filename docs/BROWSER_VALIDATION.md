# Validation navigateur finale — séquences visuelles

## Environnement

- Application réelle servie localement depuis l’arbre final.
- Validation desktop : **1280 × 900**.
- Validation mobile : **390 × 844**.
- Cache actif : `v6-2-visual-sequences-clean`.

## Contrôles ciblés

- Traction stricte : `frame-3.svg ↔ frame-1.svg`, deux dessins fins, aucun passage par `frame-2.svg`.
- Split squat RepDB : `split-squat-start.webp ↔ split-squat-peak.webp`.
- Pompe : deux extrêmes Workout Guide.
- Rowing inversé : deux dessins fins, sans frame épaisse.
- Pont fessier : deux extrêmes.
- Tibialis custom : `low ↔ high`.
- Handstand statique : `wall-handstand-push-up/frame-3.svg`, bras tendus.
- Les 6 mouvements complexes à trois poses ont été conservés après la revue visuelle déjà effectuée.
- Pause/reprise, précédent/suivant et agrandissement : fonctionnels.

La traction observée automatiquement dans le lecteur a produit `frame-3 → frame-1 → frame-3`. Après pause, l’image est restée fixe ; la commande suivante a avancé d’une phase ; l’agrandissement s’est ouvert correctement.

## Mobile

- Largeur de document : 375 px pour la zone utile du viewport demandé.
- Largeur scrollable : 375 px, donc aucun débordement horizontal.
- Panneau : 359 px, entièrement contenu entre 8 px et 367 px.
- Les trois contrôles d’animation restent visibles et actionnables.

## Hors ligne

- L’application a été rechargée avec le réseau désactivé et l’écran Programme s’est affiché normalement.
- Le manifeste a été relu depuis le cache.
- **95/95 assets visuels uniques** ont répondu correctement hors ligne.
- Le cache contient 127 requêtes : shell complet + 95 visuels uniques.
- Aucun ancien chemin supprimé n’est précaché.

## Console

- **0 erreur**.
- **0 avertissement**.
