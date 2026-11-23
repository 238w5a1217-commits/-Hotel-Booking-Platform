const express = require('express');
const router  = express.Router();
const ctrl    = require('./search.controller');

router.get('/hotels', ctrl.searchHotels);
router.get('/cities', ctrl.getCities);

module.exports = router;

