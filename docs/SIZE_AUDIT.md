# Audit de taille — Muscu V6.2 Visual Catalog

Audit réalisé le 25 septembre 2026 à partir de la livraison canonique `Muscu-V6.2-Visual-Catalog-Complete`, avant toute modification.

## Conclusion

> Ce document conserve les mesures historiques de l’audit de poids effectué avant la correction des séquences. L’état livré après cette correction contient **95 fichiers visuels** dans `dist/assets/exercises`, pour **3 885 796 octets** métadonnées incluses, contre **4 794 336 octets** dans la version WebP canonique immédiatement précédente. Le détail courant est dans `VISUAL_SEQUENCE_AUDIT.md`.

La taille annoncée d'environ **847 Mo** n'est pas reproduite par le fichier livré. L'archive canonique mesure exactement **8 468 151 octets**, soit **8,468 Mo décimaux** ou **8,076 Mio**. Son empreinte SHA-256 initiale est `A3B4DAFC28D1445246724297705D3EE550E9D55AE402816893081B4D5CD9400A`.

Le dossier décompressé initial contient **211 fichiers** pour **10 616 149 octets** (10,124 Mio). L'écart avec « 847 Mo » est donc d'un facteur 100 environ et correspond vraisemblablement à une lecture ou un affichage ayant perdu le séparateur décimal. Aucun élément local ne justifie 847 Mo.

Le poids réel est principalement celui des ressources nécessaires au fonctionnement hors ligne :

| Catégorie initiale | Fichiers | Octets | Part du dossier |
|---|---:|---:|---:|
| Catalogue visuel des exercices | 133 | 5 995 764 | 56,48 % |
| Pages Souplesse WebP | 10 | 3 746 904 | 35,29 % |
| Runtime `dist` hors images | 23 | 570 258 | 5,37 % |
| Métadonnées et attributions des assets | 2 | 4 647 | 0,04 % |
| Documentation | 13 | 115 534 | 1,09 % |
| Tests | 15 | 126 637 | 1,19 % |
| Scripts | 2 | 24 313 | 0,23 % |
| Racine, rapports et CI | 13 | 33 365 | 0,31 % |

Les images du catalogue et les pages Souplesse représentent ensemble **91,77 %** du dossier. Les sources de test, scripts, documents, rapports et fichiers de racine restent minoritaires. Le dossier `dist` représente **10 316 300 octets**, soit **97,18 %** du total initial.

## Structure de l'archive et fichiers indésirables

- Archive initiale : 215 entrées, 10 616 149 octets décompressés, 8 431 413 octets de données compressées auxquels s'ajoutent les structures ZIP.
- Aucun `node_modules`, `.git`, cache, couverture, dossier temporaire ou build ancien.
- Aucune archive ZIP/7z/RAR/TAR imbriquée.
- Aucun GIF, MP4, WebM ou autre média vidéo.
- Aucun dump de dataset externe ni clone de dépôt.
- Les dossiers `docs`, `tests`, `scripts`, `reports` et `.github` sont des éléments de support identifiés, pas des dépendances runtime cachées.

## Catalogue visuel initial

Le manifeste contient exactement **86 Visual Movements**, **159 variantes**, **162 occurrences de frames** et **133 chemins de fichiers uniques**. Les 133 fichiers existent tous ; **0 fichier manque** et **0 image est orpheline**.

| Source | Fichiers | Format | Dimensions raster | Octets |
|---|---:|---|---|---:|
| Workout Guide | 111 | SVG | vectoriel | 2 381 724 |
| RepDB | 14 | WebP | 512 × 512 | 191 806 |
| Free Exercise DB | 2 | JPEG | 850 × 567 | 120 914 |
| Custom | 6 | PNG RGBA | 1086 × 1448 | 3 301 320 |
| **Total** | **133** |  |  | **5 995 764** |

Les six PNG Custom étaient les six fichiers individuels les plus lourds du catalogue. Ils constituaient donc la seule cible offrant un gain significatif sans toucher au contenu, aux dimensions ou aux animations.

## Doublons et données répliquées

Un seul doublon binaire exact a été détecté :

- `repdb/side-plank-leg-lift-hold-main.webp`
- `repdb/side-plank-leg-lift-peak.webp`
- SHA-256 commun : `0DFFEC078046E4585CFC2EEFB4A54875968C0BB77F4D72D98A3D7B07905B90D3`
- 13 958 octets par fichier.

