# Rapport de livraison — Muscu V2.1

## Bugs corrigés

- Contrôles `− / palier / +` cohérents et fonctionnels sur Programme, fiche et séance.
- En séance, les séries validées restent inchangées ; le nouveau palier recompose uniquement la suite.
- La fiche se rafraîchit immédiatement après un changement de palier.
- Les consignes de séance sont désormais dérivées de l’exercice, de la variante et du mode courants.
- Le profil Test reste sélectionnable sans transformer le sélecteur en action de reset.

## Changements UX

- Onglet principal renommé **Programme** et écran recentré sur **Prochain bloc**.
- Nom « Muscu » retiré du header, icône conservée.
- Phase/cycle déplacés en information secondaire.
- Sélecteur Principal/Test permanent, création guidée, actions Test séparées.
- Contrôle unique `Correct ▾` pour ressenti, résultat réel et note.
- Textes décoratifs et explications redondantes retirés.

## Historique et statistiques

- Trois vues : **Vue d’ensemble**, **Exercices**, **Séances**.
- Périodes : Aujourd’hui, 7 jours, 30 jours et Tout.
- Agrégations fondées uniquement sur les valeurs réellement enregistrées.
- Répétitions, temps chronométré, passages, séries, cycles et blocs terminés.
- Moyennes par passage, jour de période et jour actif nommées séparément.
- Détail unilatéral par côté lorsqu’il est disponible et historique des paliers.

## Validation

- **39 tests automatisés réussis, 0 échec**, après la suppression ciblée des médias.
- Parcours vérifiés dans un navigateur réel sur mobile 390 × 844 et bureau 1280 × 800.
- Aucune erreur ni alerte navigateur observée.

## Consignes canoniques

- **146 variantes** validées avec position, exécution, erreur principale, arrêt, type et compatibilité de mode.
- Séparation stricte Variante / Palier / Mode documentée dans `TECHNIQUE.md`.
- Suspension, planches, Hollow, scapulaire, tibial et correctifs ne reçoivent plus de texte Force dynamique.
- Les variantes historiques au nom peu précis ont conservé leurs identifiants et le programme existant. Elles héritent d’une base technique sûre sans ajout sportif inventé.

## Simplification finale des fiches

- Les fiches sont désormais exclusivement textuelles.
- L’affichage, les placeholders, le lecteur, le manifeste et les exemples d’animations ont été retirés.
- Les icônes PWA restent présentes : elles servent uniquement à l’installation de l’application.

Le dernier contrôle PWA hors ligne sur un iPhone réel reste à effectuer après publication.

Le projet reste sans framework, sans backend et sans dépendance distante. `Demarrer.cmd` demeure le lancement PC principal.
