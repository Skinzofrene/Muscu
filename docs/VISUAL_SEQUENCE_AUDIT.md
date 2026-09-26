# Audit des séquences visuelles — Muscu V6.2

## Résultat

L’audit couvre les **86 mouvements visuels** et les **159 variantes**. Aucun mouvement, mapping, texte technique ou réglage sportif n’a été ajouté ou modifié.

| Mesure | Avant | Après |
|---|---:|---:|
| Mouvements visuels | 86 | 86 |
| Variantes couvertes | 159 | 159 |
| Entrées sans image directe | 25 | 25 |
| Visuels statiques à 1 frame | 4 | 12 |
| Animations simples à 2 frames | 13 | 43 |
| Animations complexes à 3 frames | 44 | 6 |
| Fichiers visuels physiques | 133 | 95 |
| Fichiers Workout Guide | 111 | 73 |
| Fichiers RepDB / Free Exercise DB / custom | 14 / 2 / 6 | 14 / 2 / 6 |

Distribution brute avant correction : **0 frame = 25**, **1 frame = 4**, **2 frames = 13**, **3 frames = 44**, **plus de 3 = 0**. Distribution finale : **STATIC_1_FRAME = 12**, **SIMPLE_2_FRAMES = 43**, **COMPLEX_3_FRAMES = 6**, **TEXT_ONLY = 3**, **PARENT = 22**.

Les 38 fichiers retirés étaient des phases Workout Guide devenues non référencées après la simplification. Les licences, attributions et six images custom sont conservées.

Taille du dossier `dist/assets/exercises` : **4 794 336 octets avant**, **3 885 796 octets après**, soit **908 540 octets économisés**. Ces mesures incluent les deux fichiers de provenance/licence présents dans les deux versions ; le nombre de fichiers visuels passe bien de 133 à 95.

### Compteurs de correction

- **38 animations simplifiées** : 30 dynamiques passées de 3 à 2 frames et 8 statiques passées de 3 à 1 frame ;
- **46 références de frames retirées** des tableaux `frames` ;
- **85 indices de retour dupliqués retirés** des données de séquence et remplacés par la boucle du lecteur ;
- **0 doublon de chemin** et **0 doublon binaire** restent dans une même animation ;
- **6 animations avec incohérence stylistique corrigée**, correspondant à 4 sets physiques : pull-up (2 mouvements), inverted row (2 mouvements), chin-up et hanging knee raise ;
- **6 animations conservées à 3 frames** après validation visuelle et biomécanique.

Statuts finaux des 86 audits : **UNCHANGED 4**, **SIMPLIFIED 32**, **DEDUPLICATED 13**, **STYLE_FIXED 6**, **SEQUENCE_FIXED 31**. Les tableaux ci-dessous utilisent les chemins de fichiers comme preuve de source : `workout-guide`, `repdb`, `free-exercise-db` ou `custom`.

## Règle du lecteur

Le manifeste contient désormais uniquement l’ordre avant : `[0]`, `[0,1]` ou `[0,1,2]`. Le lecteur construit lui-même la boucle :

- 1 frame : `A` ;
- 2 frames : `A → B → A → B…` ;
- 3 frames : `A → B → C → B → A…`.

Aucun chemin n’est répété dans une animation et aucun couple d’images d’une même animation n’a le même hash SHA-256.

## Audit exhaustif des 86 mouvements

### 25 entrées sans image directe

Les 22 entrées `USE_PARENT_VISUAL` continuent de résoudre exactement leur parent corrigé. Les 3 entrées `TEXT_SUFFICIENT` restent sans image. Leur séquence vide est maintenant représentée par `[]` au lieu de `[0]`. Statut des 25 lignes : **SEQUENCE_FIXED**.

