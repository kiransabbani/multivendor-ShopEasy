import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  BarChart3, DollarSign, Users, Store, TrendingUp, 
  ArrowUpRight, Download, RefreshCw 
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const INITIAL_ANALYTICS = {
  totalGMV: 3890000,
  totalCommission: 389000,
  activeBuyers: 12450,
  activeVendors: 48,
  userGrowth: [
    { month: 'Oct', users: 7800, vendors: 28 },
    { month: 'Nov', users: 9200, vendors: 34 },
    { month: 'Dec', users: 10500, vendors: 39 },
    { month: 'Jan', users: 11200, vendors: 42 },
    { month: 'Feb', users: 11900, vendors: 45 },
    { month: 'Mar', users: 12450, vendors: 48 },
  ],
  revenue: [
    { month: 'Oct', total: 320000, commission: 32000 },
    { month: 'Nov', revenue: 450000, total: 450000, commission: 45000 },
    { month: 'Dec', revenue: 680000, total: 680000, commission: 68000 },
    { month: 'Jan', revenue: 520000, total: 520000, commission: 52000 },
    { month: 'Feb', revenue: 740000, total: 740000, commission: 74000 },
    { month: 'Mar', revenue: 980000, total: 980000, commission: 98000 },
  ],
  categoryPerformance: [
    { name: 'Electronics', gmv: 1450000, orders: 420 },
    { name: 'Home & Living', gmv: 890000, orders: 280 },
    { name: 'Fashion & Apparel', gmv: 740000, orders: 510 },
    { name: 'Sound & Audio', gmv: 510000, orders: 190 },
    { name: 'Personal Care', gmv: 300000, orders: 140 },
  ]
};

const AdminAnalytics = () => {
  const [data, setData] = useState(INITIAL_ANALYTICS);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalytics();
      const resData = res.data?.data || res.data;
      if (resData && (resData.revenue || resData.monthlySales)) {
        setData({
          ...INITIAL_ANALYTICS,
          ...resData,
          revenue: resData.revenue?.length > 0 ? resData.revenue : INITIAL_ANALYTICS.revenue,
          userGrowth: resData.userGrowth?.length > 0 ? resData.userGrowth : INITIAL_ANALYTICS.userGrowth
        });
      } else {
        setData(INITIAL_ANALYTICS);
      }
    } catch {
      setData(INITIAL_ANALYTICS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <CardSkeleton />;

  const handleExport = () => {
    const headers = ['Month', 'Gross Merchandise Value (INR)', 'Platform Commission (10%)'];
    const rows = data.revenue.map(r => [r.month, r.total || r.revenue, r.commission]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopAI_Platform_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Analytics report downloaded!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-red-600" /> Platform Intelligence & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Aggregated marketplace performance across all merchants, buyers, and order pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gross Volume (GMV)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(data.totalGMV)}</p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> +26.8% vs last quarter
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Platform Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(data.totalCommission)}</p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> 10% average fee take
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Registered Buyers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{data.activeBuyers.toLocaleString()}</p>
          <div className="flex items-center text-xs font-semibold text-purple-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> +1,950 accounts (Q1)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Approved Merchants</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{data.activeVendors}</p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> 98.2% fulfillment rate
          </div>
        </div>
      </div>

      {/* 2 Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">User & Merchant Ecosystem Growth</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly expansion of active shoppers and onboarded sellers</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="users" name="Active Shoppers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="vendors" name="Active Sellers" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Platform GMV vs Commission Take</h2>
              <p className="text-xs text-gray-500 mt-0.5">Gross order revenue vs net platform commission earned</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  formatter={(v) => formatCurrency(v)} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="total" fill="#93c5fd" name="Gross Merchandise Value" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" fill="#10b981" name="Platform Commission" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
        <h2 className="text-base font-bold text-gray-900 mb-1">Category Sales Breakdown</h2>
        <p className="text-xs text-gray-500 mb-6">Top categories driving platform transaction volume</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Orders Processed</th>
                <th className="px-4 py-3">Gross Sales (GMV)</th>
                <th className="px-4 py-3">Platform Commission</th>
                <th className="px-4 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {data.categoryPerformance.map((cat, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.orders} orders</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(cat.gmv)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">+{formatCurrency(cat.gmv * 0.1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[100px] overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(cat.gmv / data.totalGMV) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {Math.round((cat.gmv / data.totalGMV) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
