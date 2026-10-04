const express = require('express');
const { getProductionRecommendations, updateProductionAction } = require('../controllers/productionController');
const { protect, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorizeActiveVendor);

router.get('/vendor', getProductionRecommendations);
router.put('/:id/action', updateProductionAction);

module.exports = router;
