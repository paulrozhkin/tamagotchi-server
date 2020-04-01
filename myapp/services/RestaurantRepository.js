const { Client } = require('pg');
const AccountsRepository = require('../services/Repositories/AccountsRepository');

class RestaurantRepository {
    _client;

    constructor() {
        this._client = new Client({
            user: global.gConfig.database_user,
            host: global.gConfig.database_host,
            password: global.gConfig.database_password,
            database: global.gConfig.database_name,
            port: global.gConfig.database_port
        });

        this.Accounts = new AccountsRepository(this._client);
    }

    connect()
    {
        this._client.connect(function(err){
            if(err) {
                return console.log('connection error', err);
            }
        });
    }

    disconnect()
    {
        this._client.end();
    }
}

module.exports = RestaurantRepository;