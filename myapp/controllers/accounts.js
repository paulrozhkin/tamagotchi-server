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
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager) , getAllAccounts);

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

async function updateAccount(req, res) {
    /*
    if (jsonBody.role) {
        if (!jsonBody.user || jsonBody.user.role !== 'manager') {
            res.status(HttpStatus.UNAUTHORIZED).json({message: "Only managers can create accounts with roles."});
            return;
        }

        role = jsonBody.role;
    }
     */
}

async function createAccount(req, res) {
    try {
        const jsonBody = req.body;
        const password = jsonBody.password;
        const login = jsonBody.login;

        if (!(login && password)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "No login or password"});
            return;
        }

        let newAccountData = new Account(undefined, login, password)

        const newAccount = await restaurant.Accounts.createNewAccounts(newAccountData);
        res.status(HttpStatus.CREATED).json(
            {
                id: newAccount.id
            }
        );
    } catch (e) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (e instanceof AccountExistException) {
            statusCode = HttpStatus.FORBIDDEN;
        }

        res.status(statusCode).json({message:e.toString()});
    }
}

module.exports = router;