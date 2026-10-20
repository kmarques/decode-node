# TPs

## TP 1 — Web Scraping des codes HTTP en Node.js

### 🎯 Objectif

L'objectif de ce TP est de concevoir un script Node.js autonome permettant d'extraire la liste des codes de statut HTTP et leur description depuis la page Wikipédia :
👉 [https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP](https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP)

Le résultat final devra être exporté sous la forme d'un fichier JSON structuré comme suit :
```json
{
  "200": "OK",
  "404": "Not Found",
  "...": "..."
}
```

---

### ⚠️ Contraintes techniques

- **Pas de bibliothèque tierce pour la requête réseau** : vous **devez** utiliser exclusivement le module natif `node:https` et en particulier la fonction `https.request()`. L'utilisation de `fetch`, `axios` ou équivalent est interdite pour cette partie.
- **Node.js LTS** recommandé.
- **Installation autorisée** : le paquet `jsdom` pour la manipulation du DOM HTML.

---

### 📋 Déroulement du TP

#### Étape 1 : Récupérer le contenu HTML (`node:https`)

Le module `node:https` de Node.js est bas niveau et fonctionne avec des flux (*streams*).

###### Indications & Pistes :
1. **La fonction `https.request(options, callback)`** :
   - Prenez connaissance des paramètres acceptés : vous pouvez lui passer une URL sous forme de chaîne ou d'objet `URL`, ainsi qu'un objet de configuration (méthode HTTP, headers).
   - *Indice headers* : Wikipédia bloque ou limite parfois les requêtes sans `User-Agent`. Pensez à renseigner un en-tête `User-Agent` représentatif.

2. **Gestion des erreurs et finalisation** :
   - N'oubliez pas d'écouter l'événement `'error'` sur l'objet requête.
   - Une requête initiée par `https.request()` **doit obligatoirement être finalisée** (cherchez quelle méthode de la requête déclenche réellement son envoi).
3. **Conseil bonus** :
   - Pour simplifier la suite, encapsulez cet appel dans une fonction retournant une `Promise<string>` résolue avec le HTML complet.

---

#### Étape 2 : Analyser le DOM avec `jsdom`

Une fois le code source HTML récupéré sous forme de chaîne, vous devez extraire les couples `code` ➔ `message/description`.

###### Indications & Pistes :
1. **Installation** :
   ```bash
   npm install jsdom
   ```
2. **Initialisation** :
   - Importez la classe `JSDOM` depuis le module `jsdom`.
   - Instanciez-la avec votre chaîne HTML (`new JSDOM(html)`).
   - Vous avez alors accès à l'équivalent de l'API DOM du navigateur via `dom.window.document`.
3. **Repérage des sélecteurs CSS sur Wikipédia** :
   - Ouvrez la page [Wikipédia des codes HTTP](https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP) dans votre navigateur et inspectez les éléments contenant les codes (clic droit ➔ *Inspecter*).
   - Observez comment sont structurées les sections : s'agit-il de balises `<dt>` et `<dd>`, de titres `<h3>` / `<h4>` avec des listes `<ul>`, ou de tableaux `<table>` ?
   - Utilisez `document.querySelectorAll(...)` pour cibler ces éléments.
4. **Nettoyage et extraction** :
   - Le texte brut extrait peut contenir des espaces superflus, des retours à la ligne ou des références Wikipédia (ex: `[1]`).
   - Pensez à utiliser `.trim()` et éventuellement une expression régulière (`RegExp`) pour extraire distinctement :
     - Le code numérique (ex: `200`, `404`)
     - Le libellé ou texte descriptif associé.

---

#### Étape 3 : Structurer et persister les données en JSON

###### Indications & Pistes :
1. **Format des données** :
   - Construisez un objet JavaScript où chaque clé est le code HTTP (ex: `"200"`) et la valeur est la description textuelle nettoyée.
