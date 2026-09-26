# Muscu V6.2 — audit technique complet

Cette livraison ajoute un référentiel technique structuré pour les 24 mouvements de base, classe les 159 variantes techniques distinctes et corrige les héritages incohérents sans changer les prescriptions sportives. Les rapports sont disponibles dans `docs/TECHNICAL_AUDIT.md`, `docs/VARIANT_AUDIT.md`, `docs/PROGRAM_AUDIT.md`, `docs/DECISIONS_REQUIRED.md` et `docs/FINAL_REPORT.md`.

V6.2 conserve le socle sportif de V6.1 et clarifie les parcours de séance : fiches d’exercice et retours s’ouvrent dans des panneaux flottants, la pause propose explicitement **Pause** ou **Arrêter le bloc**, le bloc précédent peut être consulté sans modifier le programme et **Passer le bloc** agit directement, y compris pendant une séance. Pour **Fessiers → Hypertrophie**, le travail unilatéral remplace désormais le Split Force dans le bloc B ; le bloc E reste consacré à l’extension de hanche et à l’abduction. Le réglage par défaut entièrement Force reste inchangé. Voir [docs/OBJECTIVES.md](docs/OBJECTIVES.md).

PWA mobile-first locale pour le programme de musculation et la souplesse. Elle fonctionne sans compte, backend, abonnement ni dépendance distante à l’exécution. Toutes les données restent dans le navigateur.

## Lancer sur PC

Double-cliquer sur `Demarrer.cmd`, puis ouvrir `http://localhost:4173`. Cette origine reste stable afin que les données locales soient retrouvées à chaque lancement. Si le port est déjà utilisé par cette même V6.2, le lanceur réutilise l’adresse ; s’il appartient à une autre application ou à une ancienne version, le démarrage s’arrête avec un message explicite au lieu de changer silencieusement de port.

Prérequis : Node.js 20. Aucun `npm install` n’est nécessaire. Alternative : `node server.mjs`.

## Navigation

- **Programme** conserve le cycle musculaire, les paliers et les modes Qualité, Express, Densité et Hybride.
- **Souplesse** propose les routines Complète, Complète courte, Haut du corps, Hanches & jambes, Récupération légère et Explorer.
- **Progression** gère les paliers et les modes sportifs Force, Endurance et Puissance.
- **Historique** propose Tout, Musculation et Souplesse, puis Vue d’ensemble, Exercices et Séances, avec Aujourd’hui, 7 jours, 30 jours et Tout.

Souplesse utilise exactement les exercices `n1` à `n35`. Les 10 pages de référence sont stockées localement, associées au bon numéro et mises en cache hors ligne. Une miniature ouvre un viewer interne plein écran zoomable sans arrêter le chrono. Le retour à la position ou au côté précédent permet de corriger une validation sans créer de doublon.

Une routine Souplesse ne complète aucun bloc, ne change aucun palier et n’avance jamais le cycle musculaire. Il n’existe ni niveau ni progression Souplesse.

## Scheduler

- **Express** peut déplacer une série officielle compatible du cycle courant.
- **Densité** peut proposer du Renforcement léger, de la Mobilité ou un choix Mixte pendant le repos.
- **Hybride** privilégie une série officielle compatible, puis utilise le type complémentaire choisi.

La protection prospective contrôle l’exercice en récupération, la prochaine unité et la deuxième unité. La Mobilité automatique utilise seulement les pools nXX documentés, évite les quatre derniers numéros proposés, pénalise les zones récentes et préfère le repos passif lorsqu’aucun choix suffisamment varié n’est sûr.

Le bouton visible **Passer le bloc** permet de passer directement le bloc courant, avant ou pendant une séance. Les unités restantes deviennent `skipped`, disparaissent d’Express et d’Hybride et ne créent ni volume, ni progression, ni consommation de rotation. Un passage vierge ne crée pas d’historique ; après des séries validées, l’historique interrompu conserve uniquement les résultats réels. Tant que le cycle n’a pas avancé, **Réouvrir le bloc** restaure exactement les mêmes IDs en `pending`.

## Profils, sauvegardes et migration

Principal et Test restent isolés. Import, export et sauvegarde avant reset sont conservés. Le schéma courant est 7 ; les formats V1 à V6 migrent vers ce schéma. Une migration V6 conserve les niveaux H réellement utilisés et peut initialiser Bridge, GluteSplit et Abductor depuis la variante Force lorsque H n’a encore jamais été validé. Les anciennes données Souplesse V4 sans correspondance fiable restent `legacy`.

## PWA et tests

Publier `dist/` sur un hébergement statique HTTPS pour l’installation iPhone. Le cache hors ligne est relatif au sous-chemin et inclut les 10 pages WebP.

```text
node --test tests/*.test.mjs
```

Résultat avant modification de la V6 canonique : **152 tests réussis, 0 échec**.

Résultat avant l’audit technique : **201 tests réussis, 0 échec**.

Résultat final après fermeture des décisions D01→D12 : **222 tests réussis, 0 échec**.

Fichiers principaux : `dist/technical-catalog.js`, `dist/objectives.js`, `dist/objective-planner.js`, `dist/program.js`, `dist/technique.js`, `dist/scheduler.js`, `dist/engine.js`, `dist/storage.js`, `dist/app.js` et `dist/sw.js`.

## Limites volontaires

Les pages entières de référence sont les seuls médias Souplesse : aucune illustration IA, image individuelle d’exercice ou animation. Il n’y a ni backend, compte, synchronisation, nutrition, Apple Health ni alarme système en arrière-plan. iOS peut suspendre une PWA verrouillée ; les timestamps restent cohérents au retour au premier plan.
