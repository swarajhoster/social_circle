//Creating connection to mongoDb, and then passsing it to server.js

const mongoose = require("mongoose");

const db = (uri, callback) => {
    mongoose
        .connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then((data) =>
            console.log(`Connected To mongoDb Successfully : ${data.connection.host}`)
        ).catch(err => {
        console.log(`Error Occurred while connecting to server: ${err.message}`)
        process.exit()
    })
};

module.exports = db;