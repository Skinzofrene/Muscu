# Validation du catalogue visuel Muscu V6.2

## Contrôles automatiques

- Baseline avant intégration : 222/222 tests réussis.
- Après intégration : **233/233 tests réussis**. La suite complète inclut les tests du manifeste, des assets, des parents, des images custom, des séquences, de l’interface et du cache PWA.
- Couverture attendue : 159/159 variantes, 86 Visual Movements, 0 manquant.
- Chemins : uniquement des fichiers locaux sous `dist/assets/exercises/`.
- Parents : chaque identifiant existe, toutes les chaînes se résolvent, aucune boucle.
- Custom : les paires basse/haute et leurs réutilisations sont vérifiées explicitement.
- Text-only : trois résolutions `TEXT_SUFFICIENT`, sans placeholder.
- Captures tierces : aucun fichier nommé capture, screenshot ou watermark.

## Contrôles navigateur

Validation réelle effectuée dans Chromium via l’application locale :

- Desktop 1280 × 900 : rendu centré, fiche scrollable, cadre visuel stable, ratio conservé.
- Mobile 390 × 844 : aucun débordement horizontal (`body.scrollWidth` inférieur à la largeur du viewport), panneau contenu dans l’écran, visuel en `object-fit: contain`.
- Agrandissement mobile : panneau plein écran 390 × 844 côté viewport, image chargée et ratio conservé.
- Lecture animée : changement de frame observé après 1 200 ms ; pause vérifiée sur 1 300 ms sans changement de source ; précédent/suivant présents.
- Fermeture : × et Échap vérifiés ; Échap ferme d’abord le viewer et laisse la fiche ouverte.
- Hors ligne : rechargement avec réseau émulé hors ligne, application chargée et asset Rowing affiché depuis le cache.
- Fiche pendant une série : ouverture depuis le nom de l’exercice et chargement du visuel confirmés.
- Sources/licences : Workout Guide, RepDB, Free Exercise DB et Custom visibles depuis Paramètres.
- Console : **0 erreur, 0 avertissement**.

Fiches réellement ouvertes et vérifiées : Traction stricte, Traction assistée deux pieds (visuel parent), Pompes, Rowing inversé, Pike push-up, Tibial antérieur, Copenhagen levier court, Copenhagen dynamique, Reverse crunch levier allongé, Hollow/planche levier long, Side plank et Y-T-W avec pauses (`TEXT_SUFFICIENT`).

Les six images custom ont également été contrôlées dans leur ordre runtime : Tibialis bas → haut → bas, Copenhagen haut pour le maintien et bas → haut → bas pour le dynamique, Reverse crunch jambes tendues bassin bas → sacrum haut → bassin bas.

## PWA

- Cache versionné : `v6-2-visual-catalog-complete`.
- Manifeste visuel et 133 assets précachés à l’installation.
- Repli cache local pour les ressources déjà consultées.
- `schemaVersion` final : 7.
