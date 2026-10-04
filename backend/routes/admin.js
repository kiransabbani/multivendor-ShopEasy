const express = require('express');
const { getUsers, toggleUserStatus, getVendors, approveVendor, rejectVendor, suspendVendor, activateVendor, getProducts, deleteProduct, getOrders, getCommissions, getCommissionSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);
router.put('/vendors/:id/activate', activateVendor);

router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getOrders);

router.get('/commissions', getCommissions);
router.get('/commission-summary', getCommissionSummary);

module.exports = router;
