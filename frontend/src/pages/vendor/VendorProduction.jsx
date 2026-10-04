import React, { useState, useEffect, useCallback } from 'react';
import { Factory, CheckCircle2, Play } from 'lucide-react';
import { productionAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const INITIAL_DEMO_PRODUCTION = [
  { 
    _id: 'prd-1', 
    name: 'Wireless Noise-Canceling Earbuds Pro', 
    required: 200, 
    current: 12, 
    capacity: 50, 
    status: 'PENDING', 
    hike: 'CRITICAL',
    targetDate: '3 days from now'
  },
  { 
    _id: 'prd-2', 
    name: 'Portable Bluetooth 360 Bass Speaker', 
    required: 150, 
    current: 4, 
    capacity: 30, 
    status: 'IN_PROGRESS', 
    hike: 'HIGH',
    targetDate: '5 days from now'
  },
  { 
    _id: 'prd-3', 
    name: 'Smart Fitness Tracker & Watch', 
    required: 80, 
    current: 45, 
    capacity: 40, 
    status: 'COMPLETED', 
    hike: 'NORMAL',
    targetDate: 'Completed today'
  }
];

const VendorProduction = () => {
  void INITIAL_DEMO_PRODUCTION;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modify Modal State
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modifiedQuantity, setModifiedQuantity] = useState('');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productionAPI.getVendorProduction();
      const list = res.data?.data || res.data?.plans || res.data || [];
      setPlans(Array.isArray(list) ? list : []);
    } catch (error) {
      setPlans([]);
      toast.error(error.response?.data?.message || 'Failed to load production plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleUpdateAction = async (planId, action) => {
    setActionLoading(true);
    try {
      await productionAPI.updateAction(planId, action);
      toast.success(action === 'IN_PROGRESS' ? 'Production run initiated!' : 'Production marked as completed!');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update production status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenModify = (plan) => {
    setSelectedPlan(plan);
    setModifiedQuantity(plan.required);
    setIsModifyOpen(true);
  };

  const handleSaveModify = (e) => {
    e.preventDefault();
    const qty = parseInt(modifiedQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid production quantity');
      return;
    }

    setPlans(prev => prev.map(p => {
      if (p._id === selectedPlan._id) {
        return { ...p, required: qty };
      }
      return p;
    }));
    toast.success(`Production batch updated to ${qty} units`);
    setIsModifyOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Production Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manufacture and batch replenishment schedules based on AI demand forecasts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No active production orders"
          description="All stock replenishment targets are met. Run a new demand forecast to generate production plans."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((prod) => {
            const isCompleted = prod.status === 'COMPLETED';
            const inProgress = prod.status === 'IN_PROGRESS';

            return (
              <div 
                key={prod._id} 
                className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between transition-all ${
                  isCompleted 
                    ? 'border-emerald-200/80 bg-emerald-50/10' 
                    : inProgress 
                    ? 'border-blue-200/80 ring-1 ring-blue-100' 
                    : 'border-gray-200/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 leading-snug">{prod.name}</h3>
                      <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        prod.hike === 'CRITICAL' 
                          ? 'bg-rose-100 text-rose-800' 
                          : prod.hike === 'HIGH' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {prod.hike} PRIORITY
                      </span>
                    </div>
                    <div className={`p-2 rounded-xl ${inProgress ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Factory className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 mb-6 text-sm bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Current Stock:</span> 
                      <span className={`font-bold ${prod.current <= 10 ? 'text-rose-600' : 'text-gray-900'}`}>
                        {prod.current} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Required Batch:</span> 
                      <span className="font-black text-blue-600">
                        {prod.required} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Daily Assembly Rate:</span> 
                      <span className="font-medium text-gray-700">{prod.capacity} units/day</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200/60">
                      <span className="text-gray-500 text-xs">Status:</span> 
                      <span className={`text-xs font-bold uppercase ${
                        isCompleted ? 'text-emerald-600' : inProgress ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {prod.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 border-t border-gray-100 pt-4">
                  {prod.status === 'PENDING' ? (
                    <button 
                      disabled={actionLoading}
                      onClick={() => handleUpdateAction(prod._id, 'IN_PROGRESS')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Run
                    </button>
                  ) : inProgress ? (
                    <button 
                      disabled={actionLoading}
                      onClick={() => handleUpdateAction(prod._id, 'COMPLETED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Complete
                    </button>
                  ) : (
                    <div className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" /> Stock Restocked
                    </div>
                  )}
                  
                  {!isCompleted && (
                    <button 
                      onClick={() => handleOpenModify(prod)}
                      className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Modify
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modify Quantity Modal */}
      <Modal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        title={`Adjust Production Target: ${selectedPlan?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveModify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Production Quantity (units)
            </label>
            <input 
              type="number"
              min="1"
              required
              value={modifiedQuantity}
              onChange={(e) => setModifiedQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Estimated completion time at {selectedPlan?.capacity || 40} units/day: ~{Math.ceil((parseInt(modifiedQuantity, 10) || 0) / (selectedPlan?.capacity || 40))} work days.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModifyOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save Target
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorProduction;
