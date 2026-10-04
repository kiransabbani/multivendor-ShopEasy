const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Forecast = require('../models/Forecast');

exports.getInventory = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const products = await Product.find({ vendor: vendor._id });
    
    const inventoryData = [];

    for (const product of products) {
      const forecast = await Forecast.findOne({ product: product._id }).sort('-createdAt');
      
      let avgDailyDemand = 0;
      let forecastedMonthlyDemand = 0;
      
      if (forecast) {
        avgDailyDemand = forecast.avgDailyDemand;
        forecastedMonthlyDemand = forecast.monthlyForecast;
      } else {
        const daysSinceCreation = Math.max(1, (Date.now() - product.createdAt.getTime()) / (1000 * 3600 * 24));
        avgDailyDemand = product.sold / daysSinceCreation;
        forecastedMonthlyDemand = avgDailyDemand * 30;
      }

      const reorderPoint = avgDailyDemand * product.leadTime + product.safetyStock;
      const recommendedInventory = forecastedMonthlyDemand + product.safetyStock;
      const stockDays = avgDailyDemand > 0 ? product.stock / avgDailyDemand : 999;
      
      let status;
      if (product.stock > recommendedInventory * 1.2) {
        status = 'overstock';
      } else if (product.stock >= reorderPoint) {
        status = 'sufficient';
      } else if (product.stock >= reorderPoint * 0.5) {
        status = 'low';
      } else {
        status = 'critical';
      }

      inventoryData.push({
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          image: product.images[0]
        },
        currentStock: product.stock,
        avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
        reorderPoint: Math.round(reorderPoint),
        recommendedInventory: Math.round(recommendedInventory),
        stockDays: Math.round(stockDays),
        status
      });
    }

    res.status(200).json({ success: true, count: inventoryData.length, data: inventoryData });
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.productId, vendor: vendor._id },
      { stock },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
