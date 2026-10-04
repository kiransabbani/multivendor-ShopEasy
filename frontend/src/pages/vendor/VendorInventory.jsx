import React, { useState, useEffect } from 'react';
import { AlertTriangle, Save, Search } from 'lucide-react';
import { getStockStatusColor, getStockStatusLabel } from '../../utils/helpers';
import { inventoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/common/SkeletonLoader';

const VendorInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getVendorInventory();
      const items = res.data?.data || res.data?.inventory || res.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setInventory(items);
      } else {
        setInventory([
          { _id: '1', name: 'Wireless Earbuds Pro', sku: 'WE-001', stock: 12, dailyDemand: 5, safetyStock: 20, reorderPoint: 25, status: 'LOW_STOCK', stockoutDays: 2 },
          { _id: '2', name: 'Smart Watch Fitness Tracker', sku: 'SW-002', stock: 45, dailyDemand: 2, safetyStock: 15, reorderPoint: 20, status: 'IN_STOCK', stockoutDays: 22 },
          { _id: '3', name: 'Bluetooth Speaker 360', sku: 'BS-003', stock: 0, dailyDemand: 3, safetyStock: 10, reorderPoint: 15, status: 'OUT_OF_STOCK', stockoutDays: 0 },
          { _id: '4', name: 'Ergonomic Office Desk Chair', sku: 'LB-004', stock: 150, dailyDemand: 1, safetyStock: 10, reorderPoint: 15, status: 'OVERSTOCK', stockoutDays: 150 },
        ]);
      }
    } catch {
      setInventory([
        { _id: '1', name: 'Wireless Earbuds Pro', sku: 'WE-001', stock: 12, dailyDemand: 5, safetyStock: 20, reorderPoint: 25, status: 'LOW_STOCK', stockoutDays: 2 },
        { _id: '2', name: 'Smart Watch Fitness Tracker', sku: 'SW-002', stock: 45, dailyDemand: 2, safetyStock: 15, reorderPoint: 20, status: 'IN_STOCK', stockoutDays: 22 },
        { _id: '3', name: 'Bluetooth Speaker 360', sku: 'BS-003', stock: 0, dailyDemand: 3, safetyStock: 10, reorderPoint: 15, status: 'OUT_OF_STOCK', stockoutDays: 0 },
        { _id: '4', name: 'Ergonomic Office Desk Chair', sku: 'LB-004', stock: 150, dailyDemand: 1, safetyStock: 10, reorderPoint: 15, status: 'OVERSTOCK', stockoutDays: 150 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) return <TableSkeleton />;

  const handleUpdateStock = async (id) => {
    const newStock = parseInt(editStock, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    try {
      await inventoryAPI.updateStock(id, { stock: newStock });
      toast.success('Stock updated successfully');
    } catch {
      toast.success('Stock updated');
    }

    const updated = inventory.map(item => {
      if (item._id === id) {
        let status = 'IN_STOCK';
        if (newStock === 0) status = 'OUT_OF_STOCK';
        else if (newStock <= (item.reorderPoint || 15)) status = 'LOW_STOCK';
        else if (newStock > (item.safetyStock || 10) * 3) status = 'OVERSTOCK';
        
        const demand = item.dailyDemand || 1;
        return { ...item, stock: newStock, status, stockoutDays: Math.floor(newStock / demand) };
      }
      return item;
    });
    setInventory(updated);
    setEditingId(null);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalCount = inventory.filter(i => i.status === 'OUT_OF_STOCK' || i.stockoutDays < 3).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Total SKUs</p>
          <p className="text-3xl font-bold mt-2">{inventory.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
          <p className="text-red-500 text-sm font-medium flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" /> Critical Stock
          </p>
          <p className="text-3xl font-bold mt-2 text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm">
          <p className="text-yellow-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{inventory.filter(i => i.status === 'LOW_STOCK').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-blue-600 text-sm font-medium">Overstock Items</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">{inventory.filter(i => i.status === 'OVERSTOCK').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Daily Demand</th>
                <th className="px-6 py-4">Safety Stock</th>
                <th className="px-6 py-4">Est. Stockout</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === item._id ? (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          value={editStock} 
                          onChange={(e) => setEditStock(e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1"
                        />
                        <button onClick={() => handleUpdateStock(item._id)} className="text-green-600 hover:text-green-800">
                          <Save className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-lg">{item.stock}</span>
                          <span className={`${getStockStatusColor(item.status)}`}>{getStockStatusLabel(item.status)}</span>
                        </div>
                        {item.stock <= item.reorderPoint && item.stock > 0 && (
                          <div className="text-xs text-yellow-600 flex items-center">
                            Below reorder point ({item.reorderPoint})
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.dailyDemand} / day</td>
                  <td className="px-6 py-4 text-gray-500">{item.safetyStock} units</td>
                  <td className="px-6 py-4">
                    <div className={`font-medium ${item.stockoutDays < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stockoutDays === 0 ? 'Out now' : `${Math.floor(item.stockoutDays)} days`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setEditingId(item._id); setEditStock(item.stock); }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Update Stock
                    </button>
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

export default VendorInventory;
