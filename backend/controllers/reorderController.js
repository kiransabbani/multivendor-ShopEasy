const ReorderRecommendation = require('../models/ReorderRecommendation');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Forecast = require('../models/Forecast');

exports.getReorderRecommendations = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const products = await Product.find({ vendor: vendor._id });
    
    const recommendations = [];

    for (const product of products) {
      const forecast = await Forecast.findOne({ product: product._id }).sort('-createdAt');
      
      let expectedDemand30Day = 0;
      let avgDailyDemand = 0;
      
      if (forecast) {
        expectedDemand30Day = forecast.monthlyForecast;
        avgDailyDemand = forecast.avgDailyDemand;
      } else {
        const daysSinceCreation = Math.max(1, (Date.now() - product.createdAt.getTime()) / (1000 * 3600 * 24));
        avgDailyDemand = product.sold / daysSinceCreation;
        expectedDemand30Day = avgDailyDemand * 30;
      }

      const recommendedReorder = Math.max(0, expectedDemand30Day + product.safetyStock - product.stock);
      const urgencyDays = avgDailyDemand > 0 ? product.stock / avgDailyDemand : 999;
      
      if (product.stock <= avgDailyDemand * product.leadTime + product.safetyStock) {
        let reorder = await ReorderRecommendation.findOne({ product: product._id, status: { $in: ['pending', 'modified'] } });
        
        if (!reorder) {
          reorder = await ReorderRecommendation.create({
            product: product._id,
            vendor: vendor._id,
            currentStock: product.stock,
            expectedDemand30Day,
            safetyStock: product.safetyStock,
            recommendedReorder: Math.round(recommendedReorder),
            urgencyDays: Math.round(urgencyDays)
          });
        } else {
          reorder.currentStock = product.stock;
          reorder.expectedDemand30Day = expectedDemand30Day;
          reorder.recommendedReorder = Math.round(recommendedReorder);
          reorder.urgencyDays = Math.round(urgencyDays);
          await reorder.save();
        }
        
        recommendations.push(reorder);
      }
    }

    const populatedRecommendations = await ReorderRecommendation.find({ _id: { $in: recommendations.map(r => r._id) } }).populate('product', 'name sku image leadTime');
    
    res.status(200).json({ success: true, count: populatedRecommendations.length, data: populatedRecommendations });
  } catch (error) {
    next(error);
  }
};

exports.updateReorderAction = async (req, res, next) => {
  try {
    const { action, modifiedQuantity } = req.body; // accepted, modified, rejected, placed
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const updateData = { status: action };
    if (action === 'modified' && modifiedQuantity) {
      updateData.modifiedQuantity = modifiedQuantity;
    }
    if (action === 'placed') {
      updateData.trackingStatus = 'ordered';
    }
    
    const reorder = await ReorderRecommendation.findOneAndUpdate(
      { _id: req.params.id, vendor: vendor._id },
      updateData,
      { new: true }
    );
    
    if (!reorder) return res.status(404).json({ success: false, message: 'Reorder recommendation not found' });
    
    res.status(200).json({ success: true, data: reorder });
  } catch (error) {
    next(error);
  }
};
