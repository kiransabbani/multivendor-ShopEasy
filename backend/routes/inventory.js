const express = require('express');
const { getInventory, updateStock } = require('../controllers/inventoryController');
const { protect, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorizeActiveVendor);

router.get('/vendor', getInventory);
router.put('/:productId/update-stock', updateStock);

module.exports = router;
