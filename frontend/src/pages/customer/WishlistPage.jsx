import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency, getProductImageUrl, handleImageError } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get();
      setWishlistItems(res.data.items || []);
    } catch (error) {
      // Mock data
      setWishlistItems([
        { _id: '1', product: { _id: 'p1', name: 'Premium Leather Wallet', price: 1499, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'FashionHub' }, stock: 15 } },
        { _id: '2', product: { _id: 'p2', name: 'Mechanical Gaming Keyboard', price: 4999, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'TechStore' }, stock: 5 } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.removeItem(id);
      setWishlistItems(prev => prev.filter(item => item.product._id !== id));
      toast.success('Removed from wishlist');
    } catch (error) {
      // Fallback behavior for mock
      setWishlistItems(prev => prev.filter(item => item.product._id !== id));
      toast.success('Removed from wishlist');
    }
  };

  const handleMoveToCart = (item) => {
    addToCart(item.product._id, 1);
    handleRemove(item.product._id);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love to your wishlist to buy them later.</p>
            <Link to="/browse" className="btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative h-48 bg-gray-100">
                  <img 
                    src={getProductImageUrl(item.product)} 
                    alt={item.product?.name} 
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <button 
                    onClick={() => handleRemove(item.product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex flex-col h-full">
                  <div className="mb-4">
                    <Link to={`/product/${item.product._id}`} className="font-bold text-gray-900 hover:text-blue-600 block truncate">
                      {item.product?.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Sold by: {item.product?.vendor?.storeName}</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(item.product?.price)}</span>
                      {item.product?.stock > 0 ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">In Stock</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      disabled={item.product?.stock === 0}
                      className={`w-full py-2 rounded-lg font-bold flex justify-center items-center transition-colors ${
                        item.product?.stock === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
