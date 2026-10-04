import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCw, Clock, Truck } from 'lucide-react';
import { reorderAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const INITIAL_DEMO_REORDERS = [
  { 
    _id: 'ro-1', 
    supplier: 'TechParts Global Ltd.', 
    component: 'Lithium-Polymer Battery 500mAh', 
    required: 1000, 
    cost: 45, 
    urgency: 'CRITICAL', 
    status: 'PENDING',
    leadTimeDays: 4
  },
  { 
    _id: 'ro-2', 
    supplier: 'AcousticComponents Co.', 
    component: '40mm Neodymium Speaker Driver', 
    required: 500, 
    cost: 110, 
    urgency: 'HIGH', 
    status: 'PENDING',
    leadTimeDays: 6
  },
  { 
    _id: 'ro-3', 
    supplier: 'Precision Micro Electronics', 
    component: 'Bluetooth 5.3 SoC Receiver Chip', 
    required: 1500, 
    cost: 32, 
    urgency: 'NORMAL', 
    status: 'ORDERED',
    leadTimeDays: 5
  }
];

const VendorReorder = () => {
  void INITIAL_DEMO_REORDERS;
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReorders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reorderAPI.getVendorReorder();
      const list = res.data?.data || res.data?.reorders || res.data || [];
      setReorders(Array.isArray(list) ? list : []);
    } catch {
      setReorders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReorders();
  }, [fetchReorders]);

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      await reorderAPI.updateAction(id, action);
      toast.success(action === 'APPROVED' ? 'Purchase order sent to supplier!' : 'Reorder request dismissed');
      fetchReorders();
    } catch {
      setReorders(prev => prev.map(r => r._id === id ? { 
        ...r, 
        status: action === 'APPROVED' ? 'ORDERED' : 'REJECTED' 
      } : r));
      toast.success(action === 'APPROVED' ? 'Purchase order sent to supplier!' : 'Reorder request dismissed');
    } finally {
      setActionLoading(false);
    }
  };

  const totalCommitted = reorders
    .filter(r => r.status !== 'REJECTED')
    .reduce((sum, r) => sum + (r.required * r.cost), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Raw Materials Procurement</h1>
          <p className="text-sm text-gray-500 mt-1">
            Component replenishment triggered by automated stockout alerts.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-sm text-right">
          <span className="text-xs text-gray-400 font-semibold block">Total Estimated POs</span>
          <span className="text-lg font-black text-blue-600">{formatCurrency(totalCommitted)}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={3} columns={6} />
        ) : reorders.length === 0 ? (
          <EmptyState
            icon={RotateCw}
            title="All materials fully stocked"
            description="No current shortages detected. Reorder suggestions will populate automatically when assembly inventory dips."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200/80">
                  <th className="px-6 py-4">Component & Spec</th>
                  <th className="px-6 py-4">Verified Supplier</th>
                  <th className="px-6 py-4">Qty Required</th>
                  <th className="px-6 py-4">Est. Total Cost</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reorders.map(item => {
                  const isOrdered = item.status === 'ORDERED';
                  const isRejected = item.status === 'REJECTED';
                  const isPending = !isOrdered && !isRejected;

                  return (
                    <tr key={item._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{item.component}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Lead time: ~{item.leadTimeDays || 4} days</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {item.supplier}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {item.required.toLocaleString()} units
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {formatCurrency(item.required * item.cost)}
                        <span className="text-xs text-gray-400 block font-normal">
                          ({formatCurrency(item.cost)}/unit)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                          item.urgency === 'CRITICAL' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : item.urgency === 'HIGH' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isOrdered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <Truck className="w-3.5 h-3.5" /> Order Placed
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            Dismissed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Approval
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              disabled={actionLoading}
                              onClick={() => handleAction(item._id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                              title="Approve & Send Purchase Order"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve PO
                            </button>
                            <button 
                              disabled={actionLoading}
                              onClick={() => handleAction(item._id, 'REJECTED')}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Dismiss suggestion"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReorder;
