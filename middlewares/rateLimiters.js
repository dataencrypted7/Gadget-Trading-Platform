const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
    windowMs : 60 * 1000, //one minute time window
    max: 3,
    //message: "To many login requests. Try again later."
    handler: (req, res, next) => {            //user call back funtion
        let err = new Error('Too many login requests. Try again later.');
        err.status = 429;
        return next(err);
    }
});