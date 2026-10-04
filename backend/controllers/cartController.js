const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { product, quantity } = req.body;
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'A valid product and positive integer quantity are required' });
    }
    const productDoc = await Product.findOne({ _id: product, isActive: true });
    if (!productDoc) return res.status(404).json({ success: false, message: 'Product not found' });
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [{ product, quantity, price: productDoc.price }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        if (cart.items[itemIndex].quantity > productDoc.stock) {
          return res.status(400).json({ success: false, message: `Only ${productDoc.stock} units are available` });
        }
      } else {
        if (quantity > productDoc.stock) {
          return res.status(400).json({ success: false, message: `Only ${productDoc.stock} units are available` });
        }
        cart.items.push({ product, quantity, price: productDoc.price });
      }
      await cart.save();
    }
    
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { product, quantity } = req.body;
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'A valid product and positive integer quantity are required' });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
    if (itemIndex > -1) {
      const productDoc = await Product.findOne({ _id: product, isActive: true });
      if (!productDoc) return res.status(404).json({ success: false, message: 'Product not found' });
      if (quantity > productDoc.stock) {
        return res.status(400).json({ success: false, message: `Only ${productDoc.stock} units are available` });
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = productDoc.price;
      await cart.save();
    } else {
      return res.status(404).json({ success: false, message: 'Product is not in the cart' });
    }
    
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();

    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};
