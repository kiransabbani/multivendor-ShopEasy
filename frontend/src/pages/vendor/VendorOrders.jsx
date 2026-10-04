import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Truck, CheckCircle2, Clock, Search, PackageCheck, MapPin, User } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { formatCurrency, formatDate, getProductImageUrl } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const INITIAL_DEMO_ORDERS = [
  { 
    _id: 'ORD-9821', 
    customer: { name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+91 98765 43210' }, 
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), 
    totalAmount: 8998,
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    shippingAddress: { street: '124 MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', zipCode: '560038' },
    items: [
      { product: { name: 'Wireless Noise-Canceling Earbuds Pro', price: 4499, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&q=80'] }, quantity: 2, price: 4499 }
    ]
  },
  { 
    _id: 'ORD-9819', 
    customer: { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 91234 56789' }, 
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    totalAmount: 5999, 
    status: 'PROCESSING', 
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    shippingAddress: { street: '45 Lake View Heights, Powai', city: 'Mumbai', state: 'Maharashtra', zipCode: '400076' },
    items: [
      { product: { name: 'Smart Fitness Tracker & Watch', price: 5999, images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=100&q=80'] }, quantity: 1, price: 5999 }
    ]
  },
  { 
    _id: 'ORD-9805', 
    customer: { name: 'Amit Kumar', email: 'amit.k@example.com', phone: '+91 99887 76655' }, 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
    totalAmount: 2499, 
    status: 'SHIPPED', 
    paymentStatus: 'PAID',
    paymentMethod: 'NETBANKING',
    shippingAddress: { street: '78 Sector 18', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301' },
    items: [
      { product: { name: 'Portable Bluetooth 360 Bass Speaker', price: 2499, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&q=80'] }, quantity: 1, price: 2499 }
    ]
  },
  { 
    _id: 'ORD-9788', 
    customer: { name: 'Sneha Reddy', email: 'sneha.r@example.com', phone: '+91 98490 12345' }, 
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), 
    totalAmount: 12999, 
    status: 'DELIVERED', 
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    shippingAddress: { street: '12 Jubilee Hills Road 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' },
    items: [
      { product: { name: 'Premium Leather Ergonomic Office Chair', price: 12999, images: ['https://images.unsplash.com/photo-1580481077195-c94318c5e9c0?w=100&q=80'] }, quantity: 1, price: 12999 }
    ]
  }
];

const STATUS_TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const VendorOrders = () => {
  void INITIAL_DEMO_ORDERS;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getVendorOrders();
      const list = res.data?.data || res.data?.orders || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (error) {
      setOrders([]);
      toast.error(error.response?.data?.message || 'Failed to load vendor orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const orderStatus = (order.status || '').toUpperCase();
    const matchesFilter = filter === 'ALL' || orderStatus === filter;
    
    const customerName = typeof order.customer === 'object' ? order.customer?.name : order.customer;
    const matchesSearch = !searchQuery || 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Fulfillment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track, process, and ship incoming customer orders in real-time.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {STATUS_TABS.map(tab => (
              <button 
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  filter === tab 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState 
            icon={PackageCheck}
            title={searchQuery ? "No matching orders found" : "No orders in this category"}
            description={searchQuery ? "Try searching for a different order ID or customer name." : "Orders placed by customers will show up here for shipping and fulfillment."}
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200/80">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map(order => {
                  const customerName = typeof order.customer === 'object' ? (order.customer?.name || 'Customer') : (order.customer || 'Customer');
                  const customerEmail = typeof order.customer === 'object' ? order.customer?.email : '';
                  const totalItems = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || order.itemsCount || 1;
                  const currentStatus = (order.status || 'PENDING').toUpperCase();

                  return (
                    <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleOpenDetail(order)}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline font-mono"
                        >
                          {order._id}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(order.createdAt || order.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{customerName}</div>
                        {customerEmail && <div className="text-xs text-gray-400">{customerEmail}</div>}
                        <div className="text-xs text-gray-500 mt-0.5">{totalItems} item{totalItems > 1 ? 's' : ''}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={currentStatus} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenDetail(order)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentStatus === 'PENDING' && (
                            <button 
                              onClick={() => handleUpdateStatus(order._id, 'PROCESSING')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" /> Accept
                            </button>
                          )}

                          {currentStatus === 'PROCESSING' && (
                            <button 
                              onClick={() => handleUpdateStatus(order._id, 'SHIPPED')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" /> Ship Order
                            </button>
                          )}

                          {currentStatus === 'SHIPPED' && (
                            <button 
                              onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedOrder ? `Order Details — ${selectedOrder._id}` : 'Order Details'}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Date Bar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/80 gap-3">
              <div>
                <span className="text-xs text-gray-500 block">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={(selectedOrder.status || 'PENDING').toUpperCase()} />
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">Placed On</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-500 block">Payment</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {selectedOrder.paymentStatus || 'PAID'} • {selectedOrder.paymentMethod || 'ONLINE'}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <User className="w-4 h-4 text-blue-600" /> Customer Information
                </div>
                <p className="font-semibold text-gray-900">
                  {typeof selectedOrder.customer === 'object' ? selectedOrder.customer?.name : selectedOrder.customer}
                </p>
                {selectedOrder.customer?.email && (
                  <p className="text-xs text-gray-600 mt-0.5">{selectedOrder.customer.email}</p>
                )}
                {selectedOrder.customer?.phone && (
                  <p className="text-xs text-gray-600 mt-0.5">{selectedOrder.customer.phone}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Shipping Destination
                </div>
                <p className="text-sm text-gray-800">
                  {selectedOrder.shippingAddress?.street || 'Default Shipping Address'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.state, selectedOrder.shippingAddress?.zipCode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Ordered Items
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => {
                  const productObj = item.product || {};
                  const productName = productObj.name || item.name || 'Purchased Product';
                  const productImage = getProductImageUrl(productObj);
                  const itemPrice = item.price || productObj.price || 0;
                  const itemQty = item.quantity || 1;

                  return (
                    <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={productImage} 
                          alt={productName} 
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{productName}</p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(itemPrice)} × {itemQty}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        {formatCurrency(itemPrice * itemQty)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total Breakdown */}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total Paid by Customer</span>
              <span className="text-xl font-black text-blue-600">
                {formatCurrency(selectedOrder.totalAmount || selectedOrder.total || 0)}
              </span>
            </div>

            {/* Action Buttons inside modal */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {selectedOrder.status === 'PENDING' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'PROCESSING')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Confirm & Process Order
                </button>
              )}
              {selectedOrder.status === 'PROCESSING' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'SHIPPED')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" /> Ship Order
                </button>
              )}
              {selectedOrder.status === 'SHIPPED' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'DELIVERED')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorOrders;
