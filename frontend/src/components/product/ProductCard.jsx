import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import StarRating from '../common/StarRating';
import { useCart } from '../../context/CartContext';
import { wishlistAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, getProductImageUrl, handleImageError, isPersistedProductId } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [inWishlist, setInWishlist] = React.useState(false);
  const isPersistedProduct = isPersistedProductId(product._id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!isPersistedProduct) {
      toast.error('This product is not currently available');
      return;
    }

    try {
      if (inWishlist) {
        await wishlistAPI.removeItem(product._id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addItem({ productId: product._id });
        toast.success('Added to wishlist');
      }
      setInWishlist(!inWishlist);
    } catch (error) {
      toast.error('Please login to manage wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isPersistedProduct) {
      toast.error('This product is not currently available');
      return;
    }

    addToCart(product, 1, product.price);
  };

  return (
    <Link to={isPersistedProduct ? `/product/${product._id}` : '/browse'} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={getProductImageUrl(product)} 
          alt={product.name} 
          onError={(e) => handleImageError(e)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.comparePrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
          </div>
        )}
        <button 
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-colors"
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-800 font-medium truncate mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-2 truncate">Sold by: {product.vendor?.storeName || 'Unknown Vendor'}</p>
        
        <div className="mb-3">
          <StarRating rating={product.rating || 0} count={product.numReviews || 0} />
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
