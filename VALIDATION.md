# Validation Muscu V6.2

## Audit technique V6.2

- Avant audit : **201/201 tests réussis**, 0 échec.
- Après audit : **209/209 tests réussis**, 0 échec.
- Après fermeture D01→D12 : **222/222 tests réussis**, 0 échec, 0 ignoré.
- Navigateur réel : Traction, Pompe, Split/Bulgarian, Pont, Pike, Planche, Hollow, Scapulaire, Hamstring walkout, Reverse crunch et Abduction vérifiés.
- Console navigateur : 0 erreur, 0 avertissement.
- Rapport détaillé : `docs/BROWSER_VALIDATION.md`.

Le démarrage valide les zones, propriétaires, sous-zones, contributions, plages H, variantes, techniques et sources (`canonical`, `objective-line`, `objective-extra`). Une sauvegarde est refusée si un niveau H, une rotation, un stimulus ou un snapshot officiel est invalide.

La suite conserve les 178 tests V6.1 et ajoute 23 tests ciblés sur les panneaux flottants, la navigation, le passage direct d’un bloc, la nouvelle répartition Fessiers et la stabilité du lanceur.

## Tests automatisés

Commande : `node --test tests/*.test.mjs`

Résultat V6 avant modification : **152 tests réussis, 0 échec**.

Résultat V6.1 avant modification : **178 tests réussis, 0 échec**.

Résultat V6.2 avant audit technique : **201 tests réussis, 0 échec**.

Résultat V6.2 Technical Audit final : **222 tests réussis, 0 échec, 0 ignoré**.

La suite couvre notamment :

- catalogue exact n1–n35, latéralités, durées, descriptions et mapping des 10 pages ;
- présence locale et précache offline des 10 WebP ;
- ordres et cibles des cinq routines ;
- retour à la position/côté précédent et correction sans doublon ;
- viewer interne plein écran, retour et continuité du chrono ;
- pools Mobilité exacts, anti-répétition sur quatre offres, variété de zone et repos passif ;
- protection prospective et régression Tractions/Pompes/Suspension ;
- historique et statistiques Musculation/Souplesse ;
- absence d’API de dialogue bloquante et présence des chevrons de mode ;
- trois patterns Fessiers, compte unilatéral, recyclage Split H, budgets Compact/Équilibré/Maximiser et plafond 12 ;
- mapping Force → H explicite et conservation d’un niveau H V6 réellement utilisé ;
- skip vierge, partiel, réouverture sans doublon, cycle mixte, rotations intactes, isolation Principal/Test et persistance ;
- migrations V1 à V6 → schéma 7 sans perte musculaire et anciennes données Souplesse marquées legacy.
- panneaux flottants grand/compact/petit, fermeture par X, clic extérieur et Échap, sans injection sous l’accueil ;
- passage direct d’un bloc vierge ou partiel, y compris pendant une séance, avec protection contre les doubles actions ;
- consultation du bloc précédent sans mutation et démarrage explicite d’un bloc consulté ;
- Fessiers H : remplacement du Split Force par GluteSplit en B, Bridge + Abductor en E, budgets exacts 3/2/2, 3/3/2 et 4/4/2 ;
- conservation de la rotation Force et absence de recréation immédiate d’un bloc B passé ;
- origine locale stable sur 4173 et refus explicite d’un service étranger sur ce port.

## Contrôle navigateur

La validation réelle V6.2 a été effectuée en affichage mobile puis à **1280 × 900**, dans le navigateur intégré réel et avec un profil Test isolé :

- baseline tout Force intacte ;
- fiches d’exercice et retour ouverts au-dessus de l’écran courant, avec arrière-plan conservé, défilement interne et fermeture X/extérieur/Échap ;
- chrono de repos continu pendant l’ouverture d’un panneau (`01:50` → `01:48`), sans remise à zéro ;
- pause, reprise et arrêt explicite du bloc, avec conservation de la série validée ;
- passage direct de A après travail partiel, affichage `Partiel · Passé`, puis arrivée immédiate sur B ;
- consultation de A comme bloc précédent sans modifier B ni l’état du cycle ;
- profil Test Fessiers H Équilibré : B = 3 séries GluteSplit, E = 3 Bridge + 2 Abductor ; aucun GluteSplit dans E ;
- rechargement puis bascule Principal/Test : objectif, registre, niveaux et historique restent isolés ; Principal reste en Split Force ;
- budget Maximiser contrôlé à 4 GluteSplit + 4 Bridge + 2 Abductor, soit 10 séries ;
- rendu mobile sans débordement gênant et rendu bureau centré ;
- console navigateur : **0 erreur, 0 avertissement** ;
- aucun dialogue JavaScript natif ouvert.

Le lanceur V6.2 conserve `http://localhost:4173`. Avec une autre application ou une ancienne instance déjà présente sur ce port, il refuse explicitement de changer d’origine. Un port explicite temporaire (`4190`) a uniquement servi à la validation navigateur isolée.

## Séquences visuelles clean

- Baseline de cette passe : **233/233 tests réussis**.
- Tests ciblés finaux : **38/38 réussis**.
- Suite complète finale : **237/237 réussis**, 0 échec, 0 ignoré.
- Catalogue : **86 mouvements**, **159/159 variantes**, 12 statiques, 43 simples, 6 complexes, 22 parents, 3 textes seuls.
- Assets visuels : **133 → 95** ; 38 fichiers Workout Guide orphelins retirés.
- Player : ping-pong construit à l’exécution depuis des séquences avant sans duplication.
- Cache PWA : `v6-2-visual-sequences-clean`, **95/95 assets disponibles hors ligne**.
- Navigateur desktop et mobile : OK ; console : 0 erreur, 0 avertissement.
- Audit détaillé : `docs/VISUAL_SEQUENCE_AUDIT.md`.

## Livrable

Les tests sont relancés dans le dossier à archiver puis dans une extraction temporaire du ZIP. Les listes et empreintes SHA-256 des fichiers sont comparées entre source et extraction.
