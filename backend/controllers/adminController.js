const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const Notification = require('../models/Notification');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email');
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    next(error);
  }
};

exports.approveVendor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await Notification.create({
      user: vendor.user,
      type: 'general',
      title: 'Vendor Account Approved',
      message: 'Your vendor account has been approved.',
      priority: 'high'
    });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.rejectVendor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await Notification.create({
      user: vendor.user,
      type: 'general',
      title: 'Vendor Account Rejected',
      message: 'Your vendor account application was rejected.',
      priority: 'high'
    });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.suspendVendor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.activateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('vendor', 'storeName').populate('category', 'name');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name').populate('vendor', 'storeName');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getCommissions = async (req, res, next) => {
  try {
    const commissions = await Commission.find().populate('vendor', 'storeName').populate('order', 'orderNumber');
    res.status(200).json({ success: true, count: commissions.length, data: commissions });
  } catch (error) {
    next(error);
  }
};

exports.getCommissionSummary = async (req, res, next) => {
  try {
    const summary = await Commission.aggregate([
      {
        $group: {
          _id: "$vendor",
          totalCommission: { $sum: "$commissionAmount" },
          totalVendorEarnings: { $sum: "$vendorEarnings" }
        }
      }
    ]);
    await Vendor.populate(summary, { path: '_id', select: 'storeName' });
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
