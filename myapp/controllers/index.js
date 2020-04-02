const express = require('express')
    , router = express.Router();

router.use('/api/accounts', require('./accounts'));

module.exports = router;
