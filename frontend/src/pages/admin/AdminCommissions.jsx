import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { DollarSign, Download, Search, TrendingUp, CreditCard, Percent } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await adminAPI.getCommissions();
        const data = res.data?.commissions || res.data || [];
        setCommissions(Array.isArray(data) ? data : []);
      } catch (error) {
        setCommissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      const matchSearch = (c.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.vendor?.storeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [commissions, searchTerm, statusFilter]);

  // Dynamically calculate KPIs
  const kpis = useMemo(() => {
    const totalOrderAmount = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalCommission = commissions.reduce((sum, c) => sum + (c.commission || 0), 0);
    const pendingPayouts = commissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + (c.payout || 0), 0);
    const avgRate = commissions.length > 0
      ? (commissions.reduce((sum, c) => sum + (c.rate || 10), 0) / commissions.length).toFixed(1)
      : '10.0';

    return { totalOrderAmount, totalCommission, pendingPayouts, avgRate };
  }, [commissions]);

  const handleExportCSV = () => {
    try {
      const headers = ['Commission ID', 'Order ID', 'Date', 'Vendor', 'Order Amount (INR)', 'Rate (%)', 'Platform Cut (INR)', 'Vendor Payout (INR)', 'Status'];
      const rows = filteredCommissions.map(c => [
        c._id,
        c.orderId,
        new Date(c.date).toLocaleDateString(),
        `"${c.vendor?.storeName || 'N/A'}"`,
        c.amount,
        `${c.rate}%`,
        c.commission,
        c.payout,
        c.status || 'PAID'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `platform_commissions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Commission ledger exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-7 h-7 mr-2 text-primary-600" /> Platform Commissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time breakdown of platform revenue splits and vendor settlement ledgers.
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 mr-2 text-gray-500" /> Export Ledger CSV
        </button>
      </div>
      
      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Commission Earned</p>
            <p className="text-2xl font-bold mt-1 text-primary-600">{formatCurrency(kpis.totalCommission)}</p>
            <span className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> Platform revenue
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending Payouts</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">{formatCurrency(kpis.pendingPayouts)}</p>
            <span className="text-xs text-gray-500 mt-1 block">Awaiting next batch</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Average Take Rate</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{kpis.avgRate}%</p>
            <span className="text-xs text-gray-500 mt-1 block">Across all categories</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Gross Order Volume</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(kpis.totalOrderAmount)}</p>
            <span className="text-xs text-gray-500 mt-1 block">{commissions.length} processed orders</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'PAID', 'PENDING'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {filteredCommissions.length === 0 ? (
            <div className="py-12">
              <EmptyState 
                title="No commission records found"
                description="Try clearing your search query or adjusting your status filters."
              />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Order / Date</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5 text-right">Gross Order</th>
                  <th className="px-6 py-3.5 text-right">Commission Rate</th>
                  <th className="px-6 py-3.5 text-right">Platform Cut</th>
                  <th className="px-6 py-3.5 text-right">Vendor Settlement</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCommissions.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{c.orderId}</div>
                      <div className="text-xs text-gray-500">{formatDate(c.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{c.vendor?.storeName || 'Vendor'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold">
                        {c.rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      +{formatCurrency(c.commission)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-primary-600">
                      {formatCurrency(c.payout)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status || 'PAID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCommissions;
