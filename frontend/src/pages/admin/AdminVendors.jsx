import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { Store, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState({ isOpen: false, vendor: null, action: null });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await adminAPI.getVendors();
        const data = res.data?.data || res.data?.vendors || res.data || [];
        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (/^[a-f\d]{24}$/i.test(id)) {
        if (action === 'approve') await adminAPI.approveVendor(id);
        if (action === 'reject') await adminAPI.rejectVendor(id);
        if (action === 'suspend') await adminAPI.suspendVendor(id);
      }
      
      const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED';
      setVendors(prev => prev.map(v => v._id === id ? { ...v, status: newStatus } : v));
      toast.success(`Vendor ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Unable to update vendor status');
    } finally {
      setActionDialog({ isOpen: false, vendor: null, action: null });
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = (v.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filter === 'ALL' || v.status === filter;
      return matchSearch && matchStatus;
    });
  }, [vendors, searchTerm, filter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Store className="w-7 h-7 mr-2 text-primary-600" /> Vendor Applications & Merchant Oversight
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review onboarding submissions, operational compliance, and store suspensions.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Merchants: <span className="font-bold text-gray-900">{vendors.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filter strip */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search store or owner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'APPROVED', 'PENDING', 'SUSPENDED'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        {filteredVendors.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              title="No vendors found"
              description="No merchants match your current filter criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Store Details</th>
                  <th className="px-6 py-3.5">Owner / Contact</th>
                  <th className="px-6 py-3.5">Metrics & Catalog</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredVendors.map(vendor => (
                  <tr key={vendor._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{vendor.storeName}</div>
                      <div className="text-xs text-gray-400">ID: {vendor._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{vendor.ownerName}</div>
                      {vendor.email && <div className="text-xs text-gray-500">{vendor.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-amber-500 font-bold">★ {vendor.rating || 'N/A'}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(vendor.totalSales || 0)}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-primary-600 font-medium">{vendor.productsCount || 0} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {vendor.status === 'PENDING' && (
                        <div className="inline-flex space-x-2">
                          <button 
                            onClick={() => handleAction(vendor._id, 'approve')} 
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </button>
                          <button 
                            onClick={() => setActionDialog({ isOpen: true, vendor, action: 'reject' })} 
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </button>
                        </div>
                      )}
                      {vendor.status === 'APPROVED' && (
                        <button 
                          onClick={() => setActionDialog({ isOpen: true, vendor, action: 'suspend' })} 
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Suspend Store
                        </button>
                      )}
                      {vendor.status === 'SUSPENDED' && (
                        <button 
                          onClick={() => handleAction(vendor._id, 'approve')} 
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Re-Approve
                        </button>
                      )}
                      {vendor.status === 'REJECTED' && (
                        <button 
                          onClick={() => handleAction(vendor._id, 'approve')} 
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={actionDialog.isOpen}
        title={actionDialog.action === 'suspend' ? 'Suspend Merchant Account' : 'Reject Vendor Application'}
        message={
          actionDialog.action === 'suspend'
            ? `Are you sure you want to suspend "${actionDialog.vendor?.storeName}"? Their products will be hidden from the storefront until re-approved.`
            : `Are you sure you want to reject the application for "${actionDialog.vendor?.storeName}"?`
        }
        confirmText={actionDialog.action === 'suspend' ? 'Suspend Store' : 'Reject Application'}
        type={actionDialog.action === 'suspend' ? 'warning' : 'danger'}
        onConfirm={() => handleAction(actionDialog.vendor?._id, actionDialog.action)}
        onCancel={() => setActionDialog({ isOpen: false, vendor: null, action: null })}
      />
    </div>
  );
};

export default AdminVendors;
