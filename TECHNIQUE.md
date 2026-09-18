# Consignes techniques canoniques

## Principe

Le programme sépare trois responsabilités :

- **Variante = technique** : position, exécution, erreurs, arrêt et type de mouvement.
- **Palier = prescription** : nombre de séries, répétitions ou secondes. Un changement de palier ne modifie jamais la technique d’une même variante.
- **Mode = adaptation éventuelle** : Force, Endurance ou Puissance. Un texte de mode n’est ajouté que si la variante déclare ce mode compatible.

La source canonique se trouve dans `dist/technique.js`. `dist/program.js` associe chaque variante et chaque palier à cette donnée. L’interface de séance et la fiche détaillée lisent ensuite la même technique canonique.

## Types de mouvements

- `dynamic_controlled` : mouvement dynamique contrôlé pouvant recevoir un mode compatible.
- `isometric` : maintien chronométré ou statique, sans consigne dynamique injectée.
- `explosive` : répétition de vitesse ou de saut ; uniquement avec un mode compatible.
- `control_health` : travail qualitatif, scapulaire ou correctif, sans overlay générique.

## Héritage

Chaque exercice possède une base technique cohérente. Une variante réutilise cette base et ajoute uniquement son changement réel : pause, angle, assistance, levier, asymétrie, maintien, etc.

Les paliers d’une même variante partagent exactement le même objet technique. Ils ne stockent que leur prescription.

Il n’existe aucun fallback vers les consignes d’un autre exercice. Si un exercice n’a pas de base technique ou si une variante n’a pas de données valides, la construction du catalogue échoue.

## Adaptations de mode

Les adaptations Force, Endurance et Puissance sont centralisées dans `MODE_INSTRUCTIONS`. Elles sont composées uniquement lorsque `compatibleModes` contient le mode courant.

Les maintiens, suspensions, planches, variantes statiques, exercices scapulaires, tibial, mollets et petits exercices correctifs restent sans overlay dynamique, sauf déclaration explicite future.

Le moteur peut conserver le mode interne `force` pour une ligne sans rotation de modes. Cela ne signifie pas qu’un overlay Force est compatible : `compatibleModes` reste la seule autorité d’affichage.

## Données d’une variante

Chaque entrée canonique contient :

- `id`, `exerciseId`, `lineId`, `name` ;
- `type` ;
- `position`, `execution`, `mistakes`, `stop` ;
- `compatibleModes` et `modeInstructions` ;
- `unilateral`, `timed` ;
- `sessionCues`, sélection courte de deux à quatre lignes pour la séance.

La fiche exercice affiche davantage de détails. La séance reste compacte et montre au maximum quatre lignes issues de la variante courante, de son mode compatible et de son critère d’arrêt.

## Ajouter une variante

1. Ajouter l’identifiant stable, le nom et les prescriptions dans le mode concerné de `dist/program.js`.
2. Vérifier que l’exercice dispose d’une base correcte dans `BASE` de `dist/technique.js`.
3. Ajouter dans `ADDITIONS` uniquement ce qui distingue réellement la nouvelle variante.
4. Classer la variante correctement : dynamique, isométrique, explosive ou contrôle/santé.
5. N’autoriser un mode que si son adaptation est biomécaniquement cohérente.
6. Lancer tous les tests.

`validateTechniqueCatalog` refuse notamment :

- une variante sans identifiant ou sans type ;
- une consigne sans position, exécution ou erreur ;
- un overlay de mode incompatible ;
- un mode inconnu ;
- un palier pointant vers une variante absente.

## Variantes historiques au nom peu précis

Certains identifiants existants décrivent surtout une position dans la progression, par exemple `row:actuel`, `pullup:angle-ajuste-endurance`, `pushup:pause-endurance`, `bridge:walkout-endurance`, `rearShoulder:pauses` et `abductor:avancee`.

Ils sont conservés pour ne pas casser les sauvegardes ni le programme validé. Ils héritent de la base technique sûre de leur exercice et ne reçoivent un ajout que lorsque leur nom décrit une différence suffisamment claire. Aucun comportement sportif n’a été inventé pour préciser artificiellement ces variantes.
