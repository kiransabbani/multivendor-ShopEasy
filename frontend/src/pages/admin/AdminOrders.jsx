import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

const STATUS_TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrders();
      const list = res.data?.data || res.data?.orders || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const status = (order.status || 'PENDING').toUpperCase();
    const matchesFilter = statusFilter === 'ALL' || status === statusFilter;
    
    const custName = typeof order.customer === 'object' ? order.customer?.name : order.customer;
    const storeName = typeof order.vendor === 'object' ? order.vendor?.storeName : order.vendor;
    
    const matchesSearch = !searchQuery ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (custName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (storeName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-red-600" /> Platform Orders Oversight
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor all cross-vendor transactions, payment settlements, and fulfillment across the network.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {STATUS_TABS.map(tab => (
              <button 
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  statusFilter === tab 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Buyer, Store..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/50"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={4} columns={7} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState 
            icon={ShoppingCart}
            title={searchQuery ? "No matching orders" : "No orders in this status"}
            description={searchQuery ? "Try searching with a different keyword or clear your search." : "Orders placed by platform buyers will appear here in real-time."}
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200/80">
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Merchant Store</th>
                  <th className="px-6 py-4">Order Value</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                  <th className="px-6 py-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map(order => {
                  const custName = typeof order.customer === 'object' ? order.customer?.name : order.customer;
                  const custEmail = typeof order.customer === 'object' ? order.customer?.email : '';
                  const storeName = typeof order.vendor === 'object' ? order.vendor?.storeName : order.vendor;

                  return (
                    <tr key={order._id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-red-600 font-mono">{order._id}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.createdAt || order.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">{custName || 'Shopper'}</span>
                        {custEmail && <span className="text-xs text-gray-400">{custEmail}</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {storeName || 'Partner Store'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={(order.status || 'PENDING').toUpperCase()} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Platform Order Snapshot: ${selectedOrder._id}` : 'Order Detail'}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl">
              <div>
                <span className="text-xs text-gray-500 block">Status</span>
                <StatusBadge status={(selectedOrder.status || 'PENDING').toUpperCase()} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Total GMV</span>
                <span className="text-lg font-black text-gray-900">
                  {formatCurrency(selectedOrder.totalAmount || selectedOrder.total || 0)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Platform Commission</span>
                <span className="text-sm font-bold text-emerald-600">
                  +{formatCurrency((selectedOrder.totalAmount || selectedOrder.total || 0) * 0.1)}
                </span>
              </div>
            </div>

            <div className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900">
                  {typeof selectedOrder.customer === 'object' ? selectedOrder.customer?.name : selectedOrder.customer}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Merchant Store:</span>
                <span className="font-semibold text-gray-900">
                  {typeof selectedOrder.vendor === 'object' ? selectedOrder.vendor?.storeName : selectedOrder.vendor}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Placed Date:</span>
                <span className="text-gray-800">
                  {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-medium text-gray-800">{selectedOrder.paymentStatus || 'PAID'} (ONLINE)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200"
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

export default AdminOrders;
