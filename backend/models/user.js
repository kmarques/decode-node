const { Model, DataTypes } = require('sequelize');
const connection = require('../lib/db');

class User extends Model { }

User.init({
    lastname: DataTypes.STRING,
    firstname: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: "Email invalid"
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            //    is: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/
        }
    }
}, {
    sequelize: connection
});