// environment variables
process.env.NODE_ENV = 'development';
const config = require('./config/config_setup'); // Init config. Don't delete.

const express = require('express')
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const auth = require('./middlewares/auth'); // Init auth. Don't delete.

// Passport init for authentication.
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Create routes.
app.use(require('./controllers'));

// Connect to database
const restaurantRepository = require('./services/RestaurantRepository');
restaurantRepository.connect();

// Start app
app.listen(global.gConfig.node_port, function () {
    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});
