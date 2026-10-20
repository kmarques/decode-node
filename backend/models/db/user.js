import { Model, DataTypes } from "sequelize";
import connection from "./connection.js";

class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            // is: /^(?:[a-z].*)(?:[A-Z].*)(?:\d.*)(?:[^a-zA-Z0-9].*).*{8,32}$/
        }
    },
    lastname: DataTypes.STRING,
    dob: DataTypes.DATEONLY
}, {
    sequelize: connection
})

export default User;