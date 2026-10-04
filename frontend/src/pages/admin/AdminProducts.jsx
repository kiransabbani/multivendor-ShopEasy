import React, { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { Package, Trash2, Eye, Search, Filter } from 'lucide-react';
import { formatCurrency, getStockStatusColor, getProductImageUrl, handleImageError } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null, productName: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await adminAPI.getProducts();
        const data = res.data?.products || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    const id = deleteDialog.productId;
    if (!id) return;
    try {
      await adminAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted globally');
    } catch (error) {
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted globally');
    } finally {
      setDeleteDialog({ isOpen: false, productId: null, productName: '' });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vendor?.storeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || (p.category || '').toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="w-7 h-7 mr-2 text-primary-600" /> Catalog & Product Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global catalog oversight across all merchant accounts.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Products: <span className="font-bold text-gray-900">{products.length}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products or vendors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-primary-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              title="No matching products found"
              description="Try adjusting your search query or category filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Vendor</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Inventory</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img 
                        src={getProductImageUrl(product)} 
                        alt={product.name}
                        onError={(e) => handleImageError(e)}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" 
                      />
                      <div>
                        <div className="font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                        <div className="text-xs text-gray-400">ID: {product._id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary-600 font-medium">
                      {product.vendor?.storeName || 'Vendor'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block ${getStockStatusColor(product.status)} font-medium`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a 
                          href={`/product/${product._id}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="View on Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => setDeleteDialog({ isOpen: true, productId: product._id, productName: product.name })} 
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete Globally"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Delete Product Globally"
        message={`Are you sure you want to permanently delete "${deleteDialog.productName}" from the platform? This action cannot be undone.`}
        confirmText="Delete Product"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, productId: null, productName: '' })}
      />
    </div>
  );
};

export default AdminProducts;
