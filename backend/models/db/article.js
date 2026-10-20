import { Model, DataTypes } from "sequelize";
import connection from "./connection.js";

class Article extends Model { }

Article.init({
    id: {
        type: DataTypes.UUIDV4,
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
        defaultValue: "NOW()"
    }
}, {
    sequelize: connection
})

export default Article;