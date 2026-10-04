const express = require('express');
const { runForecast, getForecast, getAllForecasts } = require('../controllers/forecastingController');
const { protect, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorizeActiveVendor);

router.post('/run/:productId', runForecast);
router.get('/vendor/all', getAllForecasts);
router.get('/:productId', getForecast);

module.exports = router;
