import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatDateTime, formatCurrency, getOrderStatusColor, getProductImageUrl, handleImageError } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircle, Truck, Package, XCircle, ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getById(id);
        setOrder(res.data);
      } catch (error) {
        // Fallback for demo
        setOrder({
          _id: id || 'ORD-89301',
          date: new Date().toISOString(),
          status: 'PROCESSING',
          paymentMethod: 'ONLINE',
          subTotal: 3499,
          shippingFee: 0,
          tax: 175,
          totalAmount: 3674,
          shippingAddress: { street: '123 Tech Park', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', phone: '9876543210' },
          items: [
            { product: { _id: '1', name: 'Wireless Noise Canceling Headphones', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'] }, price: 3499, quantity: 1, vendor: { storeName: 'AudioTech India' } }
          ],
          trackingHistory: [
            { status: 'PENDING', date: new Date(Date.now() - 86400000).toISOString(), note: 'Order placed successfully' },
            { status: 'PROCESSING', date: new Date().toISOString(), note: 'Seller is preparing your order' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersAPI.cancel(id);
      toast.success('Order cancelled successfully');
      setOrder(prev => ({...prev, status: 'CANCELLED'}));
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-20 font-bold">Order not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/orders" className="inline-flex items-center text-blue-600 font-medium mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order._id}</h1>
              <p className="text-gray-500 text-sm mt-1">Placed on {formatDateTime(order.date)}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`${getOrderStatusColor(order.status)} text-sm px-3 py-1`}>{order.status}</span>
              {order.status === 'DELIVERED' && (
                <button onClick={() => navigate(`/invoice/${order._id}`)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg flex items-center text-sm font-medium transition-colors">
                  <Download className="w-4 h-4 mr-1" /> Invoice
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'CANCELLED' && (
            <div className="p-8 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
                <div className="space-y-8 relative z-10">
                  <div className="flex items-start">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white ${['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="ml-6 mt-3">
                      <h4 className="font-bold text-gray-900">Order Placed</h4>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="ml-6 mt-3">
                      <h4 className="font-bold text-gray-900">Processing</h4>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white ${['DELIVERED'].includes(order.status) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="ml-6 mt-3">
                      <h4 className="font-bold text-gray-900">Delivered</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {order.status === 'CANCELLED' && (
            <div className="p-8 border-b border-gray-100 bg-red-50 flex items-center">
              <XCircle className="w-10 h-10 text-red-500 mr-4" />
              <div>
                <h3 className="font-bold text-red-800 text-lg">Order Cancelled</h3>
                <p className="text-red-600">This order has been cancelled and will not be processed.</p>
              </div>
            </div>
          )}

          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Items Ordered</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <img 
                      src={getProductImageUrl(item.product)} 
                      alt="product" 
                      onError={(e) => handleImageError(e)}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 mr-4" 
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{item.product?.name}</h4>
                      <p className="text-sm text-gray-500 mb-1">Sold by: {item.vendor?.storeName || 'Vendor'}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Shipping Information</h3>
            <div className="text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>PIN: {order.shippingAddress?.zipCode}</p>
              <p className="pt-2">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-gray-600 mb-4 border-b border-gray-100 pb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subTotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-bold text-blue-600 text-xl">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Payment Method: <span className="font-medium text-gray-900">{order.paymentMethod === 'ONLINE' ? 'Prepaid (Online)' : 'Cash on Delivery'}</span>
            </div>
          </div>
        </div>

        {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
          <div className="flex justify-end">
            <button 
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
