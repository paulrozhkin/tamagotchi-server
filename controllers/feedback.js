const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const OrderCreateModel = require('../models/OrderCreateModel')
const OrderUpdatableInfoModel = require('../models/OrderUpdatableInfoModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
const NoPlaceException = require('../models/Exceptions/NoPlaceException')
const AlreadyExistException = require('../models/Exceptions/AlreadyExistException')
const IncorrectOrderParametersException = require('../models/Exceptions/IncorrectOrderParametersException')
const NotFoundException = require('../models/Exceptions/NotFoundException')
const {FilterModel, FilterItemModel} = require('../models/FilterModel')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createFeedback)
router.get('/', passport.authenticate("jwt", {session: false}),
    roleChecker(ROLES.Manager), getAllFeedback)

async function getAllFeedback(req, res) {
    try {
        const feedback = await restaurantRepository.Feedback.getAll()
        res.json(feedback)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function createFeedback(req, res) {
    try {
        const feedbackJson = req.body

        if (feedbackJson.feedback == null) {
            throw new InvalidArgumentException()
        }

        const feedbackModel = {
            feedback: feedbackJson.feedback,
            user: req.user.id,
            createdTime: new Date().toISOString()

        }

        const orderFullInfo = await restaurantRepository.Feedback.add(feedbackModel)
        res.status(HttpStatus.CREATED).json(orderFullInfo)
    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel("Properties not set."))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
