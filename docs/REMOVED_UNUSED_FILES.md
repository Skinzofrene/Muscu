# Fichiers inutilisés et suppressions

## Résultat de l’audit de poids initial

L'audit du catalogue initial a comparé les 133 chemins uniques du manifeste aux 133 fichiers visuels présents sur disque :

- fichiers visuels manquants : **0** ;
- fichiers visuels orphelins : **0** ;
- fichiers runtime inutilisés supprimés : **0** ;
- sources, tests, scripts, rapports ou documents supprimés : **0** ;
- doublons binaires supprimés : **0**.

Aucune suppression de contenu n'était justifiée à ce stade, avant l’audit pédagogique des séquences.

## Nettoyage des séquences

L’audit visuel ultérieur a réduit 38 animations et rendu **38 SVG Workout Guide réellement orphelins**. Ces fichiers ont été retirés après vérification croisée du manifeste, des parents et du précache.

- fichiers visuels avant : **133** ;
- fichiers visuels après : **95** ;
- Workout Guide : **111 → 73** ;
- RepDB / Free Exercise DB / Custom : **inchangés à 14 / 2 / 6** ;
- fichier référencé manquant : **0** ;
- fichier visuel orphelin restant : **0**.

## Représentations remplacées

Six fichiers PNG ont été remplacés 1:1 par leurs équivalents WebP sans perte. Ils ne sont pas comptés comme des fichiers inutilisés supprimés : chaque fichier reste présent sous un nouveau format et conserve exactement son rôle dans le catalogue.

| Ancien fichier | Nouveau fichier |
|---|---|
| `copenhagen-high.png` | `copenhagen-high.webp` |
| `copenhagen-low.png` | `copenhagen-low.webp` |
| `reverse-crunch-long-high.png` | `reverse-crunch-long-high.webp` |
| `reverse-crunch-long-low.png` | `reverse-crunch-long-low.webp` |
| `tibialis-wall-high.png` | `tibialis-wall-high.webp` |
| `tibialis-wall-low.png` | `tibialis-wall-low.webp` |

Le catalogue final conserve donc **95 fichiers visuels**, **86 Visual Movements** et **159 variantes**.

## Doublon conservé

`side-plank-leg-lift-hold-main.webp` et `side-plank-leg-lift-peak.webp` sont identiques au niveau binaire, mais matérialisent deux rôles distincts dans deux séquences différentes. Ils sont conservés volontairement ; aucune animation ne les utilise ensemble.
