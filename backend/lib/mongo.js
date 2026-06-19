const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Mongo database connected"))
    .catch((err) => console.error("Mongo database connection error:", err));

module.exports = mongoose;