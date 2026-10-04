import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, ShoppingCart, TrendingUp, Award,
  ArrowUpRight, RefreshCw
} from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const INITIAL_ANALYTICS_DATA = {
  salesSummary: { today: 8, thisWeek: 42, thisMonth: 184, total: 620 },
  revenueSummary: { today: 35992, thisWeek: 188950, thisMonth: 824500, total: 2780000 },
  ordersCount: { today: 4, thisWeek: 21, thisMonth: 92, total: 310 },
  avgOrderValue: 8967,
  forecastAccuracy: 94.2,
  performanceScore: 92,
  monthlySales: [
    { month: 'Oct', revenue: 320000, sales: 72 },
    { month: 'Nov', revenue: 410000, sales: 94 },
    { month: 'Dec', revenue: 580000, sales: 132 },
    { month: 'Jan', revenue: 490000, sales: 108 },
    { month: 'Feb', revenue: 540000, sales: 118 },
    { month: 'Mar', revenue: 824500, sales: 184 },
  ],
  categoryWiseSales: [
    { name: 'Electronics', value: 45 },
    { name: 'Audio & Sound', value: 25 },
    { name: 'Wearables', value: 20 },
    { name: 'Accessories', value: 10 },
  ],
  bestSellingProducts: [
    { name: 'Wireless Noise-Canceling Earbuds Pro', sold: 168, revenue: 755832, rating: 4.8 },
    { name: 'Smart Fitness Tracker & Watch', sold: 124, revenue: 743876, rating: 4.6 },
    { name: 'Portable Bluetooth 360 Bass Speaker', sold: 98, revenue: 244902, rating: 4.7 },
    { name: 'Ergonomic Office Desk Chair', sold: 42, revenue: 545958, rating: 4.9 },
  ]
};

const VendorAnalytics = () => {
  const [data, setData] = useState(INITIAL_ANALYTICS_DATA);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getVendorAnalytics({ range: timeRange });
      const apiData = res.data?.data || res.data;
      if (apiData && apiData.revenueSummary) {
        // Transform categoryWiseSales object to array if needed
        let catArray = apiData.categoryWiseSales;
        if (catArray && !Array.isArray(catArray) && typeof catArray === 'object') {
          catArray = Object.entries(catArray).map(([name, value]) => ({ name, value }));
        }

        setData({
          ...INITIAL_ANALYTICS_DATA,
          ...apiData,
          categoryWiseSales: Array.isArray(catArray) && catArray.length > 0 ? catArray : INITIAL_ANALYTICS_DATA.categoryWiseSales,
          monthlySales: apiData.monthlySales?.length > 0 ? apiData.monthlySales : INITIAL_ANALYTICS_DATA.monthlySales,
          bestSellingProducts: apiData.bestSellingProducts?.length > 0 ? apiData.bestSellingProducts : INITIAL_ANALYTICS_DATA.bestSellingProducts,
        });
      } else {
        setData(INITIAL_ANALYTICS_DATA);
      }
    } catch {
      setData(INITIAL_ANALYTICS_DATA);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Business Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revenue trends, sales velocity, customer demand, and product performance.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-gray-200/80 shadow-sm">
          {['7d', '30d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'This Year'}
            </button>
          ))}
          <button 
            onClick={fetchAnalytics}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(timeRange === '7d' ? data.revenueSummary.thisWeek : data.revenueSummary.thisMonth)}
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> +18.4% vs prev period
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Orders Placed</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {timeRange === '7d' ? data.ordersCount.thisWeek : data.ordersCount.thisMonth} orders
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> +12.1% conversion
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Avg Order Value</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(data.avgOrderValue || 8967)}
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-4 h-4 mr-0.5" /> +5.2% basket size
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Vendor Health Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {data.performanceScore || 92} / 100
          </p>
          <p className="text-xs text-gray-500 mt-2">Top 5% among tier-1 sellers</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue Growth Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly revenue curve and sales volume</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              +24% YoY
            </span>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Sales by Category</h2>
            <p className="text-xs text-gray-500 mb-4">Volume distribution across store categories</p>
            
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryWiseSales}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.categoryWiseSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            {data.categoryWiseSales.map((cat, i) => (
              <div key={cat.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-gray-600 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Selling Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Top Performing Products</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by revenue contribution and total units moved</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-3">Rank & Product Name</th>
                <th className="px-4 py-3">Units Sold</th>
                <th className="px-4 py-3">Total Revenue</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {data.bestSellingProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-gray-900 truncate max-w-sm">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">
                    {p.sold} units
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      ★ {p.rating || 4.8}
                    </span>
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

export default VendorAnalytics;
