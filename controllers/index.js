const express = require('express')
const router = express.Router()

const baseApi = '/api'

router.use(`${baseApi}/users`, require('./users'))
router.use(`${baseApi}/authenticate`, require('./authenticate'))
router.use(`${baseApi}/files`, require('./files'))
router.use(`${baseApi}/account`, require('./account'))
router.use(`${baseApi}/dishes`, require('./dishes'))

router.use(`${baseApi}/restaurants`, require('./restaurants'))
router.use(`${baseApi}/restaurants`, require('./menu'))

module.exports = router
