'use strict';

var utils = require('../utils/writer.js');
var Orders = require('../service/OrdersService');

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
router.get('/', passport.authenticate("jwt", {session: false}), getOrderById)
router.get('/:id', passport.authenticate("jwt", {session: false}), getOrderById)
router.put("/:id", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), updateOrder)

async function getAllOrders(req, res) {
    try {
        const restaurants = await restaurantRepository.Restaurants.getAll()
        res.json(restaurants)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getOrderById(req, res) {
    try {
        const id = req.params.id
        const restaurant = await restaurantRepository.Restaurants.getById(id)
        res.json(restaurant)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Restaurant ${req.params.id} not found.`))
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

async function updateOrder(req, res) {
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
