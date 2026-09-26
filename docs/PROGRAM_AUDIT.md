# Audit programme, muscles et scheduler — Muscu V6.2

## Résultat

Les blocs A→G, les prescriptions Force/Hypertrophie/Endurance/Puissance, les niveaux, les unités, les temps de repos, les règles de progression et le schéma de sauvegarde sont conservés. Aucun changement n’a été appliqué à Souplesse n1→n35. Les corrections automatiques concernent les métadonnées techniques et la représentation de fatigue, pas le dosage du programme.

## Blocs

| Bloc | Rôle | Lignes | Audit |
|---|---|---|---|
| A | Tirage / Grip | pullup, hang + ajouts phase2a: scapPull | OK — responsabilité conservée |
| B | Jambes / Mollets | split, calf | OK — responsabilité conservée |
| C | Poussée | pushup, dip | OK — responsabilité conservée |
| D | Tirage horizontal / Abdominaux | row, leg + ajouts phase2b: rearShoulder | OK — responsabilité conservée |
| E | Chaîne postérieure / Tibias | bridge, tibialis + ajouts phase2b: hamstring | OK — responsabilité conservée |
| F | Poussée verticale / Anti-extension | pike, hollow, scapPush | OK — responsabilité conservée |
| G | Stabilité latérale | G1: sidePlank, adductor / G2: antiRotation, abductor | OK — responsabilité conservée |

## Cartographie musculaire

| Ligne | Propriétaire | Direct | Secondaires importants | Secondaires légers | Observation |
|---|---|---|---|---|---|
| pullup | Dos (back) | lats, upperBack | elbowFlexors, forearmGrip | — | Cohérent avec la fiche technique. |
| hang | Avant-bras / prise (forearms) | forearmGrip | scapular | — | Cohérent avec la fiche technique. |
| split | Quadriceps (quads) | quads | gluteMax, adductors | — | Cohérent avec la fiche technique. |
| gluteSplit | Fessiers (glutes) | gluteMax | quads, adductors | — | Cohérent avec la fiche technique. |
| calf | Mollets / bas de jambe (lowerLeg) | calves | — | — | Cohérent avec la fiche technique. |
| pushup | Pectoraux (chest) | pecs | triceps, frontDelt | — | Cohérent avec la fiche technique. |
| dip | Triceps (triceps) | triceps | pecs, frontDelt | — | Cohérent avec la fiche technique. |
| row | Dos (back) | upperBack, lats | elbowFlexors, rearDelt, forearmGrip | — | Cohérent avec la fiche technique. |
| leg | Abdos / tronc (core) | absCompression | hipFlexors | — | Cohérent avec la fiche technique. |
| bridge | Fessiers (glutes) | gluteMax | hamstrings | — | Cohérent avec la fiche technique. |
| tibialis | Mollets / bas de jambe (lowerLeg) | tibialis | — | — | Cohérent avec la fiche technique. |
| pike | Épaules (shoulders) | frontDelt | triceps | — | Cohérent avec la fiche technique. |
| scapPull | Dos (back) | scapular | — | — | Cohérent avec la fiche technique. |
| scapPush | Épaules (shoulders) | scapular | — | — | Cohérent avec la fiche technique. |
| hollow | Abdos / tronc (core) | coreStability | — | — | Famille de fatigue corrigée de compression abdominale vers stabilité du tronc. |
| hamstring | Ischios (hamstrings) | hamstrings | gluteMax | — | Cohérent avec la fiche technique. |
| rearShoulder | Épaules (shoulders) | rearDelt, upperBack | — | — | Cohérent avec la fiche technique. |
| sidePlank | Abdos / tronc (core) | coreStability | gluteMed | — | Cohérent avec la fiche technique. |
| adductor | Abdos / tronc (core) | adductors | coreStability | — | Propriétaire programmatique « core »; cible anatomique adducteurs explicite, sans fausse création de zone. |
| antiRotation | Abdos / tronc (core) | coreStability | — | — | Cohérent avec la fiche technique. |
| abductor | Fessiers (glutes) | gluteMed | — | — | Cohérent avec la fiche technique. |
| neck | hors objectifs | neck | — | — | Cohérent avec la fiche technique. |
| chinup | Biceps (biceps) | elbowFlexors | lats, upperBack, forearmGrip | — | Cohérent avec la fiche technique. |
| reverseCrunch | Abdos / tronc (core) | absCompression | obliques, hipFlexors | — | Cohérent avec la fiche technique. |

