import { Model, DataTypes, Sequelize } from "sequelize";
import connection from "./connection.js";

class Article extends Model { }

Article.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
    }
}, {
    sequelize: connection
})

export default Article;