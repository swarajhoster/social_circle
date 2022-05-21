"use strict";

const express = require("express")
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express()
const db = require("./config/db.js");

app.use(cookieParser());

// TODO: Add cloudinary feature
// const cloudinary = require("./Cloudinary/cloudinary.js")

//Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//     console.log(`Error: ${err}`);
//     console.log("Shutting down the server due to Uncaught Exception");
//     process.exit(1);
// });

// Enabling global backend Access
app.use(cors())

// Express Json
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"}))

//Config
dotenv.config({path: path.join(__dirname, "config/config.env")});

//Connecting to mongoDb
db();

// App routes
app.use("/api/v1", require("./Routes/user.router.js"))
app.use("/api/v1", require("./Routes/follow.router.js"))
app.use("/api/v1", require("./Routes/post.router.js"))

// Server Runner
const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`Server Running on : http://localhost:${process.env.PORT || 5000}`);
});

//Unhandled Promise Rejection
// process.on("unhandledRejection", (err) => {
//     console.log(`Error : ${err}`);
//     console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//     server.close(() => {
//         process.exit(1);
//     });
// });

// //Unhandled Promise Rejection Monitor
// process.on("uncaughtExceptionMonitor", (err) => {
//     console.log(`Error : ${err}`);
//     console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//     server.close(() => {
//         process.exit(1);
//     });
// });