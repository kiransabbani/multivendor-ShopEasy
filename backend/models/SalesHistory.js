const mongoose = require('mongoose');

const SalesHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  date: { type: Date, required: true },
  quantitySold: { type: Number, required: true },
  revenue: { type: Number, required: true },
  price: { type: Number, required: true },
  isPromotion: { type: Boolean, default: false },
  season: { type: String, enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter'] }
});

module.exports = mongoose.model('SalesHistory', SalesHistorySchema);
