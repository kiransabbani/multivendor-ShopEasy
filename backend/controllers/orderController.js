const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const Commission = require('../models/Commission');
const SalesHistory = require('../models/SalesHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const crypto = require('crypto');

exports.placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Only Cash on Delivery is currently supported' });
    }
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Group items by vendor
    const vendorItems = {};
    cart.items.forEach(item => {
      if (!item.product || !item.product.isActive) {
        throw Object.assign(new Error('Cart contains an unavailable product'), { statusCode: 400 });
      }
      const vendorId = item.product.vendor.toString();
      if (!vendorItems[vendorId]) {
        vendorItems[vendorId] = [];
      }
      vendorItems[vendorId].push(item);
    });

    const orders = [];
    const commissionRate = parseFloat(process.env.COMMISSION_RATE) || 0.10;

    for (const vendorId in vendorItems) {
      const items = vendorItems[vendorId];
      let subtotal = 0;
      const orderItems = items.map(item => {
        if (item.quantity > item.product.stock) {
          throw Object.assign(new Error(`${item.product.name} does not have enough stock`), { statusCode: 400 });
        }
        const price = item.product.price;
        subtotal += price * item.quantity;
        return {
          product: item.product._id,
          name: item.product.name,
          price,
          quantity: item.quantity,
          image: item.product.images[0]
        };
      });

      const tax = subtotal * 0.18;
      const deliveryCharge = subtotal > 999 ? 0 : 50;
      const totalAmount = subtotal + tax + deliveryCharge;
      
      const orderNumber = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

      const order = await Order.create({
        orderNumber,
        customer: req.user.id,
        vendor: vendorId,
        items: orderItems,
        shippingAddress,
        paymentMethod: 'cod',
        subtotal,
        tax,
        deliveryCharge,
        totalAmount,
        notes,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      orders.push(order);

      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      const vendor = await Vendor.findById(vendorId).select('user storeName');
      const notifications = [
        {
          user: vendor.user,
          type: 'order_created',
          title: 'New Order',
          message: `Order ${order.orderNumber} has been placed.`,
          priority: 'high'
        },
        ...admins.map(admin => ({
          user: admin._id,
          type: 'order_created',
          title: 'New Order Received',
          message: `${order.orderNumber} was placed for ${vendor.storeName}.`,
          priority: 'medium'
        }))
      ];
      await Notification.insertMany(notifications);

      // Create Invoice
      const invoiceNumber = 'INV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      await Invoice.create({
        invoiceNumber,
        order: order._id,
        customer: req.user.id,
        vendor: vendorId,
        items: orderItems,
        subtotal,
        tax,
        deliveryCharge,
        totalAmount,
        paymentStatus: order.paymentStatus
      });

      // Process each item: update stock, create commission, sales history, check notifications
      for (const item of items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product._id, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, sold: item.quantity } },
          { new: true }
        );
        if (!product) {
          throw Object.assign(new Error(`${item.product.name} no longer has enough stock`), { statusCode: 409 });
        }

        const commissionAmount = product.price * item.quantity * commissionRate;
        const vendorEarnings = (product.price * item.quantity) - commissionAmount;

        await Commission.create({
          order: order._id,
          product: product._id,
          vendor: vendorId,
          productPrice: product.price,
          commissionRate,
          commissionAmount,
          vendorEarnings
        });

        await SalesHistory.create({
          product: product._id,
          vendor: vendorId,
          date: new Date(),
          quantitySold: item.quantity,
          revenue: product.price * item.quantity,
          price: product.price
        });

        // Notifications
        if (product.stock === 0) {
          const vendorUser = await Vendor.findById(vendorId).select('user');
          await Notification.create({
            user: vendorUser.user,
            type: 'stockout',
            title: 'Product Out of Stock',
            message: `${product.name} is out of stock. Please restock immediately.`,
            priority: 'critical',
            relatedProduct: product._id
          });
        } else if (product.stock <= product.minStockLevel) {
          const vendorUser = await Vendor.findById(vendorId).select('user');
          await Notification.create({
            user: vendorUser.user,
            type: 'reorder',
            title: 'Low Stock Alert',
            message: `${product.name} stock is low (${product.stock} left).`,
            priority: 'high',
            relatedProduct: product._id
          });
        }
      }

      // Update Vendor stats
      await Vendor.findByIdAndUpdate(vendorId, {
        $inc: { totalSales: items.reduce((acc, item) => acc + item.quantity, 0), totalRevenue: totalAmount - tax - deliveryCharge }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email').populate('vendor', 'storeName contactEmail contactPhone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const vendor = req.user.role === 'vendor' ? await Vendor.findOne({ user: req.user.id }) : null;
    const canView = req.user.role === 'admin' ||
      order.customer._id.toString() === req.user.id ||
      (vendor && order.vendor._id.toString() === vendor._id.toString());
    if (!canView) return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.customer.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} status` });
    }

    order.status = 'cancelled';
    await order.save();

    // Restock products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.returnOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.customer.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    order.status = 'returned';
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getVendorOrders = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const orders = await Order.find({ vendor: vendor._id }).sort('-createdAt').populate('customer', 'name email phone');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    const order = await Order.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    // Notify customer
    await Notification.create({
      user: order.customer,
      type: 'order_update',
      title: 'Order Status Updated',
      message: `Your order ${order.orderNumber} is now ${status}.`,
      priority: 'medium'
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
