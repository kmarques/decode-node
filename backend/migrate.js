const connection = require('./lib/db');
require('./models/user');
require('./models/article');

const method = process.argv[2]?.slice(2) ?? "alter";

connection
    .sync({
        [method]: true
    })
    .then(() => console.log("Database synced"))
    .then(() => connection.close());