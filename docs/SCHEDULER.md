# Scheduler Muscu V6.2

## Objectifs V6

Le stimulus d’une unité officielle est un snapshot. Express peut déplacer une unité H et Hybride peut l’exécuter, mais aucun mode d’organisation ne modifie son stimulus ou sa prescription. Les fillers Densité et la Mobilité restent complémentaires et ne créditent jamais le volume H. Puissance conserve sa protection complète et ne reçoit aucun top-up H du même propriétaire pendant son repos.

Le programme canonique reste dans `dist/program.js`. Le scheduler change uniquement l’ordre d’exécution et les activités facultatives pendant les repos.

## Registre et protection prospective

Chaque série officielle conserve son identifiant et son état `pending`, `in_progress`, `completed` ou `skipped`. Une série terminée ne réapparaît pas et le cycle suivant n’est créé qu’après résolution du cycle courant (`completed` ou `skipped`).

## Blocs passés

`skipped` est un état de navigation persistant, jamais un résultat sportif. **Passer le bloc** est visible sur la carte d’accueil et dans la séance, agit en un clic et protège la mutation contre les doubles déclenchements. Hors séance, il transforme les unités `pending`. Pendant une séance, il conserve les résultats validés dans un historique interrompu, puis passe toutes les unités restantes, y compris l’unité active. Un bloc entièrement passé affiche **Passé** ; un bloc partiel affiche **Partiel · Passé**.

Les unités `skipped` sont exclues des candidats Express/Hybride et ne deviennent pas des fillers. Elles ne produisent ni historique, ni répétition, ni seconde, ni volume H, ni record, ni progression, ni consommation de `modeRotation`, `hypertrophyRotation`, maintenance ou alternance. La finalisation ne consomme les curseurs que pour les unités `completed`, avec un journal `rotationConsumptions` qui empêche toute double consommation après réouverture.

Dans le cycle courant, Réouvrir remet uniquement `skipped → pending`, conserve les mêmes identifiants et les résultats déjà réalisés, puis retire le marqueur de finalisation du bloc. Une fois le cycle suivant créé, l’ancien registre n’est plus réouvrable.

L’accueil mémorise séparément le bloc consulté et le bloc courant. **Voir le bloc précédent** n’altère ni `next`, ni le registre, ni les historiques. **Revenir au bloc actuel** restaure simplement la vue. Démarrer ou réouvrir depuis un bloc consulté reste une action explicite et transmet son identifiant au moteur.

Chaque suggestion est comparée à l’exercice en récupération, à la prochaine unité et à la deuxième unité. Pour la prochaine unité : GREEN 0, ORANGE −25 avec réglage Maximal uniquement, RED exclu. Pour la deuxième : GREEN 0, ORANGE −10, RED −20. La régression Tractions → Pompes candidate → Suspension reste couverte par les tests.

## Modes

- Qualité : ordre officiel et repos passif.
- Express : unité officielle compatible du cycle courant.
- Densité : ordre officiel avec Renforcement léger, Mobilité ou Mixte.
- Hybride : unité officielle compatible d’abord, puis complément configuré.

Changer de mode ne remet à zéro ni la série, ni le repos, ni les disponibilités internes.

## Mobilité nXX

Le pool standard est `n1,n2,n7,n10,n15,n16,n35`. Le pool conditionnel est `n3,n4,n9,n14,n22,n24,n33,n34`. Aucun autre numéro ne peut être auto-proposé.

Une proposition respecte la fenêtre restante avant la zone protégée, la compatibilité des trois contextes et la limite absolue de 20 secondes. Le même nXX est exclu des quatre dernières offres complémentaires. Une zone principale présente dans les deux dernières offres reçoit une pénalité forte. Un numéro non utilisé pendant la séance est prioritaire et les égalités favorisent le moins récent. En Mixte, des scores voisins favorisent le type le moins utilisé récemment. Sans candidat varié et compatible, le résultat est un repos passif.

Une unité déplacée reste `kind: program`. Un complément porte `kind: supplementary` et `supplementaryType: strength` ou `mobility`. Une Mobilité conserve nXX, durée, côté et contexte du repos sans valider une série officielle.
