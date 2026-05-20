module.exports = function middlewareError(error, req, res, next) {
    if (error.name === "ValidationError") {
        const errors = error.errors;
        /**
         * Format:
         * {
         *   "password": ["required", "must contains 1 min, 1 number, 1 maj, 1 special"]
         * }
         */
        res.status(422).json(errors);
    } else {
        console.error(e);
        res.sendStatus(500);
    }
}