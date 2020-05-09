const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const DishInfoModel = require('../models/DishInfoModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
require('../models/Exceptions/AlreadyExistException');
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createDish)
router.get('/', passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), getAllDishes)
router.get('/:id', passport.authenticate("jwt", {session: false}), getDishById)
router.put("/:id", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), updateDish)

async function getAllDishes(req, res) {
    try {
        const dishes = await restaurantRepository.Dishes.getAll()
        res.json(dishes)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getDishById(req, res) {
    try {
        const id = req.params.id
        const dish = await restaurantRepository.Dishes.getById(id)
        res.json(dish)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Dish ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function createDish(req, res) {
    try {
        const newDish = req.body
        if (!newDish.name) {
            throw new InvalidArgumentException()
        }

        const dishCreateInfo = new DishInfoModel(newDish.name,
            newDish.description,
            newDish.photos)

        const dishFullInfo = await restaurantRepository.Dishes.add(dishCreateInfo)
        res.status(HttpStatus.CREATED).json(dishFullInfo)

    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel(e.message))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function updateDish(req, res) {
    try {
        const id = req.params.id
        const dishJson = req.body
        const dish = new DishInfoModel(dishJson.name, dishJson.description, dishJson.photos)

        const updatedDish = await restaurantRepository.Dishes.update(id, dish)
        res.json(updatedDish)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Dish ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
