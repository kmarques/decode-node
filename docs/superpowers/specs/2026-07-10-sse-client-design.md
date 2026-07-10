# Spec: Client JS Vanilla & SSE route subscribe

Création d'un client de démonstration en Javascript Vanilla à la racine du projet pour valider le fonctionnement de la route `/subscribe` (Server-Sent Events) de mise à jour des auteurs.

## 1. Fonctionnalités

### Formulaire de création d'utilisateurs
- Permet de créer un nouvel utilisateur en envoyant une requête POST à `http://localhost:3008/users`.
- Champs : Prénom (firstname), Nom (lastname), Date de naissance (birthDate), Email (email), Mot de passe (password).

### Formulaire de création d'articles
- Permet de créer un nouvel article lié à un utilisateur en envoyant une requête POST à `http://localhost:3008/articles`.
- Champs : Titre (title), Description (description), Auteur (userId - sélectionné dynamiquement via une liste déroulante alimentée par la liste des utilisateurs existants).

### Flux SSE en temps réel
- Connexion `EventSource` vers `http://localhost:3008/users/subscribe`.
- Affichage sous forme de grille de cartes de tous les auteurs (`Author` dans MongoDB).
- Mise à jour en temps réel des informations de l'auteur et de ses articles dès qu'une création ou modification survient.

---

## 2. Changements Proposés

### Backend

#### CORS (`backend/index.js`)
- Ajout du middleware `cors` pour autoriser l'accès depuis le client frontend (`file://` ou serveur de dev).

#### SSE Watcher (`backend/routes/users.js`)
- Décommenter `notifySubscribers(change)` pour diffuser les événements.
- Ajouter `{ fullDocument: 'updateLookup' }` sur `Author.watch` pour recevoir les données de l'auteur mis à jour.

#### Hooks de synchronisation Sequelize/MongoDB (`backend/models/article.js`)
- Corriger le bug du hook Sequelize où `instance.UserId` est utilisé à la place de `instance.userId`.

### Frontend

#### Client (`index.html`)
- Création d'un fichier `index.html` à la racine contenant :
  - Un style moderne et épuré (thème sombre, flexbox/grid layout, effets de transition).
  - Les deux formulaires (Utilisateurs et Articles).
  - Un conteneur d'affichage des auteurs.
  - La logique JS Vanilla avec `fetch` et `EventSource`.

---

## 3. Plan de Validation

### Tests Manuels
1. Démarrer les services backend via `docker compose`.
2. Ouvrir `index.html` dans le navigateur.
3. Créer un nouvel utilisateur -> Vérifier sa création.
4. Créer un article lié à cet utilisateur -> Vérifier que la liste d'auteurs en temps réel affiche le nouvel auteur avec son article.
