const express = require('express');
const { getVendorAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/vendor', authorizeActiveVendor, getVendorAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

module.exports = router;