| Mouvement | Statut |
|---|---|
| visual-pullup-assisted-two-feet | parent |
| visual-pullup-assisted-one-foot | parent |
| visual-pullup-one-arm-assisted | parent |
| visual-asymmetric-hang | parent |
| visual-assisted-one-arm-hang | parent |
| visual-alternating-split-jump | parent |
| visual-unilateral-jump | parent |
| visual-incline-pushup | parent |
| visual-inverted-row-feet-elevated | parent |
| visual-inverted-row-asymmetric | parent |
| visual-inverted-row-archer | parent |
| visual-inverted-row-one-arm-assisted | parent |
| visual-long-lever-glute-bridge | parent |
| visual-pike-pushup-plyometric | parent |
| visual-wall-slide | texte suffisant |
| visual-long-lever-plank | parent |
| visual-hollow-tuck | parent |
| visual-hollow-one-leg | parent |
| visual-hamstring-walkout-unilateral | parent |
| visual-prone-w | texte suffisant |
| visual-prone-ytw | texte suffisant |
| visual-knee-side-plank | parent |
| visual-plank-arm-reach | parent |
| visual-advanced-asymmetric-plank | parent |
| visual-knee-side-plank-abduction | parent |

### 12 visuels statiques

Statut : les huit lignes `3 → 1` sont **SIMPLIFIED** ; les quatre lignes `1 conservée` sont **UNCHANGED**.

| Mouvement | Frame retenue | Décision |
|---|---|---|
| visual-dead-hang | dead-hang/frame-1.svg | 3 → 1, position passive lisible |
| visual-active-hang | active-hang/frame-1.svg | 3 → 1, position active lisible |
| visual-wall-handstand-hold | wall-handstand-push-up/frame-3.svg | 3 → 1, correction : bras tendus plutôt que bas de HSPU |
| visual-active-scapular-hold | scapular-pull-up/frame-1.svg | 3 → 1, maintien actif |
| visual-front-plank | plank/frame-1.svg | 3 → 1, correction : planche complète plutôt que variante genoux |
| visual-hollow-body | hollow-body-hold/frame-1.svg | 3 → 1, hollow complet |
| visual-side-plank | side-plank/frame-1.svg | 3 → 1, maintien complet |
| visual-assisted-star-side-plank | side-plank-leg-lift-hold-main.webp | 1 conservée |
| visual-star-side-plank | side-plank-leg-lift-hold-main.webp | 1 conservée, partage inter-mouvements autorisé |
| visual-copenhagen-short | copenhagen-high.webp | 1 conservée, custom inchangé |
| visual-copenhagen-long | copenhagen-plank/frame-1.svg | 3 → 1, maintien long |
| visual-manual-neck-isometrics | isometric-neck-side-main.webp | 1 conservée |

### 43 animations simples

Chaque ligne joue les deux phases indiquées. `3 → 2` signifie qu’une phase intermédiaire non indispensable a été supprimée. `2 conservées` signifie que les images étaient déjà correctes et que seule la répétition du chemin dans la donnée a été retirée.

Statut : les 13 lignes `2 conservées` sont **DEDUPLICATED**. Parmi les 30 lignes `3 → 2`, pull-up (2), inverted row (2), hanging knee raise et chin-up sont **STYLE_FIXED** ; les 24 autres sont **SIMPLIFIED**.

