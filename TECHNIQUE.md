# Consignes techniques canoniques

## Audit technique V6.2

Le référentiel long et structuré se trouve désormais dans `dist/technical-catalog.js`. Il contient les 24 mouvements de base avec orientation, appuis, position segment par segment, prise, exécution, position finale, amplitude, parties fixes, respiration, tempo, erreurs, critères d’arrêt, muscles et signature visuelle textuelle. `dist/technique.js` compose les variantes et dérive le repère court de séance ainsi que la fiche détaillée.

Les rapports exhaustifs sont `docs/TECHNICAL_AUDIT.md`, `docs/VARIANT_AUDIT.md`, `docs/PROGRAM_AUDIT.md` et `docs/DECISIONS_REQUIRED.md`. Les décisions D01→D12 sont désormais intégrées et aucune variante n’est encore `DECISION_REQUIRED`. Une variante techniquement dupliquée reste marquée `REDUNDANT` sans casser son identifiant historique.

## Stimulus Hypertrophie V6.1

Les prescriptions H utilisent une plage `targetMin`–`targetMax` et la consigne générale « garde environ 1–2 répétitions propres possibles ». Les progressions n’emploient que les variantes stables déjà canoniques. Les variantes archer, une main/un bras, pistol avancé, handstand statique et HSPU très bas en répétitions restent disponibles en Force mais sont exclues des chemins H automatiques.

Les fiches canoniques de Chin-up supination et Reverse crunch utilisent la même philosophie BASE + ADDITIONS, sans fallback vers une autre technique.

La ligne objective-only GluteSplit réutilise exclusivement `split-squat`, `split-pause`, `bulgarian` et `bulgarian-pause`. Sa base autorise un grand pas confortable, un pied avant stable, une flexion naturelle de hanche et une légère inclinaison naturelle du torse. Elle interdit les postures extrêmes et toute promesse de position « 100 % fessier ».

## Principe

Le programme sépare trois responsabilités :

- **Variante = technique** : position, exécution, erreurs, arrêt et type de mouvement.
- **Palier = prescription** : nombre de séries, répétitions ou secondes. Un changement de palier ne modifie jamais la technique d’une même variante.
- **Mode = adaptation éventuelle** : Force, Endurance ou Puissance. Un texte de mode n’est ajouté que si la variante déclare ce mode compatible.

La source canonique longue se trouve dans `dist/technical-catalog.js`; `dist/technique.js` en assure la composition. `dist/program.js` associe chaque variante et chaque palier à cette donnée. L’interface de séance et la fiche détaillée lisent ensuite la même technique canonique.

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
- `sessionCue` et `sessionCues`, repères courts dérivés pour la séance ;
- `detailedInstructions`, fiche longue dérivée ;
- `canonicalName`, `aliases`, `globalOrientation`, `support`, `startPosition`, `grip`, `endPosition`, `rangeOfMotion`, `fixedBodyParts`, `breathing`, `tempoPrinciple` ;
- `primaryMuscles`, `secondaryMuscles`, `stabilizers`, `visualSignature`, `sources` et `status`.

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

## Identifiants historiques conservés

Certains identifiants existants décrivent surtout une position dans la progression, par exemple `row:actuel`, `pullup:angle-ajuste-endurance`, `pushup:pause-endurance`, `bridge:walkout-endurance`, `rearShoulder:pauses` et `abductor:avancee`.

Ils sont conservés pour ne pas casser les sauvegardes ni le programme validé. Leur nom affiché et leur fiche technique sont toutefois explicites : assistance à deux ou un pied, hauteur du support, pause exacte, levier, phase aérienne, côté de réception et nombre d’appuis sont décrits sans dépendre de l’identifiant historique.

La Pike rapide conserve les mains au sol, alors que la Pike plyométrique impose un bref décollage des deux mains. Le Split jump alterne les jambes en l’air; le saut vertical unipodal revient sur la même jambe. La planche diagonale part d’une planche haute et ne doit jamais hériter de la quadrupédie du Bird Dog. L’abduction avancée reprend la géométrie du side plank complet et ajoute uniquement une pause haute exacte de 2 secondes.
