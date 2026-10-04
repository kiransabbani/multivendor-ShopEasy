const Production = require('../models/Production');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Forecast = require('../models/Forecast');

exports.getProductionRecommendations = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const products = await Product.find({ vendor: vendor._id });
    
    const recommendations = [];

    for (const product of products) {
      const forecast = await Forecast.findOne({ product: product._id }).sort('-createdAt');
      
      let forecastedDemand = 0;
      let historicalAvg = 0;
      
      if (forecast) {
        forecastedDemand = forecast.monthlyForecast;
        // Simple historical avg simulation if no real historical avg available
        historicalAvg = forecast.avgDailyDemand * 30; 
      } else {
        const daysSinceCreation = Math.max(1, (Date.now() - product.createdAt.getTime()) / (1000 * 3600 * 24));
        historicalAvg = (product.sold / daysSinceCreation) * 30;
        forecastedDemand = historicalAvg;
      }

      const requiredProduction = Math.max(0, forecastedDemand + product.safetyStock - product.stock);
      const recommendedProduction = Math.max(0, requiredProduction);
      
      const demandGrowth = historicalAvg > 0 ? ((forecastedDemand - historicalAvg) / historicalAvg) * 100 : 0;
      
      let hikeLabel = 'no_increase';
      if (demandGrowth >= 50) hikeLabel = 'critical';
      else if (demandGrowth >= 25) hikeLabel = 'high';
      else if (demandGrowth >= 10) hikeLabel = 'moderate';
      
      let reason = 'Demand is stable.';
      if (hikeLabel === 'critical') reason = `Critical demand increase of ${Math.round(demandGrowth)}% detected. Immediate production hike required.`;
      else if (hikeLabel === 'high') reason = `High demand increase of ${Math.round(demandGrowth)}% detected. Recommend increasing production.`;
      else if (hikeLabel === 'moderate') reason = `Moderate demand increase of ${Math.round(demandGrowth)}% detected.`;

      let production = await Production.findOne({ product: product._id, status: { $in: ['pending', 'accepted', 'started'] } });
      
      if (!production && recommendedProduction > 0) {
        production = await Production.create({
          product: product._id,
          vendor: vendor._id,
          currentStock: product.stock,
          forecastedDemand,
          safetyStock: product.safetyStock,
          productionCapacity: product.productionCapacity,
          requiredProduction,
          recommendedProduction,
          hikeLabel,
          hikePercentage: Math.round(demandGrowth),
          reason,
          demandGrowth: Math.round(demandGrowth * 100) / 100
        });
      } else if (production && production.status === 'pending') {
        production.forecastedDemand = forecastedDemand;
        production.currentStock = product.stock;
        production.requiredProduction = requiredProduction;
        production.recommendedProduction = recommendedProduction;
        production.hikeLabel = hikeLabel;
        production.hikePercentage = Math.round(demandGrowth);
        production.reason = reason;
        production.demandGrowth = Math.round(demandGrowth * 100) / 100;
        await production.save();
      }

      if (production) {
        recommendations.push(production);
      }
    }

    const populatedRecommendations = await Production.find({ _id: { $in: recommendations.map(r => r._id) } }).populate('product', 'name sku image productionCapacity');
    
    res.status(200).json({ success: true, count: populatedRecommendations.length, data: populatedRecommendations });
  } catch (error) {
    next(error);
  }
};

exports.updateProductionAction = async (req, res, next) => {
  try {
    const { action } = req.body; // accepted, rejected, started, completed
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const production = await Production.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      { status: action, vendorAction: action },
      { new: true }
    );
    
    if (!production) return res.status(404).json({ success: false, message: 'Production record not found' });
    
    if (action === 'completed') {
      await Product.findByIdAndUpdate(production.product, { $inc: { stock: production.recommendedProduction } });
    }
    
    res.status(200).json({ success: true, data: production });
  } catch (error) {
    next(error);
  }
};
