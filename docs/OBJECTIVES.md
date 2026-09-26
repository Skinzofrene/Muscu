# Objectifs musculaires — V6.2

## Principes

Un objectif de zone (`strength` ou `hypertrophy`) est distinct du stimulus d’une unité (`force`, `hypertrophy`, `endurance`, `power`) et du mode d’exécution (Qualité, Express, Densité, Hybride). Quand toutes les zones sont en Force, le programme sportif, les blocs, les prescriptions et la rotation V5 restent inchangés.

Les 11 zones visibles sont : Pectoraux, Dos, Épaules, Biceps, Triceps, Avant-bras / prise, Abdos / tronc, Fessiers, Quadriceps, Ischios et Mollets / bas de jambe. Chaque profil possède ses propres objectifs, son budget, ses niveaux H, ses rotations H et ses changements en attente.

## Sous-zones et cartes musculaires

Chaque exercice possède un propriétaire (`ownerZone`) et trois listes : `direct`, `importantSecondary`, `lightSecondary`. Une série H vaut 1 pour chaque zone touchée directement, 0,5 pour une zone secondaire importante et 0 pour une zone légère. Plusieurs sous-zones de la même zone ne doublent jamais ce crédit.

La couverture vérifie séparément une exposition directe récente des composants obligatoires : dorsaux/haut du dos, grand/moyen fessier, deltoïdes avant/latéral/arrière, compression/stabilité du tronc et mollets/tibial antérieur. Épaules et Avant-bras restent volontairement marqués `partial` avec le matériel actuel.

## Rotation de stimulus

Chaque ligne propriétaire d’une zone H suit `H, H, Maintenance`. La file Maintenance est `Force, Endurance, Force, Puissance`. Un stimulus impossible pour la ligne est sauté. Un stimulus compatible mais encore verrouillé utilise Force pour l’exposition sans consommer le curseur Maintenance. La rotation Force V5 est gelée tant que la zone est en H, puis reprend à son ancien curseur si la zone repasse en Force.

## Volume sur sept jours

Le registre est calculé à partir des séries validées dans la fenêtre ouverte `now - 7 × 24 h` jusqu’à `now`, plus les séries H pending déjà prévues pour éviter la sur-planification. Aucun compteur mutable n’est stocké. En V6, seul le stimulus `hypertrophy` crédite le budget H ; Force, Endurance, Puissance, fillers et Mobilité valent zéro.

La cible automatique est : plancher 8, zone satisfaite 8–12, aucun ajout automatique à partir de 12.

## Glute Hypertrophy Template

V6.2 applique l’architecture de template uniquement à `glutes + hypertrophy`. Les autres zones conservent strictement leur planner V6.1.

Trois patterns sont obligatoires sur la fenêtre glissante de sept jours :

- **Extension** (`bridge`) : minimum 2 séries H productives ;
- **Unilatéral** (`gluteSplit`, ou `split` déjà réellement H et compatible) : minimum 2 séries H productives ;
- **Abduction** (`abductor`) : minimum 2 séries H productives.

Une série unilatérale réalisée des deux côtés compte une seule série de zone : `2 séries / côté = 2`, jamais 4. Un Split Quadriceps Force ne couvre pas le pattern unilatéral. Le planner traite d’abord chaque déficit de pattern, puis distribue le volume restant vers le plancher global 8. Maximiser vise plus rapidement la cible 10. Le plafond automatique 12 reste absolu, y compris pour les séries canoniques nouvellement proposées.

Le template est réparti sur deux blocs :

- **B** remplace la ligne Split Force par GluteSplit H ;
- **E** conserve Bridge H et ajoute Abductor H ;
- GluteSplit n’est jamais ajouté dans E.

À déficit complet, les répartitions exactes sont : Compact `3/2/2 = 7`, Équilibré `3/3/2 = 8`, Maximiser `4/4/2 = 10`, dans l’ordre GluteSplit / Bridge / Abductor. Les séries supplémentaires alternent donc l’unilatéral et l’extension, tandis que l’abduction reste à deux séries sauf besoin de rattrapage de couverture. Le plafond automatique de 12 demeure absolu.

## Planner

`objective-planner.js` recycle d’abord les lignes canoniques en leur appliquant la prescription H. Il considère ensuite les contributions secondaires, puis seulement les lignes Objectif (`chinup`, `reverseCrunch`) et une éventuelle troisième série `objective-extra`. Il ne modifie jamais les unités `completed` ou `in_progress`.

Le tri est déterministe : sous-zone obligatoire manquante, déficit vers 8, bénéfice à une seconde zone H, zone la moins récemment travaillée, ordre fixe des zones. Une ligne en maintenance ne reçoit pas de top-up H du même propriétaire dans le bloc.

Budgets génériques par bloc : Compact +1, Équilibré +2, Maximiser +4, avec au plus +2 séries de la même zone. Une conversion d’une série existante ne compte pas comme ajout. Pour le template Fessiers V6.2, ces budgets s’appliquent après les lignes de base remplacées ou recyclées et produisent les répartitions ci-dessus.

Si le bloc B est passé, ses séries GluteSplit restent `skipped` et ne sont pas recréées dans le cycle courant lors d’une recomposition. Le déficit Unilatéral reste visible pour la prochaine planification utile. La rotation Force de la ligne genou ne progresse pas lorsqu’un GluteSplit H occupe B.

## Progression H

Les niveaux H sont indépendants des paliers Force. Deux expositions complètes au maximum de la plage avec ressenti Correct ou Facile proposent une hausse. Deux expositions sous le minimum ou répétées Trop dur proposent une baisse. Une douleur interdit toute proposition de hausse. Toute modification reste manuelle.

Au premier passage en H, le niveau n’est plus systématiquement H1. La table explicite suivante est utilisée ; aucune formule proportionnelle n’existe :

| Ligne H | Source Force | Variante Force | Niveau H initial |
|---|---|---|---:|
| Bridge | Bridge | `deux-jambes` | 1 |
| Bridge | Bridge | `une-jambe` | 2 |
| Bridge | Bridge | `pause-haute` | 3 |
| Bridge | Bridge | `levier-long` | 4 |
| Bridge | Bridge | `levier-long-pause`, `entretien` | 5 |
| GluteSplit | Split | `split-squat` | 1 |
| GluteSplit | Split | `split-pause` | 2 |
| GluteSplit | Split | `bulgarian` | 3 |
| GluteSplit | Split | `bulgarian-pause`, variantes Pistol | 4, stable |
| Abductor | Abductor | `laterale`, `pause`, `side-genou`, `side-complet`, `avancee` | 1, 2, 3, 4, 5 |

Les numéros affichés ci-dessus sont humains (index interne + 1). Une migration V6 conserve le niveau H courant dès qu’une vraie série H de la ligne existe dans l’historique ou la séance active ; sinon ce mapping peut l’initialiser depuis Force.

## Limites actuelles

- Pas de matériel configurable, d’haltères, d’élastiques ni de surface glissante.
- La branche Leg curl glissé reste documentée mais inactive.
- Pas d’élévation latérale : la couverture deltoïde latéral reste partielle.
- La suspension reste principalement une ligne Force/prise et ne devient pas artificiellement un programme bodybuilding des avant-bras.
