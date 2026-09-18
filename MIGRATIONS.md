# Migrations de données

## Version actuelle

- Base globale : `schemaVersion: 2`.
- Chaque profil : `schemaVersion: 2`.
- Clé active : `muscu-cycle-data`.
- Ancienne clé V1 lue : `muscu-cycle-v1`.

Au premier chargement, une sauvegarde V1 valide est convertie vers la base globale avec un profil Principal. L’ancienne clé n’est pas supprimée automatiquement : elle reste une protection supplémentaire.

## Garanties

- La migration travaille sur une copie.
- La structure finale est entièrement validée avant enregistrement.
- Un échec conserve la donnée originale et affiche une erreur.
- Aucune incompatibilité ne déclenche un reset silencieux.
- Historique, objectifs réellement effectués, notes, paliers et séance active sont conservés.

## Ajouter une future version

1. Augmenter `DATABASE_VERSION` dans `dist/storage.js` et le `schemaVersion` des profils si nécessaire.
2. Ajouter une fonction pure `vN → vN+1`.
3. Chaîner les migrations une par une jusqu’à la version courante.
4. Ne jamais écrire avant `assertDatabase`.
5. Ajouter au minimum : migration valide, entrée endommagée, données historiques, séance active, Principal/Test et backup.

Une migration ne doit jamais recalculer les résultats passés à partir du programme actuel : les résultats contiennent leur propre snapshot.
