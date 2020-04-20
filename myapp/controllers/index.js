const express = require('express')
    , router = express.Router();

const baseApi = '/api'

router.use(`${baseApi}/accounts`, require('./accounts'));
router.use(`${baseApi}/authenticate`, require('./authenticate'))

module.exports = router;
