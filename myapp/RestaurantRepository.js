const { Client } = require('pg')
const connectionString = 'postgresql://postgres:h8970102742@localhost:5432/tamagotchi'

class RestaurantRepository {
    constructor() {
        this.client = new Client({
            connectionString: connectionString,
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
        var arrayAccounts = [];
        //arrayAccounts.push()
        var res = await this.client.query('SELECT * FROM tamagotchi.schema.accounts;');

        res.rows.forEach(accountItem => {
            var account = new AccountModel(accountItem.id, accountItem.fullname, accountItem.number);
            arrayAccounts.push(account);
        });

        /* this.client.query('SELECT * FROM tamagotchi.schema.accounts;', (err, res) => {
                if (err) {
                console.log(err.stack)
            } else {
                res.rows.forEach(accountItem => {
                    var account = new AccountModel(accountItem.id, accountItem.fullname, accountItem.number);
                    arrayAccounts.push(account);
                })
            }
        }); */

        return arrayAccounts;
    }
}

class AccountModel {
    constructor(id, name, number) {
        this.id = id;
        this.name = name;
        this.number = number;
    }
}

module.exports = RestaurantRepository;