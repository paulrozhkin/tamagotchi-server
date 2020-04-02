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

router.post("/authenticate", authenticate);
router.post("/create", createAccount);
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Admin) , getAllAccounts);

async function getAllAccounts(req, res) {
    const accounts = await restaurant.Accounts.getAllAccounts();
    res.send(accounts);
}

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
        res.status(HttpStatus.UNAUTHORIZED).json({message: "no such user found"});
    }
}

async function createAccount(req, res) {
    try {
        const jsonBody = req.body;
        const newAccount = await restaurant.Accounts.createNewAccounts(new Account(undefined, jsonBody.login, jsonBody.password));
        res.status(HttpStatus.CREATED).json(
            {
                id: newAccount.id,
                login: newAccount.login
            }
        );
    } catch (e) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (e instanceof AccountExistException) {
            statusCode = HttpStatus.FORBIDDEN;
        }

        res.status(statusCode).send("{ \"Error Status\" : \"" + statusCode + "\" , \"Message\" : \"" + e + "\" }");
    }
}

module.exports = router;