# Muscu V2

PWA mobile-first de micro-séances au poids du corps. Elle fonctionne sans compte, sans backend, sans abonnement et sans dépendance distante à l’exécution. Toutes les données restent dans le navigateur.

## Lancer sur PC

Double-cliquer sur `Demarrer.cmd`. Le script lance l’application sur `http://localhost:4173`.

Prérequis : Node.js 20 ou une installation Codex fournissant son environnement Node. Aucun `npm install` n’est nécessaire.

Alternative :

```text
node server.mjs
```

## Installer sur iPhone

1. Publier le dossier `dist/` sur GitHub Pages.
2. Ouvrir l’adresse dans Safari une première fois avec une connexion.
3. Toucher Partager → Sur l’écran d’accueil.
4. L’application devient disponible hors ligne après sa première installation.

## Publier gratuitement sur GitHub Pages

Le workflow `.github/workflows/pages.yml` publie `dist/` automatiquement.

1. Créer un dépôt GitHub et y déposer le projet complet.
2. Envoyer la branche principale sur GitHub.
3. Dans Settings → Pages, choisir **GitHub Actions**.
4. Attendre la fin du workflow Pages puis ouvrir l’adresse indiquée.

Les chemins sont relatifs : l’application fonctionne aussi sous un sous-dossier de type `utilisateur.github.io/depot/`.

## Utilisation

- **Programme** affiche le prochain bloc et des contrôles `− / +` par exercice.
- **Progression** permet de gérer les paliers et, pour les grandes lignes, Force / Endurance / Puissance séparément.
- Une fiche exercice s’ouvre uniquement sur action de l’utilisateur et rassemble les informations textuelles de la variante : position, exécution, erreurs à éviter et critère d’arrêt.
- Pendant une séance, `− Palier +` reste disponible. Les séries validées ne sont jamais réécrites ; seules les séries restantes sont recomposées.
- **Historique** propose Vue d’ensemble, Exercices et Séances avec des périodes Aujourd’hui, 7 jours, 30 jours et Tout. Les statistiques utilisent uniquement les résultats réellement enregistrés.
- Les changements de phase et de mode restent des suggestions confirmées manuellement.

## Profils Principal et Test

Dans Paramètres → Profil actif :

- **Principal** contient la vraie progression.
- **Test** utilise un espace séparé et affiche toujours un badge `TEST`.
- Principal et Test restent toujours visibles dans le sélecteur. Au premier choix de Test, il peut être créé vierge ou comme copie instantanée de Principal.
- Les actions Réinitialiser Test et Recréer depuis Principal sont séparées du sélecteur.
- Réinitialiser Test ne touche jamais Principal.

Une séance Principal en pause reste dans Principal lors d’un passage sur Test.

## Sauvegarde, import et reset

- **Exporter le profil actif** produit un JSON restaurable.
- **Exporter toutes les données** inclut Principal, Test et la sauvegarde avant reset.
- **Importer** vérifie la structure et migre les anciennes données avant de demander confirmation. Un fichier invalide n’écrase rien.
- Le premier reset Principal crée automatiquement une **Sauvegarde avant reset**.
- S’il existe déjà une sauvegarde, l’application demande explicitement de la remplacer, la garder ou la supprimer.
- Cette sauvegarde peut être restaurée, exportée ou supprimée depuis Paramètres.

Conserver aussi les exports hors du navigateur : effacer les données du site supprime le stockage local.

## Tests

```text
node --test tests/*.test.mjs
```

Les tests couvrent les migrations, profils, resets, imports, changements de palier en séance, modes, phases, douleur, alternances, fiches textuelles et fonctions hors ligne.

## Structure principale

- `dist/program.js` : programme data-driven, phases, variantes et modes.
- `dist/technique.js` : consignes canoniques par variante et validation du catalogue.
- `dist/engine.js` : séances, recommandations, déblocages et recomposition active.
- `dist/storage.js` : profils, migrations, import/export et sauvegarde avant reset.
- `dist/stats.js` : agrégations fiables de l’historique par période et exercice.
- `dist/app.js` : interface PWA.
- `MIGRATIONS.md` : règles de versionnement des données.
- `TECHNIQUE.md` : séparation Variante / Palier / Mode et ajout sûr d’une variante.

## Limites volontaires

Cette version utilise volontairement des fiches d’exercices entièrement textuelles. Il n’y a ni backend, compte, synchronisation, service payant, nutrition, Apple Health ni notifications système complexes.
