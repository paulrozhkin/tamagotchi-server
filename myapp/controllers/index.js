const express = require('express')
    , router = express.Router();

const baseApi = '/api'

router.use(`${baseApi}/accounts`, require('./accounts'));
router.use(`${baseApi}/authenticate`, require('./authenticate'))
router.use(`${baseApi}/restaurants`, require('./restaurants'))
router.use(`${baseApi}/files`, require('./files'))

module.exports = router;
