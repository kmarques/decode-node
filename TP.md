# TP 1 — Web Scraping des codes HTTP en Node.js

## 🎯 Objectif

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

## ⚠️ Contraintes techniques

- **Pas de bibliothèque tierce pour la requête réseau** : vous **devez** utiliser exclusivement le module natif `node:https` et en particulier la fonction `https.request()`. L'utilisation de `fetch`, `axios` ou équivalent est interdite pour cette partie.
- **Node.js LTS** recommandé.
- **Installation autorisée** : le paquet `jsdom` pour la manipulation du DOM HTML.

---

## 📋 Déroulement du TP

### Étape 1 : Récupérer le contenu HTML (`node:https`)

Le module `node:https` de Node.js est bas niveau et fonctionne avec des flux (*streams*).

#### Indications & Pistes :
1. **La fonction `https.request(options, callback)`** :
   - Prenez connaissance des paramètres acceptés : vous pouvez lui passer une URL sous forme de chaîne ou d'objet `URL`, ainsi qu'un objet de configuration (méthode HTTP, headers).
   - *Indice headers* : Wikipédia bloque ou limite parfois les requêtes sans `User-Agent`. Pensez à renseigner un en-tête `User-Agent` représentatif.

2. **Gestion des erreurs et finalisation** :
   - N'oubliez pas d'écouter l'événement `'error'` sur l'objet requête.
   - Une requête initiée par `https.request()` **doit obligatoirement être finalisée** (cherchez quelle méthode de la requête déclenche réellement son envoi).
3. **Conseil bonus** :
   - Pour simplifier la suite, encapsulez cet appel dans une fonction retournant une `Promise<string>` résolue avec le HTML complet.

---

### Étape 2 : Analyser le DOM avec `jsdom`

Une fois le code source HTML récupéré sous forme de chaîne, vous devez extraire les couples `code` ➔ `message/description`.

#### Indications & Pistes :
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

### Étape 3 : Structurer et persister les données en JSON

#### Indications & Pistes :
1. **Format des données** :
   - Construisez un objet JavaScript où chaque clé est le code HTTP (ex: `"200"`) et la valeur est la description textuelle nettoyée.
2. **Écriture sur disque** :
   - Utilisez le module natif `node:fs` ou `node:fs/promises` (`writeFile`).
   - Convertissez votre objet en JSON formaté à l'aide de `JSON.stringify(..., null, 2)` pour garantir une bonne lisibilité du fichier généré.
   - Enregistrez le fichier sous le nom `codes_http.json`.

---

## 🔍 Critères de validation

- [ ] La requête est effectuée avec `https.request()` sans dépendance externe de transport.
- [ ] La page HTML est correctement récupérée dans son intégralité (vérifier la taille ou la présence de la balise fermante `</html>`).
- [ ] `jsdom` parcourt et extrait au moins les codes standards principaux (1xx, 2xx, 3xx, 4xx, 5xx).
- [ ] Le fichier `codes_http.json` est valide, bien indenté et exploitable directement par une autre application.
