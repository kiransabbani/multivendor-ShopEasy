const express = require('express');
const { getInvoice, getMyInvoices, getVendorInvoices } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my-invoices', authorize('customer'), getMyInvoices);
router.get('/vendor/invoices', authorize('vendor'), getVendorInvoices);
router.get('/:id', getInvoice);

module.exports = router;
