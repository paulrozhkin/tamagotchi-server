const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes');
const RestaurantCreateModel = require('../models/RestaurantCreateModel')
const RestaurantUpdatableInfoModel = require('../models/RestaurantUpdatableInfoModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const RestaurantPropertiesException = require('../models/Exceptions/RestaurantPropertiesException')
const RestaurantExistException = require('../models/Exceptions/RestaurantExistException')
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurantRepository = require('../services/RestaurantRepository');

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createRestaurant);
router.get('/', passport.authenticate("jwt", {session: false}), getAllRestaurant);
router.get('/:id', passport.authenticate("jwt", {session: false}), getRestaurantById);
router.put("/:id", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), updateRestaurant)

async function getAllRestaurant(req, res) {
    try {
        const restaurants = await restaurantRepository.Restaurants.getAll()
        res.json(restaurants)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getRestaurantById(req, res) {
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

async function deleteRestaurant(req, res) {
    try {
        const id = req.params.id
        await restaurantRepository.Restaurants.delete(id)
        res.status(HttpStatus.OK).send()
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Restaurant ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function createRestaurant(req, res) {
    try {
        const newRestaurant = req.body
        if (!newRestaurant.address || !newRestaurant.positionLatitude || !newRestaurant.positionLongitude) {
            throw new RestaurantPropertiesException()
        }

        const restaurantCreateInfo = new RestaurantCreateModel(newRestaurant.address,
            newRestaurant.positionLatitude,
            newRestaurant.positionLongitude)

        const restaurantFullInfo = await restaurantRepository.Restaurants.add(restaurantCreateInfo)
        res.status(HttpStatus.CREATED).json(restaurantFullInfo)

    } catch (e) {
        if (e instanceof RestaurantPropertiesException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel("Properties not set."))
        } else if (e instanceof RestaurantExistException) {
            res.status(HttpStatus.CONFLICT).json(new ErrorMessageModel("Restaurant already exist on this position."))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function updateRestaurant(req, res) {
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

module.exports = router;
