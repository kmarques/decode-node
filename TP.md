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
- **Pagination :** `page` (défaut: 1) et `limit` (défaut: 10).
  - La réponse doit inclure les métadonnées (`page`, `limit`, `total`, `totalPages`) et le tableau `data`.

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