2. **Écriture sur disque** :
   - Utilisez le module natif `node:fs` ou `node:fs/promises` (`writeFile`).
   - Convertissez votre objet en JSON formaté à l'aide de `JSON.stringify(..., null, 2)` pour garantir une bonne lisibilité du fichier généré.
   - Enregistrez le fichier sous le nom `codes_http.json`.

---

### 🔍 Critères de validation

- [ ] La requête est effectuée avec `https.request()` sans dépendance externe de transport.
- [ ] La page HTML est correctement récupérée dans son intégralité (vérifier la taille ou la présence de la balise fermante `</html>`).
- [ ] `jsdom` parcourt et extrait au moins les codes standards principaux (1xx, 2xx, 3xx, 4xx, 5xx).
- [ ] Le fichier `codes_http.json` est valide, bien indenté et exploitable directement par une autre application.

## TP 2 : Routage & Paramétrage d'API avec Express.js

### Contexte
Vous développez l'API backend d'une plateforme de streaming vidéo (**CinéPulse**). L'objectif est de concevoir un système de routage robuste permettant de consulter, filtrer et gérer le catalogue de films ainsi que les avis des utilisateurs.

### Objectifs pédagogiques
- Maîtriser l'extraction et la conversion des **Route Parameters** (`req.params`).
- Exploiter les **Query Parameters** (`req.query`) pour le filtrage, la recherche et la pagination.
- Gérer les contraintes de format et les codes d'erreur HTTP (`200`, `404`, `422`).

### Données de départ
Initialisez une application Express avec un tableau de films et un tableau d'avis stockés en mémoire (ex. `id`, `title`, `director`, `year`, `genre`, `rating`, `isAvailable`).

### Spécifications fonctionnelles

#### 1. Paramètres de chemin (`req.params`)
- **Détail d'un film :** `GET /api/movies/:id`
  - Extraire et convertir l'identifiant numérique.
  - Renvoyer le film correspondant (`200`) ou une erreur `404` si introuvable.
- **Ressources imbriquées :** `GET /api/movies/:movieId/reviews/:reviewId`
  - Récupérer les deux paramètres de chemin.
  - Vérifier que le film existe et que l'avis est bien rattaché à ce film.

#### 2. Paramètres de requête (`req.query`)
Implémenter la route `GET /api/movies` supportant les critères optionnels et cumulables suivants :
- **Filtrage :** `genre` (insensible à la casse), `minRating` (note minimale), `available` (booléen).
- **Recherche textuelle :** `search` (recherche partielle sur le titre ou le réalisateur).
- **Tri :** `sort` (ex: `year` pour croissant, `-year` pour décroissant).
- **Pagination :** `page` (défaut: 1) et `itemsPerPage` (défaut: 10).
  - La réponse doit inclure les métadonnées (`page`, `itemsPerPage`, `total`, `totalPages`) et le tableau `data`.

#### 3. Validation & Codes d'erreur
- **Contrôle des identifiants :**
  - Si un paramètre d'ID n'est pas un entier valide (ex: `/api/movies/abc`), renvoyer immédiatement une erreur `422 Unprocessable Entity`.
- **Route avec contrainte de format :** `GET /api/movies/release-year/:year`
  - Vérifier que `:year` est une année valide à 4 chiffres comprise entre 1900 et l'année actuelle (renvoyer `422` sinon).

### Synthèse des endpoints à implémenter

| Méthode | Route | Type de paramètre | Rôle |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Query (`genre`, `search`, `minRating`, `sort`, `page`, `limit`) | Catalogue filtré et paginé |
| `GET` | `/api/movies/:id` | Path (`:id`) | Détail d'un film |
| `GET` | `/api/movies/release-year/:year` | Path (`:year` sur 4 chiffres) | Films sortis une année précise |
| `GET` | `/api/movies/:movieId/reviews/:reviewId` | Path (`:movieId`, `:reviewId`) | Avis spécifique d'un film |

### Critères d'évaluation
- Respect des signatures d'URL et des conventions REST.
- Typage et validation stricte des paramètres (gestion des `NaN`, types numériques).
- Utilisation appropriée des codes de statut HTTP (`200`, `404`, `422`).

---

