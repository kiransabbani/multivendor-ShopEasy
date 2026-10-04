import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Package, DollarSign, Check, X, TrendingUp, Clock, UserPlus, Sparkles, Mail } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    vendors: 0,
    products: 0,
    pendingVendors: 0,
    approvedVendors: 0,
    orders: 0,
    pendingOrders: 0,
    todaySales: 0,
    commission: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [analyticsRes, vendorsRes, usersRes, productsRes] = await Promise.allSettled([
        adminAPI.getAnalytics(),
        adminAPI.getVendors(),
        adminAPI.getUsers(),
        adminAPI.getProducts(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
        const d = analyticsRes.value.data.data || analyticsRes.value.data;
        setStats({
          users: d.totalUsers || 0,
          vendors: d.totalVendors || 0,
          products: d.totalProducts || 0,
          pendingVendors: d.pendingVendors || 0,
          approvedVendors: d.approvedVendors || 0,
          orders: d.totalOrders || 0,
          pendingOrders: d.pendingOrders || 0,
          todaySales: d.todaySales || 0,
          commission: d.totalCommission || d.platformRevenue || 0,
        });
        setSalesData(d.monthlySales || []);
      }

      if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.data) {
        const vList = vendorsRes.value.data.data || vendorsRes.value.data || [];
        const pending = vList.filter(v => v.status === 'pending');
        setPendingVendors(pending);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        const users = usersRes.value.data.data || usersRes.value.data.users || usersRes.value.data || [];
        setNewCustomers(users.slice(0, 5));
      }

      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const products = productsRes.value.data.data || productsRes.value.data.products || productsRes.value.data || [];
        setRecommendedProducts(products.slice(0, 4));
      }
      setLastUpdated(new Date());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <TableSkeleton />;

  const handleApprove = async (id, name) => {
    setActionId(id);
    try {
      await adminAPI.approveVendor(id);
      toast.success(`${name} approved successfully!`);
      setPendingVendors(prev => prev.filter(v => v._id !== id));
      setStats(prev => ({ ...prev, vendors: prev.vendors + 1 }));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to approve ${name}`);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id, name) => {
    setActionId(id);
    try {
      await adminAPI.rejectVendor(id);
      toast.success(`Application for ${name} rejected`);
      setPendingVendors(prev => prev.filter(v => v._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to reject ${name}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Master Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            Global metrics, merchant applications, commission flows, and multi-vendor oversight.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Live · {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Link
            to="/admin/vendors"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Manage All Merchants
          </Link>
        </div>
      </div>
      
      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Buyers</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.users.toLocaleString()}</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center mt-1.5">
              <span>Registered customers</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Merchants</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.vendors.toLocaleString()}</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center mt-1.5">
              <span>{stats.pendingVendors} pending approval</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Catalog SKUs</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.products.toLocaleString()}</p>
            <span className="text-xs font-semibold text-blue-600 flex items-center mt-1.5">
              <Package className="w-3.5 h-3.5 mr-1" /> Live catalog count
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(stats.commission)}</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center mt-1.5">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Today: {formatCurrency(stats.todaySales)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Revenue Chart + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marketplace GMV Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Gross Merchandise Value & Take Rate</h2>
              <p className="text-xs text-gray-500 mt-0.5">Platform sales volume vs 10% commission captured</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Active Growth
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(v, name) => [formatCurrency(v), name === 'revenue' ? 'Gross GMV' : 'Commission Cut']} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gmvGrad)" />
                <Area type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" /> New Customers
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Latest customer registrations, updated live.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {newCustomers.length} shown
                </span>
              </div>
              {newCustomers.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">No customer registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {newCustomers.map(customer => (
                    <div key={customer._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {(customer.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 truncate">{customer.name || 'Unnamed customer'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" /> New Product Recommendations
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Recently added products across the marketplace.</p>
                </div>
                <Link to="/admin/products" className="text-xs font-semibold text-blue-600 hover:underline">View catalog</Link>
              </div>
              {recommendedProducts.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">No products available yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedProducts.map(product => {
                    const category = typeof product.category === 'object' ? product.category?.name : product.category;
                    return (
                      <div key={product._id} className="p-3 rounded-xl border border-gray-100">
                        <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate">{product.vendor?.storeName || 'Marketplace seller'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-purple-600 font-medium">{category || 'General'}</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        {/* Pending Merchant Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Merchant Applications</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pendingVendors.length} Pending
              </span>
            </div>
            
            <div className="space-y-3">
              {pendingVendors.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  All seller onboarding requests have been reviewed.
                </div>
              ) : (
                pendingVendors.map((vendor) => (
                  <div key={vendor._id} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{vendor.storeName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{vendor.user?.email || 'New Merchant'}</p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(vendor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-100">
                      <button 
                        disabled={actionId === vendor._id}
                        onClick={() => handleApprove(vendor._id, vendor.storeName)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        disabled={actionId === vendor._id}
                        onClick={() => handleReject(vendor._id, vendor.storeName)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <Link 
              to="/admin/vendors" 
              className="text-xs text-center block font-semibold text-blue-600 hover:underline"
            >
              View All Registered Merchants →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
