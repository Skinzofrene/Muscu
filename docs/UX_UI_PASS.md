# Passe UX/UI — Muscu V6.2 UX Polished

## Périmètre

Cette passe est strictement visuelle et ergonomique. Le programme, le moteur, le planificateur, les objectifs, le stockage, le catalogue technique et le catalogue visuel ne changent pas. Les 159 variantes et les 95 fichiers visuels restent disponibles localement et hors ligne.

## Changements principaux

- Programme recentré sur le bloc sélectionné, avec cycle directement navigable et actions secondaires regroupées.
- Mode d’exécution remplacé par un contrôle Muscu ouvrant une feuille de choix ; aucun `select` natif ne reste.
- Contrôle de palier commun sur Programme, Séance, Progression et fiches : boutons − / +, indicateur `P1/8` ou `N1/5`, prescription sur une ligne dédiée.
- Séance : hiérarchie simplifiée, prochaine série ouvrable, récupération reformulée, feedback plus explicite et cible chronométrée remplacée par le chrono central une fois démarré.
- Fiches exercice : en-tête lisible, visuel conservé, repère séance mis en avant, sections repliables Position, Exécution, Amplitude/respiration/tempo et Muscles sollicités.
- Progression : cartes synthétiques, sans duplication de la technique canonique ; dernière tendance condensée en une ligne.
- Historique : unités de temps explicites (`s`, `min`) et hiérarchie conservée entre vue d’ensemble, exercices et séances.
- Paramètres : vraies sections repliables, contrôles segmentés, switches Muscu et confirmations explicites avant les actions destructrices.
- Souplesse : catalogue n1→n35, routines, pages sources et historique conservés ; les composants de panneau et de feedback restent communs.

## Toasts et confirmations

La version de départ contenait 29 occurrences d’appel/définition de toast. La version polie en contient 10 : la définition, les erreurs d’enregistrement/import, les conflits inter-fenêtres et les actions devenues impossibles. Dix-neuf confirmations passives ont été supprimées.

Après une action réussie, l’état visible de l’écran constitue la confirmation. Les actions destructrices passent par une modale Muscu avec résumé de l’effet, Annuler et action explicite.

## Contrôles natifs remplacés

- 7 `select` natifs remplacés : mode d’exécution, réglages des modes optimisés, volume et objectifs/personnalisation.
- 7 checkboxes natives remplacées dans les réglages principaux ; les listes détaillées d’activités utilisent le même switch partagé.
- Les boutons radio de ressenti restent visuellement transformés en cartes accessibles, car ils représentent un choix de formulaire et non un réglage binaire.

## Validation

- Référence avant passe : 237/237 tests.
- Tests UX ciblés : 9/9.
- Suite complète finale : 243/243.
- Formats inspectés dans le navigateur : 390×844 et 1280×900.
- Largeur desktop : 1280 px de viewport, 1280 px de document, application centrée à 720 px — aucun débordement horizontal.
- Parcours vérifiés : Programme, mode d’exécution, démarrage de séance, récupération, exercice chronométré, fiche exercice, Progression, Historique, Souplesse et Paramètres.
- Console navigateur : aucune erreur ni alerte.
- Hors ligne : service worker prêt dans l’interface ; cache renommé `v6-2-ux-polished` et shell mis à jour vers les ressources `6.2.3`.

## Accessibilité

- Cibles principales d’au moins 44 px.
- Focus visible conservé.
- Contrôles binaires exposés avec `role="switch"` et `aria-checked`.
- Contrôles segmentés groupés et libellés.
- Feuilles modales avec rôle dialog, fermeture clavier Échap et restauration du focus.
- Texte système agrandi autorisé à se réorganiser sans masquer les actions.
