const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  storeDescription: String,
  contactEmail: String,
  contactPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'active'],
    default: 'pending'
  },
  rating: { type: Number, default: 5 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0.10 },
  performanceScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', VendorSchema);
