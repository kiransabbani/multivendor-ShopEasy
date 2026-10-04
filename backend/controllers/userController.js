const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    address.set(req.body);
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull(req.params.id);
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};
