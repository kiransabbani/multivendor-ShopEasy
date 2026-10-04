const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('order').populate('customer', 'name email address').populate('vendor', 'storeName address');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    const vendor = req.user.role === 'vendor' ? await Vendor.findOne({ user: req.user.id }) : null;
    const canView = req.user.role === 'admin' ||
      invoice.customer._id.toString() === req.user.id ||
      (vendor && invoice.vendor._id.toString() === vendor._id.toString());
    if (!canView) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

exports.getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ customer: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};

exports.getVendorInvoices = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    const invoices = await Invoice.find({ vendor: vendor._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};
