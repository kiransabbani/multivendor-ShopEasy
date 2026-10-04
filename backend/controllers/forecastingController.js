const Forecast = require('../models/Forecast');
const SalesHistory = require('../models/SalesHistory');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const axios = require('axios');
const moment = require('moment');

exports.runForecast = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const product = await Product.findOne({ _id: productId, vendor: vendor._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const salesData = await SalesHistory.find({ product: productId }).sort('date');
    
    if (salesData.length < 7) {
      return res.status(400).json({ success: false, message: 'Not enough data to run forecast. Need at least 7 days of sales history.' });
    }

    let forecastData;
    
    try {
      const formattedData = salesData.map(s => ({ date: moment(s.date).format('YYYY-MM-DD'), quantity: s.quantitySold, price: s.price || 0, is_promotion: s.isPromotion || false }));
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/forecast`, { product_id: productId, sales_history: formattedData, horizon_days: 30 }, {
        timeout: 15000,
        headers: process.env.ML_SERVICE_API_KEY ? { 'X-ML-Service-Key': process.env.ML_SERVICE_API_KEY } : undefined
      });
      forecastData = mlResponse.data;
    } catch (error) {
      console.log('ML Service unavailable, falling back to JS implementation');
      
      // Fallback: Exponential smoothing
      const alpha = 0.3;
      let smoothed = salesData[0].quantitySold;
      
      for (let i = 1; i < salesData.length; i++) {
        smoothed = alpha * salesData[i].quantitySold + (1 - alpha) * smoothed;
      }
      
      const last30Days = salesData.slice(-30);
      const avgDaily = last30Days.reduce((acc, val) => acc + val.quantitySold, 0) / last30Days.length;
      
      const dailyForecasts = [];
      let currentPrediction = smoothed;
      const trend = avgDaily > salesData.slice(-60, -30).reduce((acc, val) => acc + val.quantitySold, 0) / 30 ? 'up' : 'down';
      
      for (let i = 1; i <= 30; i++) {
        // Add slight trend noise
        currentPrediction = currentPrediction * (trend === 'up' ? 1.01 : 0.99);
        dailyForecasts.push({
          date: moment().add(i, 'days').toDate(),
          predicted: Math.max(0, Math.round(currentPrediction)),
          confidence: 0.85
        });
      }
      
      const monthlyForecast = dailyForecasts.reduce((acc, val) => acc + val.predicted, 0);
      
      forecastData = {
        dailyForecasts,
        weeklyForecast: Math.round(monthlyForecast / 4),
        monthlyForecast,
        avgDailyDemand: Math.round(avgDaily),
        trend,
        algorithm: 'exponential_smoothing',
        accuracy: 0.85
      };
    }

    const forecast = await Forecast.findOneAndUpdate(
      { product: productId },
      {
        vendor: vendor._id,
        forecastDate: Date.now(),
        ...forecastData
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

exports.getForecast = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const forecast = await Forecast.findOne({ product: productId, vendor: vendor._id }).sort('-createdAt');
    if (!forecast) return res.status(404).json({ success: false, message: 'Forecast not found' });
    
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

exports.getAllForecasts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const forecasts = await Forecast.find({ vendor: vendor._id }).populate('product', 'name stock image').sort('-createdAt');
    
    // Group by product to get latest only
    const latestForecasts = [];
    const productIds = new Set();
    
    for (const f of forecasts) {
      if (!productIds.has(f.product._id.toString())) {
        latestForecasts.push(f);
        productIds.add(f.product._id.toString());
      }
    }
    
    res.status(200).json({ success: true, count: latestForecasts.length, data: latestForecasts });
  } catch (error) {
    next(error);
  }
};
