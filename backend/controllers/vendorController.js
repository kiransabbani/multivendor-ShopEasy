const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ status: 'approved' }).select('-user');
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    next(error);
  }
};

exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });

    const totalOrders = await Order.countDocuments({ vendor: vendor._id });
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });
    const lowStockCount = await Product.countDocuments({ vendor: vendor._id, $expr: { $lte: ['$stock', '$minStockLevel'] } });
    const revenue = await Order.aggregate([
      { $match: { vendor: vendor._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const orderStatusData = await Order.aggregate([
      { $match: { vendor: vendor._id } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } }
    ]);
    const revenueData = await Order.aggregate([
      { $match: { vendor: vendor._id, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        value: { $sum: '$totalAmount' }
      } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $limit: 30 }
    ]);
    
    const bestSellers = await Product.find({ vendor: vendor._id }).sort('-sold').limit(5);
    const recentOrders = await Order.find({ vendor: vendor._id }).sort('-createdAt').limit(5).populate('customer', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalSales: vendor.totalSales,
        totalRevenue: revenue[0]?.total || 0,
        totalOrders,
        totalProducts,
        lowStockCount,
        revenueData,
        orderStatusData,
        bestSellers,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.getPerformance = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    res.status(200).json({
      success: true,
      data: {
        performanceScore: vendor.performanceScore,
        rating: vendor.rating,
        totalSales: vendor.totalSales,
        totalRevenue: vendor.totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