| Mouvement | Phases retenues | Décision |
|---|---|---|
| visual-pullup-pronated | pull-up/frame-3.svg → frame-1.svg | 3 → 2 ; dessin épais frame-2 supprimé |
| visual-pullup-chest-high | pull-up/frame-3.svg → frame-1.svg | 3 → 2 ; dessin épais frame-2 supprimé |
| visual-pullup-asymmetric-assisted | archer-pull-ups-start.webp → peak.webp | 2 conservées |
| visual-pullup-archer | archer-pull-ups-start.webp → peak.webp | 2 conservées |
| visual-split-squat | split-squat-start.webp → peak.webp | 2 conservées ; règle RepDB explicite |
| visual-bulgarian-split-squat | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pistol-assisted | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pistol-to-support | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pistol-squat | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-bodyweight-squat | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-jump-squat | frame-3.svg → frame-1.svg | 3 → 2, bas → envol |
| visual-glute-split-squat | split-squat-start.webp → peak.webp | 2 conservées ; règle RepDB explicite |
| visual-glute-bulgarian | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-single-leg-calf-raise | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pushup-classic | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pushup-feet-elevated | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pushup-one-arm | 0.jpg → 1.jpg | 2 conservées |
| visual-pushup-explosive | frame-1.svg → frame-3.svg | 3 → 2, bas → envol/clap |
| visual-parallel-bar-dip | frame-1.svg → frame-3.svg | 3 → 2 |
| visual-inverted-row | frame-3.svg → frame-1.svg | 3 → 2 ; dessin épais frame-2 supprimé |
| visual-inverted-row-horizontal | frame-3.svg → frame-1.svg | 3 → 2 ; dessin épais frame-2 supprimé |
| visual-captains-chair-knee-raise | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-captains-chair-leg-raise | start.webp → peak.webp | 2 conservées |
| visual-hanging-knee-raise | frame-3.svg → frame-1.svg | 3 → 2 ; phase épaisse supprimée |
| visual-hanging-leg-raise | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-toes-to-bar | start.webp → peak.webp | 2 conservées |
| visual-glute-bridge | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-single-leg-glute-bridge | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-tibialis-wall-raise | tibialis-wall-low.webp → high.webp | 2 custom conservées |
| visual-tibialis-single-leg | tibialis-wall-low.webp → high.webp | 2 custom conservées |
| visual-pike-pushup | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-pike-pushup-vertical | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-elevated-pike-pushup | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-wall-hspu | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-scapular-pullup | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-scapular-pushup | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-side-lying-adduction | start.webp → peak.webp | 2 conservées |
| visual-copenhagen-dynamic | copenhagen-low.webp → high.webp | 2 custom conservées |
| visual-side-lying-abduction | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-side-plank-abduction | start.webp → peak.webp | 2 conservées |
| visual-chinup-supinated | frame-3.svg → frame-1.svg | 3 → 2 ; dessin épais frame-2 supprimé |
| visual-reverse-crunch-flexed | frame-3.svg → frame-1.svg | 3 → 2 |
| visual-reverse-crunch-long-lever | reverse-crunch-long-low.webp → high.webp | 2 custom conservées |

### 6 animations complexes justifiées

Statut des six lignes : **SEQUENCE_FIXED**. Les trois fichiers sources sont conservés, mais le retour ping-pong n’est plus encodé dans le manifeste.

| Mouvement | Ordre avant | Pourquoi la troisième phase est utile |
|---|---|---|
| visual-pushup-archer | frame-1 → frame-2 → frame-3 | transfert latéral gauche → centre → droite |
| visual-hamstring-walkout | frame-3 → frame-2 → frame-1 | trajectoire longue des talons |
| visual-hamstring-walkout-bilateral | frame-3 → frame-2 → frame-1 | même trajectoire longue canonique |
| visual-reverse-snow-angel | frame-3 → frame-2 → frame-1 | grand arc des bras le long du sol |
| visual-bird-dog | frame-1 → frame-2 → frame-3 | extension d’un côté → quadrupédie → côté opposé |
| visual-shoulder-taps | frame-1 → frame-2 → frame-3 | touche gauche → planche → touche droite |

## Contrôles automatiques ajoutés

- maximum de 3 frames par mouvement ;
- exactement 1 frame pour `STATIC`, 2 pour `DYNAMIC_SIMPLE`, 3 pour `DYNAMIC_COMPLEX` ;
- ordre de manifeste strictement avant et sans chemin répété ;
- absence de doublon binaire dans une même animation ;
- traction pronation et poitrine haute sans `frame-2.svg` ;
- split squat et variante fessiers limités à `start + peak` ;
- planche complète et handstand statique verrouillés sur la bonne posture ;
- 95 fichiers physiques, tous référencés, tous locaux ;
- couverture inchangée : 86 mouvements, 159 variantes, 0 manquant.
