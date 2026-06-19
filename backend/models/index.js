const db = require('../lib/db');

// load models

const Article = require("./article");
const User = require("./user");

db.models = {
    Article, User
}

Article.addHooks?.(db.models);
Article.associate?.(db.models);
User.addHooks?.(db.models);
User.associate?.(db.models);

module.exports = { db, User, Article };
