const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }
    
    wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(id => id.toString() !== req.params.productId);
    await wishlist.save();

    wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};
