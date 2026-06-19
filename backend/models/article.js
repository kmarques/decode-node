const { Model, DataTypes, Op } = require('sequelize');
const connection = require('../lib/db');
const generateAuthorMongoDocument = require('../hooks/mongo/generateAuthorMongoDocument');

class Article extends Model {
    static addHooks(models) {
        Article.addHook('afterCreate', (instance) => console.log("createAticle", instance) || generateAuthorMongoDocument(instance.UserId, models));
        Article.addHook('afterUpdate', (instance) => generateAuthorMongoDocument(instance.UserId, models));
        Article.addHook('afterDestroy', (instance) => generateAuthorMongoDocument(instance.UserId, models));
    }

    static associate(models) {
        Article.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'owner'
        });
        models.User.hasMany(Article, {
            as: 'articles'
        });
    }
}

Article.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
}, {
    sequelize: connection,
    //tableName: '"article"',
    //modelName: "MyArticle",
    timestamps: true, // (default) add "createdAt", "updateAt",
    paranoid: false, // true = soft-delete,
    underscored: false // true = Change "Articles" to "articles" and "createdAt" to "created_at",
});

module.exports = Article;