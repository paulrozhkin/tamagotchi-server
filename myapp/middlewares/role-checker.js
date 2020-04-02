const HttpStatus =  require("http-status-codes");
const ROLES = require('../models/roles');

// Middleware function for check account role in router.
const checkIsInRole = (...roles) => (req, res, next) => {
    let user = req.user;

    if (user.role !== ROLES.Admin && !roles.includes(user.role)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({message: "No permission"})
    }

    return next()
};

module.exports = checkIsInRole;