# Validation

## Tests automatisés

Commande :

```text
node --test tests/*.test.mjs
```

Résultat de cette livraison : **39 tests réussis, 0 échec**.

Couverture :

- paliers `− / +` du Programme, de la fiche et de la séance active ;
- séries terminées immuables et recomposition des seules séries restantes ;
- consignes synchronisées sur l’exercice, le bloc et la variante courants ;
- création Test vierge, copie Principal vers Test, allers-retours sans reset et persistance ;
- isolation des resets Principal/Test et migrations des anciennes données ;
- agrégations par exercice pour Aujourd’hui, 7 jours, 30 jours et Tout ;
- moyennes par passage, jour de période et jour actif ;
- exercices chronométrés et unilatéraux ;
- historique vide et anciennes données ;
- programme, phases, modes, douleur, alternances et cache hors ligne existants.
- 146 variantes dotées d’une technique canonique valide ;
- aucun overlay dynamique sur Suspension, Hollow, scapulaire ou tibial ;
- adaptations Force, Endurance et Puissance limitées aux variantes compatibles ;
- paliers d’une même variante partageant strictement la même technique.
- fiches d’exercices entièrement textuelles, sans bloc, placeholder ni interaction média ;
- absence d’infrastructure d’animation dans l’interface et le cache hors ligne.

## Contrôle navigateur réel effectué

- Programme : hausse puis baisse de palier vérifiées sur Tractions ;
- fiche Tractions : palier et prescription mis à jour sans fermer la fiche ;
- séance active : une série validée est restée intacte après hausse du palier ;
- consignes visibles : Tractions → Suspension → Split squat, sans résidu de l’exercice précédent ;
- profils : création Test vierge, Test → Principal → Test, reload, puis recréation depuis Principal ;
- Historique : Vue d’ensemble, liste Exercices, fiche Tractions, changement de période et journal Séances ;
- mobile 390 × 844 et bureau 1280 × 800 : aucun débordement horizontal ;
- console navigateur : aucune erreur ni alerte.

Contrôle final ciblé dans le navigateur : les fiches Traction stricte et Suspension affichent directement le palier, la position, l’exécution, les erreurs et le critère d’arrêt. Aucun bloc, emplacement vide, placeholder ou interaction média n’est présent. Le contrôle de palier de la fiche reste fonctionnel et la console navigateur est restée vide.

## Vérifications manuelles conseillées avant publication

1. Installer la PWA sur un iPhone réel et vérifier le mode avion.
2. Tester le workflow GitHub Pages sur l’adresse finale, le cache PWA étant propre à chaque origine.

## Non-régression

L’application conserve le cycle libre sans calendrier, pause, abandon sans avancement, chrono facultatif, notes et ressentis, modification d’un résultat historique, recommandations non automatiques, import/export, fonctionnement sous sous-chemin GitHub Pages et stockage local uniquement.