## TP 3 : Relations entre entités & Conception d'une API RESTful

### Contexte
Votre application de gestion de contenu éditorial continue d'évoluer. Jusqu'à présent, les articles et les utilisateurs étaient gérés de manière totalement indépendante. 

Vous devez à présent concevoir et implémenter les relations entre vos entités, puis définir et exposer les fonctionnalités correspondantes au travers d'une API **strictement conforme aux standards RESTful**.

> ⚠️ **Consigne importante de conception :**  
> Aucun chemin d'URL ne vous est imposé. **C'est à vous de concevoir l'arborescence des routes, le nommage des endpoints, le choix des verbes HTTP et la hiérarchie des ressources/sous-ressources**, en appliquant avec rigueur les principes de l'architecture REST.

---

### Objectifs pédagogiques
- **Modélisation relationnelle** :
  - **1:N (One-to-Many)** : Auteur d'un article (`author_id`).
  - **N:N (Many-to-Many)** : Tags associés aux articles (avec table de liaison).
  - **1:N (Sous-ressource dépendante)** : Commentaires rattachés aux articles et aux utilisateurs.
- **Design d'API RESTful** :
  - Déterminer la structure des URIs (ressources racine vs sous-ressources imbriquées).
  - Choisir les verbes HTTP appropriés selon l'opération et son idempotence.
  - Sélectionner et retourner les codes de statut HTTP exacts selon le scénario (création, suppression, erreurs de validation, conflits, introuvable, non authentifié).
  - Garantir l'intégrité référentielle et la gestion propre des erreurs.

---

### 🔐 Simulation de l'utilisateur connecté (`X-USER-ID`)

En l'absence d'un système d'authentification complet (tokens JWT, sessions), l'identité de l'utilisateur connecté est simulée via un en-tête HTTP personnalisé :
- **En-tête attendu :** `X-USER-ID` (qui contiendra l'identifiant de l'utilisateur effectuant la requête).
- **Règles de prise en compte :**
  - Pour toute action nécessitant un auteur (création d'un article, ajout d'un commentaire, etc.), **l'auteur ne doit pas être fourni arbitrairement dans le corps de la requête**, mais impérativement déduit de la valeur de l'en-tête `X-USER-ID`.
  - Si l'en-tête `X-USER-ID` est absent lors d'une opération requérant un utilisateur connecté, la requête doit être immédiatement rejetée avec le code `401 Unauthorized`.
  - Si l'identifiant passé dans `X-USER-ID` ne correspond à aucun utilisateur existant en base de données, la requête doit également être rejetée (`401 Unauthorized`).

---

### Spécifications fonctionnelles

#### 1. Relation Utilisateur ↔ Article (1:N)

##### Modélisation :
- Un article doit posséder un auteur unique, identifié par la clé étrangère `author_id` liant la table des articles à celle des utilisateurs.
- Configurer les associations bidirectionnelles correspondantes sur vos modèles.

##### Fonctionnalités attendues :
- **Création d'un article avec auteur** :
  - L'auteur de l'article doit être déduit du header `X-USER-ID`.
  - Si le header est manquant ou que l'utilisateur n'existe pas en base, renvoyer l'erreur d'authentification appropriée.
- **Consultation d'un article** :
  - Permettre de récupérer un article en intégrant les données de son auteur.
- **Articles d'un auteur** :
  - Permettre de lister tous les articles rédigés par un utilisateur spécifique.
  - Gérer le cas où l'utilisateur ciblé n'existe pas.

---

#### 2. Relation Articles ↔ Tags (Many-to-Many)

##### Modélisation :
- Créer une entité **Tag** (avec au minimum un identifiant et un libellé textuel unique).
- Créer la table de jointure permettant d'associer plusieurs tags à un même article, et plusieurs articles à un même tag.
- Configurer l'association Many-to-Many sur vos modèles.

##### Fonctionnalités attendues :
- **Gestion du catalogue de tags** :
  - Lister tous les tags existants.
  - Créer un nouveau tag (deux tags ne peuvent pas avoir le même libellé : prévoir la gestion du doublon avec le code HTTP adapté).
  - Supprimer un tag.
