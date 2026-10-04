const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const mongoose = require('mongoose');

exports.getProducts = async (req, res, next) => {
  try {
    const filters = { isActive: true };
    const { category, inStock, search, minPrice, maxPrice, minRating, rating } = req.query;

    if (category) {
      const categoryDoc = await Category.findOne({ $or: [{ slug: category }, { name: category }] });
      if (!categoryDoc) {
        return res.status(200).json({ success: true, count: 0, pagination: { current: 1, total: 0 }, data: [] });
      }
      filters.category = categoryDoc._id;
    }

    if (inStock === 'true') filters.stock = { $gt: 0 };
    if (minPrice !== undefined && minPrice !== '') filters.price = { ...filters.price, $gte: Number(minPrice) };
    if (maxPrice !== undefined && maxPrice !== '') filters.price = { ...filters.price, $lte: Number(maxPrice) };
    if (minRating !== undefined && minRating !== '') filters.rating = { $gte: Number(minRating) };
    if (rating !== undefined && rating !== '' && Number(rating) > 0) filters.rating = { $gte: Number(rating) };

    let query = Product.find(filters).populate('category vendor');

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    if (req.query.sortBy || req.query.sort) {
      const sortMap = {
        'price_asc': 'price',
        'price_desc': '-price',
        'rating': '-rating',
        'newest': '-createdAt',
        'popular': '-numReviews',
        'best_selling': '-sold'
      };
      query = query.sort(sortMap[req.query.sortBy || req.query.sort] || '-createdAt');
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    query = query.skip(startIndex).limit(limit);

    const products = await query;
    const total = await Product.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: { current: page, total: Math.ceil(total / limit) },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const product = await Product.findById(req.params.id).populate('category').populate('vendor', 'storeName rating');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    req.body.vendor = vendor._id;
    
    if (req.files) {
      req.body.images = req.files.map(file => file.path);
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const vendor = await Vendor.findOne({ user: req.user.id });
    if (product.vendor.toString() !== vendor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this product' });
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const vendor = await Vendor.findOne({ user: req.user.id });
    if (product.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getVendorProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const products = await Product.find({ vendor: vendor._id }).populate('category');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const recommendations = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(6);
    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort('-rating -sold').limit(10).populate('vendor', 'storeName');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort('-sold -createdAt').limit(10).populate('vendor', 'storeName');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find().sort('-sold').limit(10).populate('vendor', 'storeName');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};
