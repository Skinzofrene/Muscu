# Composants UI partagés

## Tier control

`tier-control` affiche une seule représentation du palier ou du niveau : diminution, `P1/8` ou `N1/5`, augmentation, puis prescription. Il est utilisé dans Programme, Séance, Progression et la fiche exercice.

## Segmented control

`segmented` / `segment` remplace les listes natives quand deux ou trois choix courts sont disponibles : Force/Hypertrophie, intensité, budget et volume.

## Switch

`switch-control` remplace les checkboxes de réglage. Son état visuel correspond toujours à `aria-checked` et la zone cliquable reste portée par le bouton complet.

## Floating sheet

`floating-panel` sert aux choix de mode, confirmations, feedback, personnalisation et fiches exercice. Son bouton de fermeture est fixe, le contenu est défilable et le focus revient au déclencheur à la fermeture.

## Settings accordion

`settings-group` s’appuie sur `details/summary` pour offrir un comportement clavier natif et une lecture progressive des paramètres.

