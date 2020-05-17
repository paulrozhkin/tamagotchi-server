const express = require('express')
const router = express.Router()
const HttpStatus = require('http-status-codes')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const passport = require("passport")

router.get("/", passport.authenticate("jwt", {session: false}), getCurrentAccount)
router.get("/orders/", passport.authenticate("jwt", {session: false}), getUserOrders)

async function getCurrentAccount(req, res) {
    try {
        res.json(req.user)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal server error. Error: " + e.message))
    }
}

async function getUserOrders(req, res) {
    try {
        const id = req.params.id
        res.json("")
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

module.exports = router
