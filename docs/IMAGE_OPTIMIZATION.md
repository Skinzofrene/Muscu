# Optimisation des images

## Méthode

Les six images Custom ont été encodées en **WebP sans perte**, avec conservation du canal alpha. Chaque fichier a été rouvert après encodage et comparé au PNG source en RGBA : les six comparaisons sont identiques pixel par pixel.

Aucun redimensionnement, recadrage, rééchantillonnage, changement de couleur, génération d'image ou compression avec perte n'a été effectué.

## Résultats

| Image | PNG initial | WebP lossless | Gain | Dimensions | Pixels décodés |
|---|---:|---:|---:|---|---|
| `copenhagen-high` | 537 616 | 354 626 | 182 990 | 1086 × 1448 | identiques |
| `copenhagen-low` | 525 747 | 345 988 | 179 759 | 1086 × 1448 | identiques |
| `reverse-crunch-long-high` | 531 297 | 333 994 | 197 303 | 1086 × 1448 | identiques |
| `reverse-crunch-long-low` | 394 159 | 243 222 | 150 937 | 1086 × 1448 | identiques |
| `tibialis-wall-high` | 670 604 | 417 330 | 253 274 | 1086 × 1448 | identiques |
| `tibialis-wall-low` | 641 897 | 401 358 | 240 539 | 1086 × 1448 | identiques |
| **Total** | **3 301 320** | **2 096 518** | **1 204 802** |  | **6/6 identiques** |

Le gain sur ce sous-ensemble est de **36,49 %**. Les dimensions et l'ordre des frames restent inchangés.

## Éléments laissés intacts

- 111 SVG Workout Guide : déjà vectoriels et tous utilisés.
- 14 WebP RepDB : déjà légers, 512 × 512 et tous utilisés.
- 2 JPEG Free Exercise DB : 850 × 567, déjà compressés et utilisés.
- 10 pages WebP Souplesse : fonctionnalité distincte, déjà compressées et requises hors ligne.
- 3 icônes PNG de la PWA : petites et nécessaires aux installations.

Une recompression avec perte n'aurait pas respecté l'exigence d'absence de dégradation perceptible vérifiable. Elle n'a pas été tentée dans la livraison finale.

