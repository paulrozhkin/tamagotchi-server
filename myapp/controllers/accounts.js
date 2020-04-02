const express = require('express')
    , router = express.Router()
    , Account = require('../models/AccountModel')
    , passport = require("passport")
    , ROLES = require('../models/roles')
    , roleChecker = require('../middlewares/role-checker')
    , jwt = require('jsonwebtoken');

const restaurant = require('../services/RestaurantRepository');

router.post("/authenticate", authenticate);
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Admin) , getAllAccounts);

async function getAllAccounts(req, res) {
    const accounts = await restaurant.Accounts.getAllAccounts();
    res.send(accounts);
}

async function authenticate(req, res) {

    const password = req.body.password;
    const login = req.body.login;

    if (!(login && password)) {
        res.status(401).json({message: "No login or password"});
        return;
    }

    const user = await restaurant.Accounts.getAccountByLogin(login);

    if (user) {
        if (user.password === password) {
            const payload = {id: user.id, role: user.role};
            const token = jwt.sign(payload, global.gConfig.secretOrKeyJwt);
            res.json({message: "ok", token: token});
        } else {
            res.status(401).json({message: "passwords did not match"});
        }
    } else {
        res.status(401).json({message: "no such user found"});
    }
}

module.exports = router;