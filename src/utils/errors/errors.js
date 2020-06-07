exports.catchErrors = fn => {
    return function(req, res, next) {
        return fn(req, res, next).catch(next);
    };
};

exports.processErrors = (err, req, res, next) => {
    if (!err) {
        next();
    }

    if (err instanceof SyntaxError){
        return res.status(500).json({
            message: "Incorrect json format",
        });
    }

    console.log(err);

    return res.status(500).json({
        message: "internal server error"
    });
};