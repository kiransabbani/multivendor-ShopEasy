import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Printer, ArrowLeft } from 'lucide-react';

const InvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await invoiceAPI.getById(id);
        setInvoice(res.data);
      } catch (error) {
        // Fallback demo data
        setInvoice({
          invoiceNumber: `INV-${id.substring(0, 8).toUpperCase()}`,
          date: new Date().toISOString(),
          customer: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210' },
          shippingAddress: { street: '123 Tech Park', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
          vendor: { storeName: 'AudioTech India', address: '45 Electronics Ave, Mumbai, 400001', gstNumber: '22AAAAA0000A1Z5' },
          items: [
            { name: 'Wireless Headphones', quantity: 1, unitPrice: 3499, total: 3499 }
          ],
          subTotal: 3499,
          taxRate: 5,
          taxAmount: 175,
          shipping: 0,
          grandTotal: 3674
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div className="text-center py-20 font-bold">Invoice not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
        
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to={`/orders/${id}`} className="inline-flex items-center text-blue-600 font-medium hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Order
          </Link>
          <button onClick={handlePrint} className="btn-primary flex items-center">
            <Printer className="w-4 h-4 mr-2" /> Print / Download PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2 print:text-blue-600">
                ShopAI
              </h1>
              <p className="text-gray-500 text-sm">Tax Invoice / Bill of Supply</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h2>
              <p className="text-gray-600"><span className="font-medium text-gray-900">#{invoice.invoiceNumber}</span></p>
              <p className="text-gray-600">Date: <span className="font-medium text-gray-900">{formatDate(invoice.date)}</span></p>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex justify-between mb-10">
            <div className="w-1/2 pr-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sold By</h3>
              <p className="font-bold text-gray-900">{invoice.vendor?.storeName}</p>
              <p className="text-gray-600 text-sm mt-1">{invoice.vendor?.address}</p>
              {invoice.vendor?.gstNumber && <p className="text-gray-600 text-sm">GSTIN: {invoice.vendor.gstNumber}</p>}
            </div>
            <div className="w-1/2 pl-4 text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-bold text-gray-900">{invoice.customer?.name}</p>
              <p className="text-gray-600 text-sm mt-1">{invoice.shippingAddress?.street}</p>
              <p className="text-gray-600 text-sm">{invoice.shippingAddress?.city}, {invoice.shippingAddress?.state} {invoice.shippingAddress?.zipCode}</p>
              <p className="text-gray-600 text-sm mt-1">Ph: {invoice.customer?.phone || invoice.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left mb-10 border-collapse">
            <thead className="bg-gray-50 text-gray-900 border-y border-gray-200">
              <tr>
                <th className="py-3 px-4 font-bold text-sm">Item Description</th>
                <th className="py-3 px-4 font-bold text-sm text-center">Qty</th>
                <th className="py-3 px-4 font-bold text-sm text-right">Unit Price</th>
                <th className="py-3 px-4 font-bold text-sm text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b border-gray-200">
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 text-gray-800">{item.name}</td>
                  <td className="py-4 px-4 text-gray-800 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-gray-800 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 sm:w-1/3">
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subTotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Shipping</span>
                <span>{invoice.shipping === 0 ? 'Free' : formatCurrency(invoice.shipping)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200 pb-3">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            <p className="mb-1">This is a computer-generated document and does not require a signature.</p>
            <p>Thank you for shopping with ShopAI!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
