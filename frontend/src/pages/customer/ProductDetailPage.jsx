import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import { formatCurrency, getStockStatusColor, getStockStatusLabel, handleImageError, getProductImageUrl, isPersistedProductId } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Heart, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      if (!isPersistedProductId(id)) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        const res = await productsAPI.getById(id);
        const productData = res.data?.data;
        setProduct(productData);
        setActiveImage(getProductImageUrl(productData));
        
        // Fetch related products and reviews in parallel
        const categoryId = productData.category?._id || productData.category;
        const [relatedRes, reviewsRes] = await Promise.all([
          productsAPI.getAll({ category: categoryId, limit: 6 }).catch(() => ({ data: { data: [] } })),
          reviewsAPI.getProductReviews(id).catch(() => ({ data: [] }))
        ]);
        
        setRelatedProducts(relatedRes.data?.data?.filter(p => p._id !== id) || []);
        setReviews(reviewsRes.data?.data || []);
      } catch (error) {
        setProduct(null);
        toast.error(error.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product._id, quantity);
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const res = await reviewsAPI.addReview(id, reviewForm);
      toast.success('Review submitted successfully!');
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-xl font-bold">Product not found</div>;

  const categoryId = product.category?._id || product.category;
  const categoryName = product.category?.name || product.category || 'Uncategorized';
  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/browse?category=${categoryId}`} className="hover:text-blue-600">{categoryName}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate w-48 sm:w-auto">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="relative h-96 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                <img 
                  src={activeImage || getProductImageUrl(product)} 
                  alt={product.name} 
                  onError={(e) => handleImageError(e)}
                  className="max-h-full object-contain mix-blend-multiply" 
                />
                {product.comparePrice > product.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-lg">
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(getProductImageUrl(product, idx))}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${activeImage === img ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img 
                      src={getProductImageUrl(product, idx)} 
                      alt={`Thumbnail ${idx}`} 
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
              <div className="mb-2">
                <Link to={`/vendor/${product.vendor?._id}`} className="text-blue-600 font-medium hover:underline">
                  {product.vendor?.storeName}
                </Link>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-6">
                <StarRating rating={product.rating} count={product.numReviews} />
                <span className="mx-4 text-gray-300">|</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStockStatusColor(product.status)}`}>
                  {getStockStatusLabel(product.status)}
                </span>
                <span className="mx-4 text-gray-300">|</span>
                <span className="text-gray-500 text-sm">SKU: {product.sku || product._id.slice(-6)}</span>
              </div>

              <div className="mb-6 flex items-end">
                <span className="text-4xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.comparePrice > product.price && (
                  <span className="text-xl text-gray-500 line-through ml-4 mb-1">{formatCurrency(product.comparePrice)}</span>
                )}
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-auto">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                      disabled={isOutOfStock}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      readOnly
                      className="w-full h-full text-center border-none focus:ring-0 font-medium"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                      disabled={isOutOfStock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock > 0 && product.stock < 10 ? `Only ${product.stock} left in stock!` : ''}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl font-bold transition-colors ${
                      isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-colors ${
                      isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
                    }`}
                  >
                    Buy It Now
                  </button>
                  <button className="p-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Service Features */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600">7 Days Return</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600">1 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {product.specs?.map((spec, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 font-medium text-gray-600 border border-gray-100 w-1/3">{spec.name}</td>
                    <td className="py-3 px-4 text-gray-800 border border-gray-100">{spec.value}</td>
                  </tr>
                ))}
                {!product.specs?.length && (
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-600 border border-gray-100 w-1/3">Category</td>
                    <td className="py-3 px-4 text-gray-800 border border-gray-100">{categoryName}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
              <span className="text-5xl font-bold text-gray-900 mb-2">{product.rating}</span>
              <StarRating rating={product.rating} />
              <span className="text-gray-500 mt-2">Based on {product.numReviews} reviews</span>
            </div>
            
            <div className="md:w-2/3 flex flex-col justify-center space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center">
                  <span className="w-12 text-sm text-gray-600">{star} stars</span>
                  <div className="flex-1 h-2 mx-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400" 
                      style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%` }}
                    ></div>
                  </div>
                  <span className="w-10 text-sm text-gray-500 text-right">{star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review Form */}
          {isAuthenticated && user?.role === 'customer' && (
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                  <textarea 
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows="3" 
                    className="input w-full"
                    placeholder="Share your experience with this product..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.user?.name || 'Anonymous User'}</h4>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-3">{review.comment}</p>
              </div>
            )) : (
              <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductGrid title="You May Also Like">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
