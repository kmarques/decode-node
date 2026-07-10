const { db } = require('./models');


const method = process.argv[2]?.slice(2) ?? "alter";

db
    .sync({
        [method]: true
    })
    .then(() => console.log("Database synced"))
    .then(() => db.close())
    .then(() => console.log("Connection closed") || process.exit(0))
    .catch((error) => {
        console.log("Error syncing database:", error);
        process.exit(1);
    });