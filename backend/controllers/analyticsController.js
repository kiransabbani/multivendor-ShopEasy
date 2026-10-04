const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Commission = require('../models/Commission');
const SalesHistory = require('../models/SalesHistory');
const Forecast = require('../models/Forecast');
const moment = require('moment');

exports.getVendorAnalytics = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const today = moment().startOf('day');
    const startOfWeek = moment().startOf('week');
    const startOfMonth = moment().startOf('month');

    // Sales & Revenue Summary
    const salesSummary = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
    const revenueSummary = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
    const ordersCount = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };

    const orders = await Order.find({ vendor: vendor._id });
    orders.forEach(order => {
      const orderDate = moment(order.createdAt);
      const isToday = orderDate.isSameOrAfter(today);
      const isThisWeek = orderDate.isSameOrAfter(startOfWeek);
      const isThisMonth = orderDate.isSameOrAfter(startOfMonth);

      const itemsSold = order.items.reduce((acc, item) => acc + item.quantity, 0);

      ordersCount.total++;
      salesSummary.total += itemsSold;
      revenueSummary.total += order.subtotal;

      if (isToday) {
        ordersCount.today++;
        salesSummary.today += itemsSold;
        revenueSummary.today += order.subtotal;
      }
      if (isThisWeek) {
        ordersCount.thisWeek++;
        salesSummary.thisWeek += itemsSold;
        revenueSummary.thisWeek += order.subtotal;
      }
      if (isThisMonth) {
        ordersCount.thisMonth++;
        salesSummary.thisMonth += itemsSold;
        revenueSummary.thisMonth += order.subtotal;
      }
    });

    const avgOrderValue = ordersCount.total > 0 ? revenueSummary.total / ordersCount.total : 0;

    // Best and Worst Selling Products
    const products = await Product.find({ vendor: vendor._id }).sort('-sold').populate('category', 'name');
    const bestSellingProducts = products.slice(0, 5).map(p => ({ name: p.name, sold: p.sold, revenue: p.sold * p.price, image: p.images[0] }));
    const worstSellingProducts = [...products].sort((a, b) => a.sold - b.sold).slice(0, 5).map(p => ({ name: p.name, sold: p.sold, revenue: p.sold * p.price, image: p.images[0] }));

    // Category Wise Sales
    const categoryWiseSales = {};
    products.forEach(p => {
      const catName = p.category.name;
      if (!categoryWiseSales[catName]) categoryWiseSales[catName] = 0;
      categoryWiseSales[catName] += p.sold;
    });

    // Daily Sales (last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const dailySalesData = await SalesHistory.aggregate([
      { $match: { vendor: vendor._id, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$quantitySold" },
          revenue: { $sum: "$revenue" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailySales = dailySalesData.map(d => ({ date: d._id, sales: d.sales, revenue: d.revenue }));

    // Monthly Sales (last 12 months)
    const twelveMonthsAgo = moment().subtract(12, 'months').toDate();
    const monthlySalesData = await SalesHistory.aggregate([
      { $match: { vendor: vendor._id, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          sales: { $sum: "$quantitySold" },
          revenue: { $sum: "$revenue" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlySales = monthlySalesData.map(d => ({ month: d._id, sales: d.sales, revenue: d.revenue }));

    // Forecast Accuracy
    const forecasts = await Forecast.find({ vendor: vendor._id });
    const forecastAccuracy = forecasts.length > 0 ? forecasts.reduce((acc, f) => acc + (f.accuracy || 85), 0) / forecasts.length : 85;

    // Inventory Status
    const inventoryStatus = { overstock: 0, sufficient: 0, low: 0, critical: 0 };
    for (const p of products) {
      if (p.stock <= p.minStockLevel) inventoryStatus.critical++;
      else if (p.stock <= p.safetyStock) inventoryStatus.low++;
      else inventoryStatus.sufficient++; // Simple approximation
    }

    res.status(200).json({
      success: true,
      data: {
        salesSummary,
        revenueSummary,
        ordersCount,
        avgOrderValue,
        bestSellingProducts,
        worstSellingProducts,
        categoryWiseSales,
        dailySales,
        monthlySales,
        forecastAccuracy,
        inventoryStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await Vendor.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const approvedVendors = await Vendor.countDocuments({ status: { $in: ['approved', 'active'] } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } });
    const startOfDay = moment().startOf('day').toDate();

    const orders = await Order.find({ status: { $nin: ['cancelled', 'returned'] } }).select('totalAmount');
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfDay },
      status: { $nin: ['cancelled', 'returned'] }
    }).select('totalAmount');
    const todaySales = todayOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    
    const commissions = await Commission.find();
    const totalCommission = commissions.reduce((acc, comm) => acc + comm.commissionAmount, 0);
    const platformRevenue = totalCommission; // Simplification

    const vendors = await Vendor.find().sort('-totalRevenue').limit(5).populate('user', 'name email');
    const topVendors = vendors.map(v => ({ name: v.storeName, revenue: v.totalRevenue, sales: v.totalSales }));

    const products = await Product.find().sort('-sold').limit(5).populate('vendor', 'storeName');
    const topProducts = products.map(p => ({ name: p.name, vendor: p.vendor.storeName, sold: p.sold }));

    const twelveMonthsAgo = moment().subtract(12, 'months').toDate();
    const monthlySalesData = await Order.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const monthlySales = monthlySalesData.map(d => ({ month: d._id, revenue: d.revenue, orders: d.orders }));

    // Category distribution
    const categoryDistributionData = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    await Product.populate(categoryDistributionData, { path: '_id', model: 'Category', select: 'name' });
    const categoryDistribution = categoryDistributionData.map(d => ({ category: d._id ? d._id.name : 'Unknown', count: d.count }));

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const orderStatusDistribution = orderStatusData.map(d => ({ status: d._id, count: d.count }));

    const vendorGrowth = await Vendor.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          vendors: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        pendingVendors,
        approvedVendors,
        pendingOrders,
        totalRevenue,
        todaySales,
        totalCommission,
        platformRevenue,
        topVendors,
        topProducts,
        monthlySales,
        categoryDistribution,
        orderStatusDistribution,
        vendorGrowth: vendorGrowth.map(item => ({ date: item._id, vendors: item.vendors }))
      }
    });
  } catch (error) {
    next(error);
  }
};
