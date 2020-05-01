const express = require('express')
const router = express.Router()

const baseApi = '/api'

router.use(`${baseApi}/users`, require('./users'))
router.use(`${baseApi}/authenticate`, require('./authenticate'))
router.use(`${baseApi}/restaurants`, require('./restaurants'))
router.use(`${baseApi}/files`, require('./files'))

module.exports = router
