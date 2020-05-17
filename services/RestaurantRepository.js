const {Client} = require('pg')
const UsersRepository = require('../services/Repositories/UsersRepository')
const RestaurantsRepository = require('./Repositories/RestaurantsRepository')
const FilesRepository = require('./Repositories/FilesRepository')
const DishesRepository = require('./Repositories/DishesRepository')
const MenuRepository = require('./Repositories/MenuRepository')
const OrdersRepository = require('./Repositories/OrdersRepository')
const fs = require('fs')
const runner = require('node-pg-migrate')

class RestaurantRepository {
    constructor() {
        this._client = new Client({
            user: global.gConfig.database_user,
            host: global.gConfig.database_host,
            password: global.gConfig.database_password,
            database: global.gConfig.database_name,
            port: global.gConfig.database_port
        })

        this.Users = new UsersRepository(this._client, 'public.users')
        this.Restaurants = new RestaurantsRepository(this._client, 'public.restaurants')
        this.Files = new FilesRepository(this._client, 'public.files')
        this.Dishes = new DishesRepository(this._client, 'public.dishes')
        this.Orders = new OrdersRepository(this._client, 'public.orders')
        this.Menu = new MenuRepository(this._client, 'public.menu', this.Restaurants, this.Dishes)
    }

    async connect() {
        return this._connect(this._client)
    }

    async _connect(client) {
        return client.connect()
    }

    async disconnect() {
        return this._disconnect(this._client)
    }

    async _disconnect(client) {
        return client.end()
    }

    async migrate() {
        const config = global.gConfig

        await runner.default({
            databaseUrl: `postgres://${config.database_user}:${config.database_password}@${config.database_host}:${config.database_port}/${config.database_name}`,
            direction: "up",
            dir: 'migrations',
            migrationsTable: 'pgmigrations'
        })
    }

    async createDatabaseIfNotExist() {
        let clientChecker = new Client({
            user: global.gConfig.database_user,
            host: global.gConfig.database_host,
            password: global.gConfig.database_password,
            port: global.gConfig.database_port
        })

        try {
            await this._connect(clientChecker)

            const sqlQuery = `select exists(SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${global.gConfig.database_name}'));`

            let isExistResult = await clientChecker.query(sqlQuery)
            let isExist = isExistResult.rows[0].exists

            if (!isExist) {
                const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))

                console.log("Database not exist. Create database.")
                clientChecker.query("CREATE DATABASE tamagotchi")
                await sleep(5000)
                console.log("Database created.")

                let clientCreator = new Client({
                    user: global.gConfig.database_user,
                    host: global.gConfig.database_host,
                    password: global.gConfig.database_password,
                    database: global.gConfig.database_name,
                    port: global.gConfig.database_port
                })

                await this._connect(clientCreator)

                try {
                    let folderName = process.cwd() + '/config/sql/'
                    let sqlFiles = fs.readdirSync(folderName)
                    sqlFiles.sort()

                    for (let index = 0; index < sqlFiles.length; ++index) {
                        let sqlContent = fs.readFileSync(folderName + sqlFiles[index], 'utf8')
                        await clientCreator.query(sqlContent)
                        await sleep(1000)
                        console.log(`Sql script ${sqlFiles[index]} completed`)
                    }

                    console.log(`Tables created`)
                } finally {
                    await this._disconnect(clientCreator)
                }
            }
        } finally {
            await this._disconnect(clientChecker)
        }


    }
}

module.exports = new RestaurantRepository()
