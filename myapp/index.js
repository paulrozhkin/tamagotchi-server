const express = require('express');
const HttpStatus = require('http-status-codes');
const _ = require("lodash");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const RestaurantRepository = require("./services/RestaurantRepository.js");
const AccountExistException = require('./models/Exceptions/AccountExistException.js');
const AccountModel = require('./models/AccountModel');

// environment variables
process.env.NODE_ENV = 'development';

const config = require('./config/config_setup.js');

const app = express();
app.use(express.json());


const users = [
    {
        id: 1,
        name: "jonathan",
        password: "test"
    }
];

// Jwt init
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'secretKey';

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    let user = users[_.findIndex(users, {id: jwt_payload.id})];

    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const restaurant = new RestaurantRepository();
restaurant.connect();

app.post("/api/login", function (req, res) {
    if (req.body.name && req.body.password) {
        var name = req.body.name;
        var password = req.body.password;
    }

    var user = users[_.findIndex(users, {name: name})];

    if (!user) {
        res.status(401).json({message: "no such user found"});
    }

    if (user.password === password) {
        var payload = {id: user.id};
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({message: "ok", token: token});
    } else {
        res.status(401).json({message: "passwords did not match"});
    }
});

app.get("/api/secretDebug", function (req, res, next) {
    console.log(req.get('Authorization'));
    next();
}, function (req, res) {
    res.json("debugging");
});

app.get("/api/secret", passport.authenticate("jwt", {session: false
}), function (req, res) {
    res.json("Success! You can not see this without a token");
});

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