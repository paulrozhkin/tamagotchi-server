const express = require('express')
    , router = express.Router()
    , passport = require("passport")
    , ROLES = require('../models/roles')
    , roleChecker = require('../middlewares/role-checker')
    , jwt = require('jsonwebtoken')
    , HttpStatus = require('http-status-codes');

const restaurantRepository = require('../services/RestaurantRepository');

router.post("/", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), createRestaurant);
router.get('/', passport.authenticate("jwt", {session: false}), getRestaurantById);
router.get('/:uid', passport.authenticate("jwt", {session: false}), getAllRestaurant);
router.delete("/:uid", passport.authenticate("jwt", {session: false}), roleChecker(ROLES.Manager), deleteRestaurant)
router.put("/", passport.authenticate("jwt", {session: false}), updateRestaurant)

async function getAllRestaurant(req,res) {
    return res.json({})
}

async function getRestaurantById(req,res) {
    const id = req.params.uid
    return await restaurantRepository.Restaurants.getById(id)
}

async function deleteRestaurant(req,res) {
    const id = req.params.uid
    await restaurantRepository.Restaurants.delete(id)
}

async function createRestaurant(req,res) {
    const newRestaurant = req.body
    await restaurantRepository.Restaurants.add(newRestaurant)
}

async function updateRestaurant(req,res) {
    const restaurant = req.body
    await restaurantRepository.Restaurants.update(restaurant)
}

module.exports = router;
