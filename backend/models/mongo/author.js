const connection = require('../../lib/mongo');

const AuthorSchema = new connection.Schema({
    _id: Number,
    firstname: String,
    lastname: String,
    articles: Array
});

const Author = connection.model('Author', AuthorSchema);

module.exports = Author;