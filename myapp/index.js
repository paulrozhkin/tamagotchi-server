const express = require('express');
const RestaurantRepository = require("./services/RestaurantRepository.js");
const HttpStatus = require('http-status-codes');
const AccountExistException = require('./models/Exceptions/AccountExistException.js');
const AccountModel = require('./models/AccountModel');

// environment variables
process.env.NODE_ENV = 'development';

const config = require('./config/config_setup.js');

const app = express();
app.use(express.json());

const restaurant = new RestaurantRepository();
restaurant.connect();

app.get('/api/accounts', async (req, res) => {
    const accounts = await restaurant.Accounts.getAllAccounts();
    res.send(accounts);
});

app.post('/api/accounts', async (req, res) => {
    try {
        const jsonBody = req.body;
        const newAccount = await restaurant.Accounts.createNewAccounts(new AccountModel(undefined, jsonBody.login, jsonBody.password));
        res.status(HttpStatus.CREATED).send(newAccount);
    }
    catch (e) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

        if (e instanceof AccountExistException) {
            statusCode = HttpStatus.FORBIDDEN;
        }

        res.status(statusCode).send("{ \"Error Status\" : \"" + statusCode + "\" , \"Message\" : \"" + e + "\" }");
    }
});

app.listen(3000, function () {
    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});