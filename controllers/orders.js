const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const RestaurantCreateModel = require('../models/RestaurantCreateModel')
const RestaurantUpdatableInfoModel = require('../models/RestaurantUpdatableInfoModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
const AlreadyExistException = require('../models/Exceptions/AlreadyExistException')
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createOrder)
router.get('/', passport.authenticate("jwt", {session: false}),
    roleChecker(ROLES.Manager, ROLES.Cook, ROLES.Waiter), getAllOrders)
router.get('/:id', passport.authenticate("jwt", {session: false}), getOrderById)
router.patch("/:id", passport.authenticate("jwt", {session: false}),
    roleChecker(ROLES.Manager, ROLES.Cook, ROLES.Waiter), patchOrder)

async function getAllOrders(req, res) {
    try {
        const filter = {
            client: req.query.client,
            status: req.query.status,
            cooks_status: req.query.cooks_status,
            waiters_status: req.query.waiters_status,
        }

        const orders = await restaurantRepository.Orders.getAll(filter)
        res.json(orders)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getOrderById(req, res) {
    try {
        const id = req.params.id
        const order = await restaurantRepository.Orders.getById(id)
        res.json(order)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Order ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function createOrder(req, res) {
    try {
        const newRestaurant = req.body
        if (!newRestaurant.address || !newRestaurant.positionLatitude || !newRestaurant.positionLongitude) {
            throw new InvalidArgumentException()
        }

        const restaurantCreateInfo = new RestaurantCreateModel(newRestaurant.address,
            newRestaurant.positionLatitude,
            newRestaurant.positionLongitude)

        const restaurantFullInfo = await restaurantRepository.Restaurants.add(restaurantCreateInfo)
        res.status(HttpStatus.CREATED).json(restaurantFullInfo)

    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel("Properties not set."))
        } else if (e instanceof AlreadyExistException) {
            res.status(HttpStatus.CONFLICT).json(new ErrorMessageModel("Restaurant already exist on this position."))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function patchOrder(req, res) {
    try {
        const id = req.params.id
        const restaurantJson = req.body
        const restaurant = new RestaurantUpdatableInfoModel(
            restaurantJson.isParkingPresent, restaurantJson.isCardPaymentPresent,
            restaurantJson.isWifiPresent, restaurantJson.photos,
            restaurantJson.isDeleted)
        const updatedRestaurant = await restaurantRepository.Restaurants.update(id, restaurant)
        res.json(updatedRestaurant)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Restaurant ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
