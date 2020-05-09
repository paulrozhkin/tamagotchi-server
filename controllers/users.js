const express = require('express')
const router = express.Router()
const User = require('../models/UserModel')
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const AlreadyExistException = require('../models/Exceptions/AlreadyExistException.js')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const NotFoundException = require('../models/Exceptions/NotFoundException')
const UserUpdatableInfoModel = require('../models/UserUpdatableInfoModel')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/", addUser)
router.get('/:id', passport.authenticate("jwt", {session: false}), getUserById)
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), getAllUsers)
router.put("/:id", passport.authenticate("jwt", {session: false}), updateUser)


async function getUserById(req, res) {
    try {
        const id = req.params.id
        const user = await restaurantRepository.Users.getById(id)
        res.json(user)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`User ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await restaurantRepository.Users.getAll()
        res.json(users)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function updateUser(req, res) {
    try {
        const id = parseInt(req.params.id)
        const jsonBody = req.body
        const sender = req.user
        const currentUser = await restaurantRepository.Users.getById(id)

        const userData = new UserUpdatableInfoModel(currentUser, jsonBody.login, jsonBody.role,
            jsonBody.password, jsonBody.avatar, jsonBody.fullName, jsonBody.isBlocked)

        // Если попытка обновить логин, но он уже существуют
        try {
            const userByLogin = await restaurantRepository.Users.getUserWithPasswordByLogin(userData.login)
            userData.password = userData.password ? userData.password : userByLogin.password
            if (userByLogin.id !== id) {
                res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel(`User with login ${userData.login} already exist.`))
                return
            }
        } catch (e) {
            if (e instanceof NotFoundException) {
                // Если не существует, то все нормально.
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
                return
            }
        }

        if (id !== currentUser.id && sender.role !== ROLES.Manager) {
            res.status(HttpStatus.FORBIDDEN).json(new ErrorMessageModel("You can't update another user."))
            return
        }

        if (userData.role !== currentUser.role && sender.role !== ROLES.Manager) {
            res.status(HttpStatus.FORBIDDEN).json(new ErrorMessageModel("Only manager can update the user role."))
            return
        }

        if (userData.isBlocked !== currentUser.isBlocked && sender.role !== ROLES.Manager) {
            res.status(HttpStatus.FORBIDDEN).json(new ErrorMessageModel("Only manager can block the user."))
            return
        }

        const user = await restaurantRepository.Users.update(id, userData)
        res.json(user)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`User ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function addUser(req, res) {
    try {
        const jsonBody = req.body
        const password = jsonBody.password
        const login = jsonBody.login

        if (!(login && password)) {
            res.status(HttpStatus.BAD_REQUEST).json({message: "No login or password"})
            return
        }

        const newUser = await restaurantRepository.Users.add(login, password)
        res.status(HttpStatus.CREATED).json(newUser)
    } catch (e) {
        if (e instanceof AlreadyExistException) {
            res.status(HttpStatus.CONFLICT).json(new ErrorMessageModel(`User already exist.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
