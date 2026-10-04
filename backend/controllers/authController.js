const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res, next) => {
  try {
    const { name, password, role, storeName, storeDescription, contactPhone } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const accountRole = role === 'vendor' ? 'vendor' : 'customer';

    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: accountRole,
      phone: contactPhone
    });

    let vendor = null;
    if (accountRole === 'vendor') {
      if (!storeName) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Store name is required for vendor' });
      }
      vendor = await Vendor.create({
        user: user._id,
        storeName,
        storeDescription,
        contactEmail: email,
        contactPhone
      });
    }

    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(admins.map(admin => ({
        user: admin._id,
        type: accountRole === 'vendor' ? 'vendor_registered' : 'customer_registered',
        title: accountRole === 'vendor' ? 'New Vendor Registration' : 'New Customer Registration',
        message: accountRole === 'vendor'
          ? `${storeName} has registered and is waiting for approval.`
          : `${name} (${email}) registered as a customer.`,
        priority: accountRole === 'vendor' ? 'high' : 'medium'
      })));
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      vendorId: vendor ? vendor._id : null,
      vendor
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account is inactive' });
    }

    const token = generateToken(user._id);

    let vendorId = null;
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
      if (vendor) vendorId = vendor._id;
      if (!vendor || !['approved', 'active'].includes(vendor.status)) {
        return res.status(403).json({ success: false, message: 'Your vendor account is awaiting approval or is suspended' });
      }
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      vendorId,
      vendor
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      vendor
    });
  } catch (error) {
    next(error);
  }
};