La zone Épaules reste explicitement « partial » parce que le deltoïde latéral n’a pas de ligne directe avec le matériel actuel. Ce manque n’a pas été masqué par une attribution musculaire fictive.

## Force, Hypertrophie, Endurance et Puissance

| Contrôle | Résultat |
|---|---|
| Variantes et prescriptions | 214 entrées conservées; aucun changement de séries, répétitions, unités ou repos. |
| Force | Baseline historique inchangée et couverte par les tests. |
| Hypertrophie | 16 lignes H, cartes d’initialisation et template Fessiers conservés. |
| Endurance | Supports et leviers des variantes de traction, pompe, rowing et Pike désormais définis; 0 décision restante. |
| Puissance | Pike rapide/plyométrique, Split jump alterné et saut vertical unipodal sont explicitement distincts. |

## Scheduler et fillers

Le scheduler conserve sa matrice publique de compatibilité. Il distingue maintenant la famille principale des familles secondaires réellement fatiguées; cela évite notamment de considérer prise, tirage dorsal et scapula comme indépendants.

| Ligne | Famille principale | Familles secondaires prises en compte |
|---|---|---|
| pullup | TV — Tirage vertical | GR, SC |
| hang | GR — Grip / suspension | TV, SC |
| split | JG — Jambes dominante genou | HA |
| gluteSplit | JG — Jambes dominante genou | HA, CP |
| calf | MO — Mollets | — |
| pushup | PH — Poussée horizontale / dips | SC, ST |
| dip | PH — Poussée horizontale / dips | PV, SC |
| row | TH — Tirage horizontal | GR, SC |
| leg | AF — Abdos / compression | — |
| bridge | CP — Chaîne postérieure | ST |
| tibialis | TI — Tibial | — |
| pike | PV — Poussée verticale | PH, SC |
| scapPull | SC — Scapulaire / arrière d’épaule | TV, GR |
| scapPush | SC — Scapulaire / arrière d’épaule | PH |
| hollow | ST — Stabilité tronc | — |
| hamstring | CP — Chaîne postérieure | HA |
| rearShoulder | SC — Scapulaire / arrière d’épaule | TH |
| sidePlank | ST — Stabilité tronc | HA, SC |
| adductor | HA — Hanche / adducteurs / abducteurs | ST |
| antiRotation | ST — Stabilité tronc | SC |
| abductor | HA — Hanche / adducteurs / abducteurs | ST |
| neck | SC — Scapulaire / arrière d’épaule | — |
| chinup | TV — Tirage vertical | GR, SC |
| reverseCrunch | AF — Abdos / compression | ST |

Fillers vérifiés :
- Squats légers (`squat`) — famille JG, doses 5/8/10 reps.
- Mollets deux jambes (`calf`) — famille MO, doses 8/10/12 reps.
- Tibialis facile (`tibialis`) — famille TI, doses 8/10/12 reps.
- Pont fessier deux jambes (`bridge`) — famille CP, doses 6/8/10 reps.
- Bird dog (`birdDog`) — famille ST, doses 3/4/5 side.
- Dead bug (`deadBug`) — famille ST, doses 3/4/5 side.
- Élévation latérale jambe (`lateralLeg`) — famille HA, doses 5/7/8 side.
- Adduction allongée (`adduction`) — famille HA, doses 5/7/8 side.
- Wall slide scapulaire (`wallSlide`) — famille SC, doses 5/6/8 reps.

Corrections scheduler : Hollow/planche passe de AF (compression) à ST (stabilité); les tractions et chin-ups exposent grip + scapulaire; les rows exposent grip + scapulaire; les suspensions exposent tirage vertical + scapulaire; les relevés suspendus ajoutent grip + tirage vertical. Les conflits secondaires dégradent une association sûre en ORANGE, sans transformer arbitrairement tous les couples en RED.

## Cohérence avec les fiches

Chaque fiche utilise désormais le même objet technique que le moteur : repère court de séance, position structurée, exécution, amplitude, respiration, tempo, erreurs, arrêt et muscles. Aucun texte concurrent n’est maintenu dans l’interface.
