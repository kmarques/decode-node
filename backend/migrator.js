import { connection } from "./models/db/index.js";

const method = (process.argv[2] ?? "--alter").slice(2);

let error;
try {
    await connection.sync({ [method]: true });
    console.log(`Database ${method}ed`);
}
catch (err) {
    error = err;
    console.error(`Database ${method} failed`);
    console.error(error);
}
finally {
    await connection.close();
    process.exit(error ? 1 : 0);
}