import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getProductImageUrl, handleImageError } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty > 0) {
      updateQuantity(id, newQty);
    } else if (newQty === 0) {
      removeFromCart(id);
    }
  };

  if (!cartItems) return <LoadingSpinner />;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added anything to your cart yet. Browse our products to find something you&apos;ll love!
        </p>
        <Link to="/browse" className="btn-primary inline-flex items-center">
          Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = cartTotal * 0.05; // 5% tax example
  const finalTotal = cartTotal + shipping + tax;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Items ({cartItems.length})</h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={item._id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <img 
                      src={getProductImageUrl(item.product)} 
                      alt={item.product?.name} 
                      onError={(e) => handleImageError(e)}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/product/${item.product?._id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 block mb-1">
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-gray-500 mb-2">Sold by: {item.product?.vendor?.storeName || 'Vendor'}</p>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-28">
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                          className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-r border-gray-300"
                        >
                          -
                        </button>
                        <div className="flex-1 flex items-center justify-center font-medium text-gray-900">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-300"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">Free</span>
                  ) : (
                    <span className="font-medium text-gray-900">{formatCurrency(shipping)}</span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(finalTotal)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Add {formatCurrency(1000 - cartTotal)} more to your cart for FREE shipping!
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    className="input text-sm"
                  />
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-colors flex justify-center items-center"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/browse" className="text-sm text-blue-600 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
