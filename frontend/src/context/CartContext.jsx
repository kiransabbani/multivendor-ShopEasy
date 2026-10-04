import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, user?.role]);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      const items = res.data?.data?.items || res.data?.items || [];
      setCartItems(items);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  const addToCart = async (product, quantity = 1, price = 0) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      const productId = typeof product === 'object' ? (product._id || product.id) : product;
      const itemPrice = typeof product === 'object' ? (product.price || price) : price;
      await cartAPI.addItem({ product: productId, productId, quantity, price: itemPrice });
      toast.success('Added to cart');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      toast.success('Removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    try {
      await cartAPI.updateItem({ product: productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.price ?? item.product?.price ?? 0;
    return acc + (price * (item.quantity || 1));
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
