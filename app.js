// environment variables
process.env.NODE_ENV = 'development'
const config = require('./config/config_setup') // Init config. Don't delete.

const https = require('https');
const fs = require('fs');
const express = require('express')
const app = express()
const passport = require("passport")
const bodyParser = require("body-parser")
const auth = require('./middlewares/auth') // Init auth. Don't delete.
const fileUpload = require('express-fileupload')
const cors = require('cors');

app.use(cors())
// Passport init for authentication.
app.use(passport.initialize())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Create file upload
app.use(fileUpload())

// Create routes.
app.use(require('./controllers'))

// Connect to database
const restaurantRepository = require('./services/RestaurantRepository');

async function initialDatabase() {
    await restaurantRepository.createDatabaseIfNotExist()
    await restaurantRepository.migrate()
    await restaurantRepository.connect()
}

// TODO: Нужно добавить нормальную валидацию полей в запросах https://www.npmjs.com/package/express-validation.
// TODO: Нужно переписать нормальные PUT и PATCH запросы.
// TODO: Нужно как то изменить работу с БД, сейчас это дикий ужас.
// TODO: В идеале нужно вырезать Array и заменить таблицей, они не уместны и усложняют работу.
// TODO: Нужно изменить обработку ошибок.
// TODO: Добавить логирование.
// TODO: Переписать инициализацию БД. Заменить исполнение скриптов SQL на
//          скрипт миграции, которая будет создавать таблицы БД при первом запуске сервера.
// TODO: Добавить пагинацию.
// TODO: Добавить delete запросы, а не делать удаление в PUT.
// TODO: Добавить фильтрацию.
// TODO: Добавить тесты unit, integration и E2E тесты.

initialDatabase().then(() => {
    const options = {
        key: fs.readFileSync(global.gConfig.ssl_key),
        cert: fs.readFileSync(global.gConfig.ssl_cert)
    }

    // Start app
    https.createServer(options, app).listen(global.gConfig.node_port, () => {
        console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`)
    })
}).catch(error => {
    console.log(error)
})
