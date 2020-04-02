const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const restaurant = require('../services/RestaurantRepository');

// Jwt init
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = global.gConfig.secretOrKeyJwt;

// Jwt authenticate strategy.
const strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    let user  = await restaurant.Accounts.getAccount(jwt_payload.id);

    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use("jwt", strategy);

module.exports = passport;