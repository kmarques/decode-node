import connection from "./connection.js";
import User from "./user.js";
import Article from "./article.js";

User.hasMany(Article, { foreignKey: "author_id", as: "articles" });
Article.belongsTo(User, { foreignKey: "author_id", as: "author" });

export { connection, User, Article };
