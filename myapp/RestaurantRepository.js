const { Client } = require('pg')

class RestaurantRepository {
    constructor() {
        this.client = new Client({
            user: global.gConfig.database_user,
            host: global.gConfig.database_host,
            password: global.gConfig.database_host.database_password,
            database: global.gConfig.database_name,
            port: global.gConfig.database_port
        })
    }

    connect()
    {
        this.client.connect(function(err){
            if(err) {
                return console.log('connection error', err)
            }
        });
    }

    disconnect()
    {
        this.client.end();
    }

    async getAccounts()
    {
        const arrayAccounts = [];

        const res = await this.client.query('SELECT * FROM tamagotchi.public.users;');

        res.rows.forEach(accountItem => {
            const account = new AccountModel(accountItem.id, accountItem.login, accountItem.password, accountItem.role, accountItem.full_name);
            arrayAccounts.push(account);
        });

        return arrayAccounts;
    }
}

class AccountModel {
    constructor(id, login, password, role, fullName) {
        this.id = id;
        this.login = login;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
    }
}

module.exports = RestaurantRepository;