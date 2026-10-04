const express = require('express');
const { getVendors, getVendor, getProfile, getDashboardStats, updateProfile, getPerformance } = require('../controllers/vendorController');
const { protect, authorize, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

// Specific vendor endpoints (protected)
router.get('/dashboard/stats', protect, authorizeActiveVendor, getDashboardStats);
router.get('/profile', protect, authorizeActiveVendor, getProfile);
router.put('/profile', protect, authorizeActiveVendor, updateProfile);
router.get('/performance', protect, authorizeActiveVendor, getPerformance);

// Public / generic endpoints
router.get('/', getVendors);
router.get('/:id', getVendor);

module.exports = router;
