const express = require('express')
    , router = express.Router()
    , Account = require('../models/AccountModel')
    , passport = require("passport")
    , ROLES = require('../models/roles')
    , roleChecker = require('../middlewares/role-checker')
    , jwt = require('jsonwebtoken')
    , HttpStatus = require('http-status-codes')
    , AccountExistException = require('../models/Exceptions/AccountExistException.js');

const restaurant = require('../services/RestaurantRepository');

router.post("/", authenticate);

async function authenticate(req, res) {

    const password = req.body.password;
    const login = req.body.login;

    if (!(login && password)) {
        res.status(HttpStatus.UNAUTHORIZED).json({message: "No login or password"});
        return;
    }

    const user = await restaurant.Accounts.getAccountByLogin(login);

    if (user) {
        if (user.password === password) {
            const payload = {id: user.id, role: user.role};
            const token = jwt.sign(payload, global.gConfig.secretOrKeyJwt);
            res.json({message: "ok", token: token});
        } else {
            res.status(HttpStatus.UNAUTHORIZED).json({message: "passwords did not match"});
        }
    } else {
        res.status(HttpStatus.NOT_FOUND).json({message: "no such user found"});
    }
}

module.exports = router;
