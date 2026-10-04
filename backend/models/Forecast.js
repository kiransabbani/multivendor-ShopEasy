const mongoose = require('mongoose');

const ForecastSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  forecastDate: { type: Date, default: Date.now },
  dailyForecasts: [{
    date: Date,
    predicted: Number,
    confidence: Number
  }],
  weeklyForecast: Number,
  monthlyForecast: Number,
  avgDailyDemand: Number,
  trend: { type: String, enum: ['up', 'down', 'stable'] },
  algorithm: { type: String, enum: ['lstm', 'exponential_smoothing'] },
  accuracy: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Forecast', ForecastSchema);