Les deux noms portent des rôles sémantiques distincts et font partie des 133 fichiers validés. Le doublon est donc conservé : le supprimer casserait le contrat de comptage demandé pour un gain brut de seulement 13 958 octets.

Le catalogue existe sous deux représentations :

- `dist/visual-catalog.js` : 59 742 octets, importé par l'application.
- `dist/visual-catalog.json` : 62 298 octets, lu par le service worker pour construire la liste de préchargement.

Cette duplication logique de 122 040 octets est intentionnelle. `technical-catalog.js` (121 236 octets) est un référentiel technique distinct, pas un clone du catalogue visuel.

## Préchargement PWA et mode hors ligne

À l'installation, le service worker ouvre un cache versionné, charge `visual-catalog.json`, déduplique les chemins de frames, puis appelle `cache.addAll` sur :

- 32 requêtes de shell : **4 316 139 octets** nominaux ;
- 133 ressources visuelles uniques : **5 995 764 octets** ;
- total nominal : **165 requêtes** et **10 311 903 octets**.

À l'activation, les anciens caches portant le même préfixe sont supprimés. Pour une navigation, `index.html` en cache est prioritaire. Pour les autres requêtes GET du même périmètre, la stratégie est cache-first, puis réseau avec mise en cache de la réponse réussie.

Le préchargement n'ajoute aucun double aux fichiers du ZIP : il crée une copie locale dans le cache du navigateur au premier chargement afin de garantir le fonctionnement hors ligne. Il explique l'occupation navigateur après installation, pas une archive de 847 Mo.

## Top 50 initial

« Catalogue visuel » indique une frame référencée ou l'un des deux manifestes. Aucun des 50 fichiers n'est supprimable sans retirer une ressource runtime, une donnée validée ou un document de référence.

