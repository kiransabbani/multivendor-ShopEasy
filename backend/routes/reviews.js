const express = require('express');
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/:productId', getProductReviews);

router.use(protect);
router.post('/', authorize('customer'), addReview);
router.delete('/:id', deleteReview);

module.exports = router;
