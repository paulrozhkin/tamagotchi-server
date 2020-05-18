const express = require('express')
const router = express.Router()
const passport = require("passport")
const ROLES = require('../models/roles')
const roleChecker = require('../middlewares/role-checker')
const HttpStatus = require('http-status-codes')
const TableCreateModel = require('../models/TableCreateModel')
const TableUpdatableModel = require('../models/TableUpdatableModel')
const ErrorMessageModel = require('../models/ErrorMessageModel')
const InvalidArgumentException = require('../models/Exceptions/InvalidArgumentException')
const AlreadyExistException = require('../models/Exceptions/AlreadyExistException')
const NotFoundException = require('../models/Exceptions/NotFoundException')

const restaurantRepository = require('../services/RestaurantRepository')

router.post("/:restaurantId/tables/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createTable)
router.get('/:restaurantId/tables/', passport.authenticate("jwt", {session: false}), getAllTables)
router.get('/:restaurantId/tables/:id', passport.authenticate("jwt", {session: false}), getTableById)
router.put("/:restaurantId/tables/:id", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), updateTable)

async function getAllTables(req, res) {
    try {
        const restaurantId = req.params.restaurantId
        const tables = await restaurantRepository.Tables.getAll(restaurantId)
        res.json(tables)
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
    }
}

async function getTableById(req, res) {
    try {
        const restaurantId = req.params.restaurantId
        const tableId = req.params.id

        const table = await restaurantRepository.Tables.getById(restaurantId, tableId)
        res.json(table)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(
                new ErrorMessageModel(`Table ${req.params.id} not found in restaurant ${req.params.restaurantId}.`))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

async function createTable(req, res) {
    try {
        const newTable = req.body
        const restaurantId = req.params.restaurantId

        if (!newTable.name || newTable.numberOfPlaces === undefined || restaurantId === undefined) {
            throw new InvalidArgumentException()
        }

        const tableCreateInfo = new TableCreateModel(newTable.name, restaurantId, newTable.numberOfPlaces)

        const tableFullInfo = await restaurantRepository.Tables.add(tableCreateInfo)
        res.status(HttpStatus.CREATED).json(tableFullInfo)

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

async function updateTable(req, res) {
    try {
        const tableId = req.params.id
        const restaurantId = req.params.restaurantId
        const tableJson = req.body

        const tableUpdateInfo = new TableUpdatableModel(tableJson.name, tableJson.description,
            tableJson.photos, tableJson.numberOfPlaces, tableJson.isDeleted)

        if (tableUpdateInfo.name === undefined
            || tableUpdateInfo.numberOfPlaces === undefined
            || tableUpdateInfo.isDeleted === undefined
            || tableUpdateInfo.photos === undefined
            || tableUpdateInfo.description === undefined
            || restaurantId === undefined) {
            throw new InvalidArgumentException()
        }

        const updatedTable = await restaurantRepository.Tables.update(restaurantId, tableId, tableUpdateInfo)
        res.json(updatedTable)
    } catch (e) {
        if (e instanceof NotFoundException) {
            res.status(HttpStatus.NOT_FOUND).json(new ErrorMessageModel(`Table ${req.params.id} not found in restaurant ${req.params.restaurantId}.`))
        } else if (e instanceof InvalidArgumentException) {
            res.status(HttpStatus.BAD_REQUEST).json(new ErrorMessageModel("Properties not set."))
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ErrorMessageModel("Internal Server Error. Error: " + e.message))
        }
    }
}

module.exports = router
