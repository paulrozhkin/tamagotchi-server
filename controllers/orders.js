const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const OrderCreateModel = require('../models/OrderCreateModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
const NoPlaceException = require('../models/Exceptions/NoPlaceException')
const AlreadyExistException = require('../models/Exceptions/AlreadyExistException')
const IncorrectOrderParametersException = require('../models/Exceptions/IncorrectOrderParametersException')
const NotFoundException = require('../models/Exceptions/NotFoundException')
const {FilterModel, FilterItemModel} = require('../models/FilterModel')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createOrder)
router.get('/', passport.authenticate("jwt", {session: false}),
    roleChecker(ROLES.Manager, ROLES.Cook, ROLES.Waiter), getAllOrders)
router.get('/:id', passport.authenticate("jwt", {session: false}), getOrderById)
router.patch("/:id", passport.authenticate("jwt", {session: false}),
    roleChecker(ROLES.Manager, ROLES.Cook, ROLES.Waiter), patchOrder)

async function getAllOrders(req, res) {
    try {
        const filter = new FilterModel()
        filter.addFilterItem(new FilterItemModel('client', req.query.client))
        filter.addFilterItem(new FilterItemModel('status', req.query.status))
        filter.addFilterItem(new FilterItemModel('cooks_status', req.query.cooks_status))
        filter.addFilterItem(new FilterItemModel('waiters_status', req.query.waiters_status))

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
        const newOrder = req.body

        if (newOrder.restaurant == null || newOrder.client == null || !newOrder.visitTime
            || !newOrder.numberOfPersons || (newOrder.menu != null && !Array.isArray(newOrder.menu))
            || (newOrder.menu != null && newOrder.paymentToken == null)) {
            throw new InvalidArgumentException()
        }

        const orderCreateInfo = new OrderCreateModel(
            newOrder.restaurant, newOrder.client, newOrder.numberOfPersons, newOrder.menu,
            newOrder.visitTime, newOrder.comment, newOrder.paymentToken)

        const orderFullInfo = await restaurantRepository.Orders.add(orderCreateInfo)
        res.status(HttpStatus.CREATED).json(orderFullInfo)
    } catch (e) {
        if (e instanceof IncorrectOrderParametersException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel(e.message))
        } else if (e instanceof NoPlaceException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel(e.message))
        } else if (e instanceof InvalidArgumentException) {
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
