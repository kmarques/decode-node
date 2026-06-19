const { Model, DataTypes, Op } = require('sequelize');
const connection = require('../lib/db');
const bcrypt = require('bcryptjs');
const generateAuthorMongoDocument = require('../hooks/mongo/generateAuthorMongoDocument');

class User extends Model {
    static countDecodeUser() {
        return User.count({
            where: {
                email: {
                    [Op.iLike]: '%ecole-decode.fr'
                }
            }
        })
    }

    static nativeCountDecodeUser() {
        return connection.query(`SELECT count(*) from "user" where email ilike '%ecole-decode.fr'`);

    }

    static addHooks(models) {
        User.addHook('beforeCreate', (user, options) => {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        });

        User.addHook('beforeUpdate', (user, options) => {
            // if (user.changed('password'))
            if (options.fields.includes('password'))
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        })


        User.addHook('afterCreate', (instance) => generateAuthorMongoDocument(instance.id, models));
        User.addHook('afterUpdate', (instance) => generateAuthorMongoDocument(instance.id, models));
        User.addHook('afterDestroy', (instance) => generateAuthorMongoDocument(instance.id, models));

    }
}

User.init({
    lastname: DataTypes.STRING,
    firstname: DataTypes.STRING,
    birthDate: DataTypes.DATE,
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
    sequelize: connection,
    //tableName: '"user"',
    //modelName: "MyUser",
    timestamps: true, // (default) add "createdAt", "updateAt",
    paranoid: false, // true = soft-delete,
    underscored: false // true = Change "Users" to "users" and "createdAt" to "created_at",
});


// decorateMongo(Article, [{
//     events: ['afterCreate', 'afterUpdate', 'afterDestroy'],
//     callback: generateAuthorMongoDocument,
//     id: (instance) => instance.owner.id,
// }]);
// decorateMongo(User, [{
//     events: ['afterCreate', 'afterUpdate', 'afterDestroy'],
//     callback: generateAuthorMongoDocument,
//     id: (instance) => instance.id,
// }]);

module.exports = User;