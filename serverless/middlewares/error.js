const ErrorHander = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong MongoDb Id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHander(message, 400);
    }

    //Mongoose dulipcate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHander(message, 400);
    }

    // Wrong JWT Error
    if (err.name === "jsonWebTokenError") {
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHander(message, 400);
    }

    // JWT Expire Error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, try again`;
        err = new ErrorHander(message, 400);
    }

    //Defualt Error
    res.status(err.statusCode).json({
        succues: false,
        message: err.message,
    });
};