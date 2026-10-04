const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  currentStock: Number,
  forecastedDemand: Number,
  safetyStock: Number,
  currentProduction: { type: Number, default: 0 },
  productionCapacity: Number,
  requiredProduction: Number,
  recommendedProduction: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'started', 'completed'],
    default: 'pending'
  },
  hikeLabel: {
    type: String,
    enum: ['no_increase', 'moderate', 'high', 'critical'],
    default: 'no_increase'
  },
  hikePercentage: Number,
  reason: String,
  demandGrowth: Number,
  vendorAction: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Production', ProductionSchema);
