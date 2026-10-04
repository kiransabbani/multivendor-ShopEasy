const express = require('express');
const { getReorderRecommendations, updateReorderAction } = require('../controllers/reorderController');
const { protect, authorizeActiveVendor } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorizeActiveVendor);

router.get('/vendor', getReorderRecommendations);
router.put('/:id/action', updateReorderAction);

module.exports = router;
