# TPs

## Tp1

Modifier le scrapper pour intégrer le scrapping HTML (production d'un DOM - jsdom -) et en extraire des données. On se basera sur l'url https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP.
Ressortir un CSV avec les colonnes : Code, Nom, Description.

## Tp2

Gestion de liste de tâches gérée par équipe.
On doit pouvoir créer une liste de tâches, y associer des utilisateurs, et y assigner des tâches.
chaque tâche doit avoir une date limite, et doit pouvoir être marquée comme terminée ou non.
Un utilisateur peut appartenir à plusieurs listes de tâches et inversement.
Un utilisateur doit pouvoir s'assigner à une tâche.

Un utilisateur peut avoir un rôle par liste de tâches (owner, editor, viewer).
- Un owner peut ajouter, modifier, supprimer des utilisateurs de ses listes.
- Un editor peut ajouter, modifier, supprimer des tâches de ses listes.
- Un viewer ne peut que s'assigner à une tâche et la marquer comme terminée ou non.

Pour gérer l'authentification, ajouter le userId à chaque action via un header X-UserId.