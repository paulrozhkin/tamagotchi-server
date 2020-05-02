const {Client} = require('pg')
const UsersRepository = require('../services/Repositories/UsersRepository')
const RestaurantsRepository = require('./Repositories/RestaurantsRepository')
const FilesRepository = require('./Repositories/FilesRepository')
const fs = require('fs')

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
    }

    connect() {
        this._connect(this._client)
    }

    _connect(client) {
        client.connect(function (err) {
            if (err) {
                throw new Error(err)
            }
        })
    }

    disconnect() {
        this._disconnect(this._client)
    }

    _disconnect(client) {
        client.end()
    }

    async createDatabaseIfNotExist() {
        let clientChecker = new Client({
            user: global.gConfig.database_user,
            host: global.gConfig.database_host,
            password: global.gConfig.database_password,
            port: global.gConfig.database_port
        })

        this._connect(clientChecker)

        try {
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

                this._connect(clientCreator)

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
                    this._disconnect(clientCreator)
                }
            }
        } finally {
            this._disconnect(clientChecker)
        }


    }
}

module.exports = new RestaurantRepository()
