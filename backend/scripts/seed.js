const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');
const crypto = require('crypto');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

// Load models
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Commission = require('../models/Commission');
const SalesHistory = require('../models/SalesHistory');

const categoriesData = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Home & Living', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Books', icon: '📚' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Toys', icon: '🎮' },
  { name: 'Food & Grocery', icon: '🛒' }
];

const vendorsData = [
  { storeName: 'TechMart', desc: 'Best electronics', type: 'Electronics' },
  { storeName: 'FashionHub', desc: 'Latest fashion', type: 'Clothing' },
  { storeName: 'HomeDecor Pro', desc: 'Beautiful home', type: 'Home & Living' },
  { storeName: 'SportZone', desc: 'Sports gear', type: 'Sports' },
  { storeName: 'BookWorld', desc: 'All the books', type: 'Books' }
];

const productsData = [
  { name: 'Wireless Headphones', price: 2999, stock: 180, vendorIndex: 0, catIndex: 0 },
  { name: 'Smart Watch', price: 8999, stock: 95, vendorIndex: 0, catIndex: 0 },
  { name: 'Laptop Bag', price: 1499, stock: 30, vendorIndex: 0, catIndex: 0 },
  { name: 'Bluetooth Speaker', price: 3499, stock: 60, vendorIndex: 0, catIndex: 0 },
  { name: 'Men\'s T-Shirt', price: 599, stock: 250, vendorIndex: 1, catIndex: 1 },
  { name: 'Women\'s Dress', price: 1299, stock: 120, vendorIndex: 1, catIndex: 1 },
  { name: 'Running Shoes', price: 2499, stock: 75, vendorIndex: 1, catIndex: 1 },
  { name: 'Yoga Mat', price: 899, stock: 45, vendorIndex: 3, catIndex: 3 },
  { name: 'Dumbbell Set', price: 4599, stock: 20, vendorIndex: 3, catIndex: 3 },
  { name: 'Football', price: 799, stock: 85, vendorIndex: 3, catIndex: 3 },
  { name: 'Sofa Cushions Set', price: 1299, stock: 55, vendorIndex: 2, catIndex: 2 },
  { name: 'Wall Art Canvas', price: 2199, stock: 38, vendorIndex: 2, catIndex: 2 },
  { name: 'Table Lamp', price: 1899, stock: 42, vendorIndex: 2, catIndex: 2 },
  { name: 'Novel: The Midnight Library', price: 349, stock: 200, vendorIndex: 4, catIndex: 4 },
  { name: 'Python Programming Guide', price: 499, stock: 150, vendorIndex: 4, catIndex: 4 },
  { name: 'Children\'s Story Collection', price: 299, stock: 175, vendorIndex: 4, catIndex: 4 },
  { name: 'Face Serum Set', price: 1599, stock: 65, vendorIndex: 0, catIndex: 5 },
  { name: 'Hair Care Kit', price: 1199, stock: 90, vendorIndex: 1, catIndex: 5 },
  { name: 'LEGO Building Set', price: 3299, stock: 35, vendorIndex: 2, catIndex: 6 },
  { name: 'Organic Spices Pack', price: 499, stock: 110, vendorIndex: 3, catIndex: 7 },
  { name: '4K Smart LED Television', price: 32999, stock: 24, vendorIndex: 0, catIndex: 0 },
  { name: 'USB-C Fast Charging Power Bank', price: 1799, stock: 140, vendorIndex: 0, catIndex: 0 },
  { name: 'Linen Blend Everyday Kurta', price: 1899, stock: 85, vendorIndex: 1, catIndex: 1 },
  { name: 'Adjustable Standing Desk', price: 15499, stock: 18, vendorIndex: 2, catIndex: 2 },
  { name: 'Insulated Stainless Steel Bottle', price: 999, stock: 120, vendorIndex: 2, catIndex: 2 },
  { name: 'Resistance Bands Training Kit', price: 1299, stock: 70, vendorIndex: 3, catIndex: 3 },
  { name: 'The Art of Everyday Cooking', price: 699, stock: 95, vendorIndex: 4, catIndex: 4 },
  { name: 'Daily Wellness Herbal Tea Box', price: 549, stock: 130, vendorIndex: 3, catIndex: 7 }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Vendor.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Invoice.deleteMany();
    await Commission.deleteMany();
    await SalesHistory.deleteMany();

    console.log('Data Cleared...');

    // Users
    const adminUser = await User.create({ name: 'Admin', email: 'admin@multivendor.com', password: 'admin123', role: 'admin' });
    
    const vendorUsers = [];
    const vendors = [];
    for (let i = 0; i < 5; i++) {
      const user = await User.create({ name: `Vendor ${i+1}`, email: `vendor${i+1}@multivendor.com`, password: 'vendor123', role: 'vendor' });
      vendorUsers.push(user);
      const vendor = await Vendor.create({
        user: user._id,
        storeName: vendorsData[i].storeName,
        storeDescription: vendorsData[i].desc,
        status: 'approved'
      });
      vendors.push(vendor);
    }

    const customers = [];
    for (let i = 1; i <= 10; i++) {
      const user = await User.create({ name: `Customer ${i}`, email: `customer${i}@example.com`, password: 'customer123', role: 'customer' });
      customers.push(user);
    }

    // Categories
    const categories = [];
    for (const cat of categoriesData) {
      const category = await Category.create({ name: cat.name, slug: cat.name.toLowerCase().replace(/ /g, '-'), icon: cat.icon });
      categories.push(category);
    }

    // Products
    const products = [];
    for (const p of productsData) {
      const product = await Product.create({
        name: p.name,
        description: `Description for ${p.name}`,
        price: p.price,
        stock: p.stock,
        vendor: vendors[p.vendorIndex]._id,
        category: categories[p.catIndex]._id,
        minStockLevel: 10,
        safetyStock: Math.floor(Math.random() * 30) + 20,
        productionCapacity: Math.floor(Math.random() * 200) + 100,
        leadTime: Math.floor(Math.random() * 5) + 5,
        images: ['https://via.placeholder.com/150']
      });
      products.push(product);
    }

    // Sales History (90 days)
    const currentSeason = 'autumn'; // Or derive from date
    for (const product of products) {
      let baseDemand;
      if (product.category.toString() === categories[0]._id.toString()) baseDemand = 15;
      else if (product.category.toString() === categories[1]._id.toString()) baseDemand = 20;
      else if (product.category.toString() === categories[4]._id.toString()) baseDemand = 10;
      else if (product.category.toString() === categories[3]._id.toString()) baseDemand = 7;
      else baseDemand = 5;

      for (let i = 90; i > 0; i--) {
        const date = moment().subtract(i, 'days').toDate();
        const isWeekend = moment(date).isoWeekday() > 5;
        const multiplier = isWeekend ? 1.3 : 1;
        const noise = (Math.random() * 0.4) + 0.8; // 0.8 to 1.2
        const quantitySold = Math.round(baseDemand * multiplier * noise);

        if (quantitySold > 0) {
          await SalesHistory.create({
            product: product._id,
            vendor: product.vendor,
            date,
            quantitySold,
            revenue: quantitySold * product.price,
            price: product.price,
            season: currentSeason
          });
          
          product.sold += quantitySold;
        }
      }
      await product.save();
    }

    // Orders (30 orders)
    for (let i = 0; i < 30; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const vendorProducts = products.filter(p => p.vendor.toString() === vendor._id.toString());
      
      if (vendorProducts.length === 0) continue;

      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        items.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0]
        });
        subtotal += product.price * quantity;
      }

      const tax = subtotal * 0.18;
      const deliveryCharge = 50;
      const totalAmount = subtotal + tax + deliveryCharge;
      const status = ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)];

      const orderNumber = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

      const order = await Order.create({
        orderNumber,
        customer: customer._id,
        vendor: vendor._id,
        items,
        paymentMethod: 'online',
        paymentStatus: status === 'delivered' ? 'paid' : 'pending',
        status,
        subtotal,
        tax,
        deliveryCharge,
        totalAmount,
        createdAt: moment().subtract(Math.floor(Math.random() * 30), 'days').toDate()
      });

      const invoiceNumber = 'INV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      await Invoice.create({
        invoiceNumber,
        order: order._id,
        customer: customer._id,
        vendor: vendor._id,
        items,
        subtotal,
        tax,
        deliveryCharge,
        totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      });

      for (const item of items) {
        await Commission.create({
          order: order._id,
          product: item.product,
          vendor: vendor._id,
          productPrice: item.price,
          commissionRate: 0.10,
          commissionAmount: item.price * item.quantity * 0.10,
          vendorEarnings: (item.price * item.quantity) * 0.90,
          createdAt: order.createdAt
        });
      }

      vendor.totalSales += items.reduce((acc, it) => acc + it.quantity, 0);
      vendor.totalRevenue += subtotal;
      await vendor.save();
    }

    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Vendors: ${await Vendor.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Sales History: ${await SalesHistory.countDocuments()}`);
    console.log(`Orders: ${await Order.countDocuments()}`);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await importData();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
