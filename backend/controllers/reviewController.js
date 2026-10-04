const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const productId = req.body.product || req.body.productId;
    if (!productId || !Number.isFinite(Number(req.body.rating)) || Number(req.body.rating) < 1 || Number(req.body.rating) > 5) {
      return res.status(400).json({ success: false, message: 'Product and rating between 1 and 5 are required' });
    }

    const existingReview = await Review.findOne({ product: productId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already added for this product' });
    }

    const review = await Review.create({ ...req.body, product: productId, rating: Number(req.body.rating) });

    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
