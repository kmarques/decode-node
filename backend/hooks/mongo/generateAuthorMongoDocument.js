const Author = require("../../models/mongo/author");

module.exports = async function generateAuthorMongoDocument(userId, models) {
    console.log("generateAuthorMongoDocument", userId);
    const user = await models.User.findOne({
        attributes: ["id", ["id", "_id"], "firstname", "lastname"],
        include: [
            {
                model: models.Article,
                as: "articles",
                attributes: ["id", ["id", "_id"], "title", "description"],
                limit: 3,
                order: [["createdAt", "DESC"]],
            }
        ],
        where: { id: userId }
    });

    if (user) {
        console.log(user);
        await Author.deleteOne({ _id: userId });
        await Author.create({ ...user.dataValues, articles: user.dataValues.articles.map(a => a.dataValues) })
    };
}