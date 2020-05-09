const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const MenuItemInfoModel = require('../models/MenuItemInfoModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
require('../models/Exceptions/AlreadyExistException');
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/:restaurantId/menu/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createMenuItem)
router.get('/:restaurantId/menu/', passport.authenticate("jwt", {session: false}), getRestaurantMenu)
router.get('/:restaurantId/menu/:id', passport.authenticate("jwt", {session: false}), getMenuItemById)
router.put("/:restaurantId/menu/:id", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), updateMenuItem)

async function getRestaurantMenu(req, res) {
    try {
        const menu = await restaurantRepository.Menu.getAllByRestaurant(req.params.restaurantId)
        res.json(menu)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getMenuItemById(req, res) {
    try {
        const restaurantId = req.params.restaurantId
        const id = req.params.id
        const menuItem = await restaurantRepository.Menu.getById(restaurantId, id)
        res.json(menuItem)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Menu ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function createMenuItem(req, res) {
    try {
        const restaurantId = req.params.restaurantId
        const newMenuItemJson = req.body
        if (!newMenuItemJson.dish || !newMenuItemJson.price) {
            throw new InvalidArgumentException()
        }

        const menuItemInfo = new MenuItemInfoModel(newMenuItemJson.dish,
            newMenuItemJson.price)

        const dishFullInfo = await restaurantRepository.Menu.add(restaurantId, menuItemInfo)
        res.status(HttpStatus.CREATED).json(dishFullInfo)

    } catch (e) {
        if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel(e.message))
        } else if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(e.message))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function updateMenuItem(req, res) {
    try {
        const restaurantId = req.params.restaurantId
        const id = req.params.id
        const newMenuItemJson = req.body
        const menuItemUpdatableInfo = new MenuItemInfoModel(null, newMenuItemJson.price, newMenuItemJson.isDeleted)

        const updatedMenuItem = await restaurantRepository.Menu.update(restaurantId, id, menuItemUpdatableInfo)
        res.json(updatedMenuItem)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Menu ${req.params.id} not found.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
