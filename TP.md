# TPs

## 📑 Table des matières

- [TP 1 — Web Scraping des codes HTTP en Node.js](#tp-1--web-scraping-des-codes-http-en-nodejs)
- [TP 2 : Routage & Paramétrage d'API avec Express.js](#tp-2--routage--paramétrage-dapi-avec-expressjs)
- [TP 3 : Relations entre entités & Conception d'une API RESTful](#tp-3--relations-entre-entités--conception-dune-api-restful)
- [TP 4 : Outil CLI & Automatisation avec le Pattern Command](#tp-4--outil-cli--automatisation-avec-le-pattern-command)

---

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

---

## TP 4 : Outil CLI & Automatisation avec le Pattern Command

### Contexte
Au fur et à mesure que l'application s'étoffe, la création manuelle des composants d'une ressource (modèle, contrôleur, routeur) devient répétitive, fastidieuse et source d'erreurs (oublis d'imports, fautes de frappe, boilerplate dupliqué).

Pour industrialiser le développement, vous allez concevoir une **interface en ligne de commande (CLI)** pour votre projet. Cet outil permettra aux développeurs d'automatiser la génération de code cohérent et de faciliter les opérations d'administration telles que la synchronisation de la base de données.

---

### Objectifs pédagogiques
- Concevoir un outil CLI modulaire et robuste en Node.js.
- Implémenter le **Design Pattern Command** pour garantir l'extensibilité du système (ajout aisé de nouvelles commandes sans modifier le cœur du CLI).
- Manipuler le système de fichiers (`fs` / `fs/promises`) pour générer du code à partir de templates.
- Mettre à jour programmatiquement un fichier existant (`server.js`) pour enregistrer automatiquement de nouvelles routes.
- Refactoriser un script procédural existant (`migrator.js`) en commande CLI structurée avec gestion avancée des options et drapeaux.

---

### 📦 Bibliothèques autorisées & vérification des dépendances

Pour la construction de votre CLI, vous êtes autorisés à vous appuyer sur des bibliothèques reconnues de l'écosystème Node.js :
- **`commander`** : gestion du parsing des arguments, options/flags, sous-commandes et génération automatique de l'aide (`--help`).
- **`inquirer`** *(ou `@inquirer/prompts`)* : pour enrichir l'expérience utilisateur avec des questions interactives dans le terminal si un argument est manquant.

---

### 🏛️ Contrainte architecturale obligatoire : le Design Pattern Command

Le CLI ne doit **pas** être un script monolithique contenant une longue chaîne de conditions `if/else` ou un volumineux `switch`. Vous devez impérativement appliquer le **Design Pattern Command** :
1. **Découplage** : Le point d'entrée principal de votre CLI (ex: `bin/cli.js` ou `cli.js`) doit uniquement être responsable d'initialiser le parseur, d'enregistrer les commandes et de déléguer leur exécution.
2. **Encapsulation** : Chaque commande doit être isolée dans son propre fichier/module (ex: dans un répertoire dédié `commands/`), respectant un contrat / une structure homogène (nom de la commande, description, déclaration des options/arguments et logique d'exécution).
3. **Principe Ouvert/Fermé (Open/Closed)** : L'ajout d'une future commande doit pouvoir se faire par la simple création d'un nouveau fichier de commande, avec un minimum voire aucune modification du point d'entrée.

---

### Spécifications fonctionnelles & Étapes de réalisation

#### Étape 1 : Générateur de CRUD (`make:crud`)

Vous devez implémenter une commande nommée `make:crud` permettant d'automatiser la création d'une nouvelle ressource complète dans le projet.

##### Déroulement & Détection du Modèle :
1. La commande prend en argument le **nom de l'entité** (ex: `Product`, `Category`, `Tag`). Si le nom n'est pas fourni lors de l'appel, demandez-le de manière interactive via `inquirer`.
2. **Vérification de l'existence du modèle :**
   - **Si le modèle existe déjà** dans `models/db/` : la commande s'appuie sur ce modèle pour générer le contrôleur et le routeur associés.
   - **Si le modèle n'existe pas** :
     - La commande doit le notifier clairement dans le terminal (ex: *"Le modèle n'existe pas, initialisation de sa création interactive..."*).
     - Déclencher un questionnaire interactif (`inquirer`) pour configurer le modèle :
       - **Attributs du modèle** : saisir interactivement une liste de champs (saisie en boucle jusqu'à validation) avec pour chaque champ :
         - Son nom.
         - Son type de données Sequelize (ex: `STRING`, `INTEGER`, `BOOLEAN`, `TEXT`, `DATE`, `UUID`...).
         - Ses contraintes de base (ex: `allowNull` : oui/non, valeur par défaut éventuelle).
       - **Relations / Associations** : proposer d'associer le nouveau modèle à un ou plusieurs modèles existants :
         - **Autocomplétion / sélection** interactive parmi les modèles déjà présents dans le projet (détectés dynamiquement dans `models/db/`).
         - Type de cardinalité (`belongsTo`, `hasMany`, `belongsToMany`).
         - Nom de l'**alias** (`as`).
         - **Clé étrangère (`foreignKey`)** : suggérer une valeur par défaut pré-définie/pré-formatée cohérente (ex: `<nom_entite>_id` ou `<nomEntite>Id`).
         - Comportement à la suppression (**`onDelete`** : `CASCADE`, `SET NULL`, `RESTRICT`...).

##### Génération des fichiers à partir de templates :
À partir de **fichiers templates** (que vous concevrez dans un dossier dédié, par exemple `templates/`) contenant des variables de substitution (ex: `{{Entity}}`, `{{entity}}`, `{{entities}}`) :
1. **Génération du modèle** : créer le fichier de modèle Sequelize dans `models/db/` avec ses attributs, et configurer les associations dans `models/db/index.js`.
2. **Génération du contrôleur** : créer le contrôleur dans `controllers/` avec le code de base pour les opérations CRUD standard (`cget`, `get`, `create`, `update`, `delete`).
3. **Génération du routeur** : créer le fichier de routes dans `routes/` reliant les méthodes HTTP aux actions correspondantes du contrôleur.
4. **Enregistrement automatique dans `server.js`** :
   - Le script doit lire programmatiquement le fichier `server.js` pour y injecter :
     - L'import du nouveau routeur généré.
     - L'enregistrement du routeur via `app.use(...)`.
   - L'insertion doit préserver l'intégrité du code existant dans `server.js`.

##### Sécurités & cas limites :
- Si un des fichiers cibles (contrôleur, routeur) existe déjà, refuser l'opération par défaut ou demander une confirmation explicite pour éviter tout écrasement accidentel.
- Si le routeur est déjà importé ou enregistré dans `server.js`, ne pas créer de doublons.
- Afficher un récapitulatif clair dans le terminal listant l'ensemble des fichiers créés et modifiés.

---

#### Étape 2 : Intégration de la migration (`migrator.js` ➔ commande CLI)

Le projet dispose actuellement d'un script `migrator.js` fonctionnant de manière procédurale en lisant directement `process.argv` (`(process.argv[2] ?? "--alter").slice(2)`).

##### Travail à réaliser :
- Convertir la logique de synchronisation de la base de données en une véritable commande du CLI (ex: `db:sync` ou `db:migrate`).
- Utiliser le système d'options formalisé de votre bibliothèque de CLI plutôt qu'un découpage brut de tableau d'arguments :
  - Déclarer une option ou un comportement par défaut pour la synchronisation avec `--alter` (mise à jour du schéma existant sans suppression).
  - Déclarer une option `--force` (recréation intégrale des tables).
- Gérer proprement le cycle de vie du processus Node.js :
  - Fermer proprement la connexion Sequelize à la fin du traitement.
  - En cas d'erreur : capturer l'exception, afficher un message d'erreur lisible et quitter avec un code de retour en échec (`process.exit(1)`).
- Adapter le script npm correspondant dans `package.json` pour appeler la commande via votre CLI.

---

### Critères d'évaluation
- [ ] Le CLI dispose d'un point d'entrée exécutable (déclaré dans les scripts de `package.json`).
- [ ] Le **Design Pattern Command** est respecté : chaque commande est isolée dans un module autonome.
- [ ] L'aide en ligne (`--help`) liste toutes les commandes disponibles, leurs descriptions et leurs options.
- [ ] La commande `make:crud` vérifie la présence du modèle et déclenche un prompt interactif complet s'il n'existe pas (saisie des attributs, types, `allowNull`).
- [ ] La configuration interactive des relations propose une autocomplétion / liste des modèles existants avec pré-remplissage des alias, `foreignKey` et options `onDelete`.
- [ ] La commande `make:crud` génère des fichiers cohérents et syntaxiquement valides (modèle, contrôleur, routeur).
- [ ] Le fichier `server.js` est automatiquement et proprement mis à jour sans duplication ni régression.
- [ ] Les écrasements accidentels de fichiers existants sont interceptés.
- [ ] L'ancien script `migrator.js` est refactorisé en commande CLI s'appuyant sur les options déclarées (`--alter`, `--force`).