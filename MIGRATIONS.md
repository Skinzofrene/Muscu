# Migrations de données

## V6.1 → V6.2 (schéma inchangé : 7)

V6.2 ne change pas la forme persistée : aucune migration de données n’est nécessaire et `schemaVersion` reste à 7. Les profils, historiques, registres, niveaux H, rotations et backups V6.1 sont relus tels quels puis normalisés par les garanties existantes.

Le correctif de persistance concerne le lancement : l’application reste sur `http://localhost:4173` au lieu de choisir silencieusement un autre port, car le stockage du navigateur est isolé par origine. Une instance V6.2 déjà active peut être réutilisée ; une occupation étrangère ou ancienne provoque un message explicite.

## V6 → V6.1 (schéma 7)

Le schéma passe de 6 à 7 parce que l’état officiel persistant `skipped`, le marqueur d’initialisation H et le journal anti-double-consommation des rotations doivent survivre au rechargement, à l’export/import et à une réouverture de bloc.

Chaque profil reçoit :

- `hypertrophyInitialized` pour chaque ligne H ;
- `registry.rotationConsumptions` ;
- les niveaux et rotations de la nouvelle ligne objective-only `gluteSplit` ;
- le template Fessiers H si cet objectif était déjà actif et qu’aucune séance musculaire n’est en cours.

Critère de conservation : si l’historique ou la séance active contient au moins un résultat de la ligne avec `stimulus: hypertrophy` et `countsTowardHypertrophyVolume: true`, le niveau H existant est conservé. Sans résultat H réel, Bridge, GluteSplit et Abductor peuvent être initialisés depuis la variante Force via la table explicite documentée dans `docs/OBJECTIVES.md`. Une séance active V6 n’est jamais recomposée pendant la migration.

## V5 → V6

Le schéma passe de 5 à 6. Chaque profil reçoit 11 objectifs à `strength`, une personnalisation `balanced`, des niveaux H initiaux, des rotations H indépendantes et aucune modification en attente. L’historique V5 est conservé avec `priorityAtCreation: strength`, `source: canonical` et `countsTowardHypertrophyVolume: false`. Une séance active est annotée mais jamais recomposée pendant la migration. Principal, Test et les backups sont migrés séparément.

## Version actuelle

- Base globale et profils : `schemaVersion: 7`.
- Clé active : `muscu-cycle-data`.
- Ancienne clé V1 lue : `muscu-cycle-v1`.

## Migration V4 → V5

La migration remplace uniquement le référentiel Souplesse actif. Les anciens résultats Souplesse utilisent des identifiants interprétés qui ne permettent pas une correspondance certaine avec n1–n35 : ils sont donc conservés avec `legacy: true`, leur identifiant d’origine et `sourceContext: flexibility-legacy`. Une ancienne routine active devient une entrée historique interrompue afin d’éviter de poursuivre avec un plan incompatible. Aucun faux mapping n’est produit.

La migration initialise aussi le journal `activityOffers` du scheduler. Progression, paliers, historique musculaire, séance musculaire active, registre officiel, réglages, Principal/Test et sauvegarde avant reset sont conservés. Les anciennes Mobilités déjà enregistrées restent lisibles.

Les migrations V1 à V5 passent par leurs normalisations existantes puis aboutissent au schéma 7. Les snapshots sportifs anciens ne reçoivent aucun crédit H rétroactif.

## Garanties

- clonage avant migration et validation complète avant écriture ;
- donnée originale conservée si la migration échoue ;
- aucun résultat passé recalculé depuis le programme courant ;
- sauvegarde principale, profil Test et backup migrés séparément ;
- tests dédiés à la conservation musculaire et au marquage legacy.
