const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurant = require('../services/RestaurantRepository')

router.post("/", authenticate)

async function authenticate(req, res) {

    const password = req.body.password
    const login = req.body.login

    if (!(login && password)) {
        res.status(HttpStatus.BAD_REQUEST).json({message: "No login or password"})
        return
    }

    try {
        const user = await restaurant.Users.getUserWithPasswordByLogin(login)

        if (user.password === password) {
            const payload = {id: user.id, role: user.role}
            const token = jwt.sign(payload, global.gConfig.secretOrKeyJwt)
            const {password, ...userWithoutPassword} = user
            res.json({...userWithoutPassword, token})
        } else {
            res.status(HttpStatus.UNAUTHORIZED).json(new ErrorMessageModel("Authentication failed. Wrong password."))
        }
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel("Authentication failed. User not found."))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
