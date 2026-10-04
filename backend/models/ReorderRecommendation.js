const mongoose = require('mongoose');

const ReorderRecommendationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  currentStock: Number,
  expectedDemand30Day: Number,
  safetyStock: Number,
  recommendedReorder: Number,
  urgencyDays: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'modified', 'rejected', 'placed'],
    default: 'pending'
  },
  modifiedQuantity: Number,
  trackingStatus: {
    type: String,
    enum: ['pending', 'ordered', 'shipped', 'received'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReorderRecommendation', ReorderRecommendationSchema);