- **Liaison entre articles et tags** :
  - Lister l'ensemble des tags rattachés à un article spécifique.
  - Associer un ou plusieurs tags existants à un article.
  - Détacher (dissocier) un tag d'un article, sans supprimer le tag de la base de données.
  - S'assurer que les entités ciblées existent avant d'effectuer l'association ou la dissociation.

---

#### 3. Système de Commentaires (Ressource dépendante)

##### Modélisation :
- Créer une entité **Comment** (avec au minimum un identifiant, un contenu textuel, un horodatage et les liaisons vers l'article et vers l'auteur du commentaire).
- Un commentaire ne peut exister sans article de rattachement.

##### Fonctionnalités attendues :
- **Consultation des commentaires** :
  - Récupérer la liste des commentaires liés à un article donné (avec les informations de leurs auteurs respectifs).
  - Consulter un commentaire précis via son identifiant.
- **Ajout d'un commentaire** :
  - Ajouter un commentaire sous un article spécifique.
  - L'auteur du commentaire doit être déduit du header `X-USER-ID`.
  - Valider la présence du contenu, l'existence de l'article ciblé et la validité de l'utilisateur connecté.
- **Mise à jour et suppression** :
  - Mettre à jour partiellement le contenu d'un commentaire existant.
  - Supprimer un commentaire.

---

### Exigences & Règles RESTful obligatoires

Votre API sera évaluée sur sa stricte conformité aux conventions REST :

1. **Nommage des endpoints** :
   - Les URIs doivent employer exclusivement des **noms (substantifs) au pluriel** pour désigner les collections.
   - **Aucun verbe d'action** dans les URLs (interdiction de chemins comme `/create`, `/delete`, `/getArticles`, `/addTag`, etc.).
   - Utiliser la hiérarchie parent / enfant (ressource / sous-ressource) pour exprimer une dépendance forte ou une relation directe entre deux entités.

2. **Utilisation sémantique des méthodes HTTP** :
   - `GET` : Lecture seule, sans altération de l'état du serveur.
   - `POST` : Création d'une nouvelle ressource ou établissement d'une relation.
   - `PATCH` : Mise à jour partielle d'une ressource existante.
   - `DELETE` : Suppression d'une ressource ou dissociation d'une relation.

3. **Codes de statut HTTP normalisés** :
   - `200 OK` : Succès d'une requête de lecture ou de mise à jour avec retour de contenu.
   - `201 Created` : Succès d'une création (avec retour de la ressource créée).
   - `204 No Content` : Succès d'une opération sans corps de réponse (ex: suppression, dissociation).
   - `400 Bad Request` ou `422 Unprocessable Entity` : Données invalides, champs manquants ou non conformes aux règles de validation.
   - `401 Unauthorized` : Header de simulation d'authentification (`X-USER-ID`) absent ou utilisateur inconnu.
   - `404 Not Found` : Ressource ciblée introuvable (y compris lorsqu'une ressource parente dans une URI imbriquée n'existe pas).
   - `409 Conflict` : Violation d'une contrainte d'unicité (ex: tentative de doublon).

4. **Format des données** :
   - Corps des requêtes et des réponses formatés en JSON (`Content-Type: application/json`).

---

### Critères d'évaluation
- [ ] Modélisation correcte des relations (1:N, N:N avec table pivot, sous-ressources).
- [ ] Conception de l'arborescence des routes 100% conforme aux conventions REST (pluriel, sous-ressources imbriquées, absence de verbes).
- [ ] Extraction correcte de l'utilisateur connecté via l'en-tête `X-USER-ID` et contrôle d'accès (`401 Unauthorized` si absent/invalide).
- [ ] Utilisation rigoureuse des verbes HTTP et des codes de statut HTTP correspondants.
- [ ] Contrôle strict de l'intégrité des données et gestion propre de toutes les erreurs (aucune erreur `500` provoquée par un identifiant inconnu ou une payload invalide).