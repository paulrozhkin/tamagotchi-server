var express = require('express');
var RestaurantRepository = require("./RestaurantRepository.js")

var app = express();
var restaurant = new RestaurantRepository();
restaurant.connect();

app.get('/accounts', async (req, res) => {
    var accounts = await restaurant.getAccounts();
    res.send(accounts);
});

app.listen(3000, function () {
    console.log('Example app listening on port localhost:3000!');
});