const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usedCount: { type: Number, default: 0 },
  maxUses: Number,
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Coupon', CouponSchema);
