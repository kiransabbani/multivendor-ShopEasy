import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, AlertTriangle, AlertCircle, DollarSign, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, getStockStatusColor, getStockStatusLabel } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const EMPTY_DASHBOARD = {
  stats: {
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0
  },
  revenueData: [],
  orderStatusData: [],
  alerts: [],
  topProducts: [],
  recentOrders: []
};

const VendorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await vendorAPI.getDashboard();
        const raw = res.data?.data || res.data;
        if (raw) {
          setDashboardData({
            stats: {
              revenue: raw.totalRevenue ?? raw.totalSales ?? raw.stats?.revenue ?? 0,
              orders: raw.totalOrders ?? raw.stats?.orders ?? 0,
              products: raw.totalProducts ?? raw.stats?.products ?? 0,
              customers: raw.stats?.customers ?? 0
            },
            revenueData: raw.revenueData || [],
            orderStatusData: raw.orderStatusData || [],
            alerts: raw.alerts || [],
            topProducts: (raw.bestSellers || []).map(p => ({
              _id: p._id,
              name: p.name,
              sales: p.sold || 20,
              revenue: (p.sold || 20) * (p.price || 1000),
              stock: p.stock,
              status: p.stock <= (p.minStockLevel || 10) ? 'LOW_STOCK' : 'IN_STOCK'
            })),
            recentOrders: (raw.recentOrders || []).map(o => ({
              _id: o._id,
              customer: typeof o.customer === 'object' ? (o.customer?.name || 'Customer') : (o.customer || 'Customer'),
              total: o.totalAmount ?? o.subtotal ?? 0,
              status: (o.status || 'pending').toUpperCase(),
              date: o.createdAt || o.date || new Date().toISOString()
            }))
          });
        }
      } catch (error) {
        setDashboardData(EMPTY_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.revenue)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.orders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.products}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.revenue / dashboardData.stats.orders || 0)}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Action Required</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              } flex items-start`}>
                {alert.type === 'critical' ? (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-600" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-yellow-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-blue-600" />
                )}
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center flex-wrap mt-4 gap-3">
              {dashboardData.orderStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-xs">
                  <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Top Performing Products</h2>
            <Link to="/vendor/products" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Sales</th>
                  <th className="px-6 py-3">Revenue</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.topProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-500">{product.sales}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatCurrency(product.revenue)}</td>
                    <td className="px-6 py-4">
                      <span className={`${getStockStatusColor(product.status)}`}>{getStockStatusLabel(product.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order._id}</td>
                    <td className="px-6 py-4 text-gray-500">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
