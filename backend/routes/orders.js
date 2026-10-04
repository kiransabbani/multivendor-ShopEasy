const express = require('express');
const { placeOrder, getMyOrders, getOrder, cancelOrder, returnOrder, getVendorOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('customer'), placeOrder);
router.get('/my-orders', authorize('customer'), getMyOrders);
router.get('/vendor/orders', authorizeActiveVendor, getVendorOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', authorize('customer'), cancelOrder);
router.put('/:id/return', authorize('customer'), returnOrder);
router.put('/:id/status', authorizeActiveVendor, updateOrderStatus);

module.exports = router;
