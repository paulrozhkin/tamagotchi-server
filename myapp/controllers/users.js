const express = require('express')
    , router = express.Router()
    , User = require('../models/UserModel')
    , passport = require("passport")
    , ROLES = require('../models/roles')
    , roleChecker = require('../middlewares/role-checker')
    , jwt = require('jsonwebtoken')
    , HttpStatus = require('http-status-codes')
    , UserExistException = require('../models/Exceptions/UserExistException.js');

const restaurant = require('../services/RestaurantRepository');

router.post("/", addUser);
router.get('/:uid', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), getUserById);
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), getAllUsers);
router.delete("/:uid", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), deleteUser)
router.put("/", passport.authenticate("jwt", {session: false}), updateUser)

async function deleteUser() {

}

async function getUserById() {

}

async function getAllUsers(req, res) {
    const Users = await restaurant.Users.getAllUsers();
    res.send(Users);
}

async function updateUser(req, res) {
    /*
    if (jsonBody.role) {
        if (!jsonBody.user || jsonBody.user.role !== 'manager') {
            res.status(HttpStatus.UNAUTHORIZED).json({message: "Only managers can create Users with roles."});
            return;
        }

        role = jsonBody.role;
    }
     */
}

async function addUser(req, res) {
    try {
        const jsonBody = req.body;
        const password = jsonBody.password;
        const login = jsonBody.login;

        if (!(login && password)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: "No login or password"});
            return;
        }

        let newUserData = new User(undefined, login, password)

        const newUser = await restaurant.Users.createNewUsers(newUserData);
        res.status(HttpStatus.CREATED).json(
            {
                id: newUser.id
            }
        );
    } catch (e) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (e instanceof UserExistException) {
            statusCode = HttpStatus.FORBIDDEN;
        }

        res.status(statusCode).json({message:e.toString()});
    }
}

module.exports = router;
