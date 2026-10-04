const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  images: [String],
  sku: String,
  stock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  safetyStock: { type: Number, default: 20 },
  productionCapacity: { type: Number, default: 100 },
  leadTime: { type: Number, default: 7 }, // in days
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tags: [String],
  discount: { type: Number, default: 0 }
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ vendor: 1, isActive: 1 });

module.exports = mongoose.model('Product', ProductSchema);
