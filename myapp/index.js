var express = require('express');
var RestaurantRepository = require("./RestaurantRepository.js")

// environment variables
process.env.NODE_ENV = 'development';

const config = require('./config/config_setup.js');

const app = express();
const restaurant = new RestaurantRepository();
restaurant.connect();

app.get('/accounts', async (req, res) => {
    const accounts = await restaurant.getAccounts();
    res.send(accounts);
});

app.listen(3000, function () {
    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});