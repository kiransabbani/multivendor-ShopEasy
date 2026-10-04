const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive) {
      return res.status(403).json({ success: false, message: 'This account is inactive' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

exports.authorizeActiveVendor = async (req, res, next) => {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor access required' });
    }
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || !['approved', 'active'].includes(vendor.status)) {
      return res.status(403).json({ success: false, message: 'Vendor account is not approved or is suspended' });
    }
    req.vendor = vendor;
    next();
};
