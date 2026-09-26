# Catalogue visuel Muscu V6.2

## Statut final

Le catalogue est complet. Il couvre **159 variantes techniques sur 159**, regroupées en **86 Visual Movements**.

- `MATCH_EXACT` : 37 mouvements
- `MATCH_ACCEPTABLE` : 24 mouvements
- `USE_PARENT_VISUAL` : 22 mouvements
- `TEXT_SUFFICIENT` : 3 mouvements
- `HUMAN_REVIEW_REQUIRED` : 0
- `DEDICATED_VISUAL_REQUIRED` : 0
- manquant : 0

Les cas parent et texte seul sont des résolutions finales volontaires, pas des éléments à compléter ultérieurement.

## Architecture

Le manifeste exploitable par l’application est livré dans `dist/visual-catalog.js` et sa version JSON dans `dist/visual-catalog.json`. Chaque entrée définit un identifiant stable, son statut, sa source, ses frames locales, son mode d’animation, sa durée, son texte alternatif et, le cas échéant, son parent.

Les assets sont rangés dans `dist/assets/exercises/` :

- `workout-guide/` : 73 fichiers
- `repdb/` : 14 fichiers
- `free-exercise-db/` : 2 fichiers
- `custom/` : 6 fichiers
- total : 95 fichiers visuels

Les assets peuvent être réutilisés par plusieurs variantes sans duplication physique. Les données ne stockent que l’ordre avant ; le lecteur construit la lecture pédagogique en aller-retour à 1 050 ms par frame. Les SVG sélectionnés sont conservés tels quels ; les six images custom sont des WebP lossless conservant dimensions, alpha et pixels décodés.

## Résolution dans l’application

`visualFor(exerciseId, variantId)` résout chaque couple technique. Pour `USE_PARENT_VISUAL`, la chaîne de parent est suivie en interne jusqu’au visuel effectif. L’interface n’affiche ni mention « parent », ni approximation, ni image manquante : elle montre le visuel général, tandis que la description canonique conserve toutes les nuances techniques.

Pour `TEXT_SUFFICIENT`, la fiche commence directement par les consignes, sans cadre vide ni placeholder. Les trois mouvements concernés sont Wall slide, Prone W et Y-T-W ventral.

Dans la fiche, le visuel apparaît avant le repère de séance. Les mouvements animés proposent pause/reprise et image précédente/suivante. Un appui sur l’image ouvre un affichage plein écran, fermé par ×, clic extérieur ou Échap. Le bouton de fiche existant reste disponible pendant les séries.

## Mapping des six images custom

| Nom original | Nom local final | Rôle |
|---|---|---|
| `Standing Tibialis Raise Wall Supported.png` | `tibialis-wall-low.webp` | position basse, pointes abaissées |
| `Standing Tibialis Raise Wall Supported2.png` | `tibialis-wall-high.webp` | position haute, pointes relevées |
| `Copenhagen1.png` | `copenhagen-high.webp` | bassin haut, maintien |
| `Copenhagen2.png` | `copenhagen-low.webp` | bassin bas |
| `StraightLegReverseCrunch.png` | `reverse-crunch-long-low.webp` | jambes longues, bassin posé |
| `StraightLegReverseCrunch2.png` | `reverse-crunch-long-high.webp` | jambes longues, sacrum décollé |

Le couple Tibialis est partagé par `visual-tibialis-wall-raise` et `visual-tibialis-single-leg`. Copenhagen haut est partagé entre le maintien court et la séquence dynamique. Les variantes `levier-allonge` et `levier-allonge-pause` partagent le même couple Reverse crunch.

## Sources et licences

- Workout Guide : assets CC BY-SA 4.0, créateur indiqué Bryl Lim, provenance Everkinetic conservée lorsqu’elle existe.
- RepDB : attribution « Exercise data by RepDB (repdb.co) » et contraintes Free Tier conservées.
- Free Exercise DB : The Unlicense / dédicace au domaine public, fourni en l’état.
- Custom : six images fournies spécifiquement pour Muscu.

Les détails de révision et de provenance sont livrés dans `dist/assets/exercises/ATTRIBUTION.md` et `dist/assets/exercises/source-provenance.json`. Aucune capture d’écran tierce d’origine n’est intégrée.

## Hors ligne et données utilisateur

Le service worker précache le manifeste et ses 95 assets locaux, puis conserve aussi les autres réponses locales consultées. Aucun hotlink ni appel réseau externe n’est nécessaire à l’exécution. La structure de données utilisateur n’ayant pas changé, `schemaVersion` reste **7**.
