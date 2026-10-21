import { Model, DataTypes } from "sequelize";
import connection from "./connection.js";
import bcrypt from "bcryptjs";

class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    firstname: DataTypes.STRING,
    dob: DataTypes.DATEONLY
}, {
    sequelize: connection
});

async function hashPassword(user) {
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
}

User.addHook("beforeCreate", hashPassword);
User.addHook("beforeUpdate", async (user, options) => {
    const { fields } = options;
    if (fields.includes("password")) {
        await hashPassword(user);
    }
});

export default User;