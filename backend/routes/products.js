const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getVendorProducts, getRecommendations, getFeaturedProducts, getTrendingProducts, getBestSellers } = require('../controllers/productController');
const { protect, authorize, authorizeActiveVendor } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/best-sellers', getBestSellers);
router.get('/vendor/my-products', protect, authorizeActiveVendor, getVendorProducts);
router.get('/:id/recommendations', getRecommendations);

router.route('/')
  .get(getProducts)
  .post(protect, authorizeActiveVendor, upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorizeActiveVendor, upload.array('images', 5), updateProduct)
  .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