| # | Fichier | Octets | Runtime | Catalogue visuel | Candidat suppression |
|---:|---|---:|:---:|:---:|:---:|
| 1 | `dist/assets/exercises/custom/tibialis-wall-high.png` | 670 604 | Oui | Oui | Non — optimiser |
| 2 | `dist/assets/exercises/custom/tibialis-wall-low.png` | 641 897 | Oui | Oui | Non — optimiser |
| 3 | `dist/assets/exercises/custom/copenhagen-high.png` | 537 616 | Oui | Oui | Non — optimiser |
| 4 | `dist/assets/exercises/custom/reverse-crunch-long-high.png` | 531 297 | Oui | Oui | Non — optimiser |
| 5 | `dist/assets/exercises/custom/copenhagen-low.png` | 525 747 | Oui | Oui | Non — optimiser |
| 6 | `dist/assets/flexibility/pages/page-02.webp` | 449 442 | Oui | Non | Non |
| 7 | `dist/assets/exercises/custom/reverse-crunch-long-low.png` | 394 159 | Oui | Oui | Non — optimiser |
| 8 | `dist/assets/flexibility/pages/page-08.webp` | 394 024 | Oui | Non | Non |
| 9 | `dist/assets/flexibility/pages/page-03.webp` | 381 988 | Oui | Non | Non |
| 10 | `dist/assets/flexibility/pages/page-06.webp` | 376 492 | Oui | Non | Non |
| 11 | `dist/assets/flexibility/pages/page-04.webp` | 373 284 | Oui | Non | Non |
| 12 | `dist/assets/flexibility/pages/page-05.webp` | 365 042 | Oui | Non | Non |
| 13 | `dist/assets/flexibility/pages/page-09.webp` | 359 030 | Oui | Non | Non |
| 14 | `dist/assets/flexibility/pages/page-07.webp` | 355 658 | Oui | Non | Non |
| 15 | `dist/assets/flexibility/pages/page-01.webp` | 351 680 | Oui | Non | Non |
| 16 | `dist/assets/flexibility/pages/page-10.webp` | 340 264 | Oui | Non | Non |
| 17 | `dist/technical-catalog.js` | 121 236 | Oui | Non | Non |
| 18 | `dist/assets/exercises/workout-guide/hanging-leg-raise/frame-2.svg` | 89 396 | Oui | Oui | Non |
| 19 | `dist/app.js` | 85 044 | Oui | Non | Non |
| 20 | `dist/assets/exercises/workout-guide/single-leg-glute-bridge/frame-3.svg` | 70 932 | Oui | Oui | Non |
| 21 | `dist/visual-catalog.json` | 62 298 | Oui | Oui | Non |
| 22 | `dist/assets/exercises/free-exercise-db/Single-Arm_Push-Up/1.jpg` | 61 591 | Oui | Oui | Non |
| 23 | `dist/assets/exercises/workout-guide/single-leg-box-squat/frame-2.svg` | 61 198 | Oui | Oui | Non |
| 24 | `dist/visual-catalog.js` | 59 742 | Oui | Oui | Non |
| 25 | `dist/assets/exercises/free-exercise-db/Single-Arm_Push-Up/0.jpg` | 59 323 | Oui | Oui | Non |
| 26 | `docs/TECHNICAL_AUDIT.md` | 51 105 | Non | Non | Non |
| 27 | `dist/assets/exercises/workout-guide/bird-dog/frame-3.svg` | 47 908 | Oui | Oui | Non |
| 28 | `dist/assets/exercises/workout-guide/dead-hang/frame-2.svg` | 43 393 | Oui | Oui | Non |
| 29 | `dist/assets/exercises/workout-guide/bulgarian-split-squat/frame-3.svg` | 40 712 | Oui | Oui | Non |
| 30 | `dist/style.css` | 40 387 | Oui | Non | Non |
| 31 | `dist/assets/exercises/workout-guide/pike-push-up/frame-3.svg` | 39 637 | Oui | Oui | Non |
| 32 | `dist/assets/exercises/workout-guide/scapular-push-up/frame-2.svg` | 39 329 | Oui | Oui | Non |
| 33 | `dist/assets/exercises/workout-guide/lying-hamstring-walkout/frame-3.svg` | 38 299 | Oui | Oui | Non |
| 34 | `dist/engine.js` | 38 262 | Oui | Non | Non |
| 35 | `dist/assets/exercises/workout-guide/bodyweight-squat/frame-3.svg` | 37 724 | Oui | Oui | Non |
| 36 | `dist/assets/exercises/workout-guide/active-hang/frame-3.svg` | 37 603 | Oui | Oui | Non |
| 37 | `dist/assets/exercises/workout-guide/reverse-snow-angel/frame-3.svg` | 37 421 | Oui | Oui | Non |
| 38 | `dist/assets/exercises/workout-guide/scapular-pull-up/frame-3.svg` | 37 247 | Oui | Oui | Non |
| 39 | `dist/assets/exercises/workout-guide/reverse-snow-angel/frame-2.svg` | 36 543 | Oui | Oui | Non |
| 40 | `dist/assets/exercises/workout-guide/captains-chair-knee-raise/frame-2.svg` | 36 432 | Oui | Oui | Non |
| 41 | `dist/assets/exercises/workout-guide/jump-squat/frame-2.svg` | 34 650 | Oui | Oui | Non |
| 42 | `dist/assets/exercises/workout-guide/bodyweight-squat/frame-2.svg` | 32 930 | Oui | Oui | Non |
| 43 | `dist/assets/exercises/workout-guide/copenhagen-plank/frame-3.svg` | 32 002 | Oui | Oui | Non |
| 44 | `dist/assets/exercises/workout-guide/archer-push-up/frame-3.svg` | 30 746 | Oui | Oui | Non |
| 45 | `dist/assets/exercises/workout-guide/hanging-knee-raise/frame-3.svg` | 29 990 | Oui | Oui | Non |
| 46 | `dist/assets/exercises/workout-guide/assisted-pistol-squat/frame-2.svg` | 29 862 | Oui | Oui | Non |
| 47 | `docs/VARIANT_AUDIT.md` | 29 854 | Non | Non | Non |
| 48 | `dist/flexibility.js` | 29 852 | Oui | Non | Non |
| 49 | `dist/assets/exercises/workout-guide/captains-chair-knee-raise/frame-3.svg` | 29 284 | Oui | Oui | Non |
| 50 | `dist/assets/exercises/workout-guide/pistol-squat/frame-3.svg` | 28 482 | Oui | Oui | Non |

## Décision d'optimisation

La seule optimisation retenue est la conversion **WebP lossless** des six PNG Custom. Elle conserve dimensions, alpha RGBA et pixels décodés. Aucun SVG Workout Guide, WebP RepDB, JPEG Free Exercise DB, document Souplesse, code fonctionnel, programme, texte technique ou mapping visuel n'est modifié.
