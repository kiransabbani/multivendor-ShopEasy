import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatDate, formatCurrency, getOrderStatusColor, getProductImageUrl, handleImageError } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, ChevronRight } from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getMyOrders();
        setOrders(res.data.orders || []);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <Package className="w-8 h-8 mr-3 text-blue-600" /> My Orders
        </h1>

        {/* Status Filters */}
        <div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
          {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 mb-6">Looks like you haven&apos;t placed any orders in this category yet.</p>
            <Link to="/browse" className="btn-primary inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(order.date || order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Total Amount</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                      <p className="text-sm font-bold text-gray-900">{order._id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <Link to={`/orders/${order._id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      Details <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </div>
                
                <div className="p-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center py-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <img 
                        src={getProductImageUrl(item.product)} 
                        alt="product" 
                        onError={(e) => handleImageError(e)}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 mr-4" 
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.product?.name || 'Product Details Unavailable'}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <Link to={`/product/${item.product?._id}`} className="text-blue-600 text-sm font-medium hover:underline hidden sm:block">View Product</Link>
                    </div>
                  ))}
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    {order.status === 'DELIVERED' && (
                      <Link to={`/invoice/${order._id}`} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">View Invoice</Link>
                    )}
                    <Link to={`/orders/${order._id}`} className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center">
                      Order Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
