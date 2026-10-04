import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ordersAPI, wishlistAPI } from '../../services/api';
import { formatCurrency, formatDate, getOrderStatusColor, getProductImageUrl } from '../../utils/helpers';
import { ShoppingBag, Heart, Package, User, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEMO_ORDERS = [
  { _id: 'ORD-9821', totalAmount: 8998, status: 'DELIVERED', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ product: { name: 'Sony WH-1000XM4 Headphones' }, quantity: 1 }] },
  { _id: 'ORD-9819', totalAmount: 5999, status: 'PROCESSING', createdAt: new Date(Date.now() - 86400000).toISOString(), items: [{ product: { name: 'Smart Fitness Tracker' }, quantity: 1 }] },
  { _id: 'ORD-9805', totalAmount: 2499, status: 'SHIPPED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), items: [{ product: { name: 'Bluetooth Speaker' }, quantity: 1 }] },
];

const DEMO_WISHLIST = [
  { _id: 'w1', product: { _id: 'prod-f1', name: 'Sony WH-1000XM4 Headphones', price: 19990, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'] } },
  { _id: 'w2', product: { _id: 'prod-f5', name: 'Pro Smart Fitness Watch', price: 4999, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'] } },
  { _id: 'w3', product: { _id: 'prod-f9', name: 'Mechanical RGB Gaming Keyboard', price: 3499, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80'] } },
];

const RECOMMENDED = [
  { _id: 'r1', name: 'Pure Vitamin C Serum', category: 'Beauty', price: 899, comparePrice: 1299, rating: 4.9, numReviews: 532, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Glow' } },
  { _id: 'r2', name: 'Ergonomic Wireless Mouse', category: 'Electronics', price: 1199, comparePrice: 1799, rating: 4.6, numReviews: 184, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80'], vendor: { storeName: 'GadgetZone' } },
  { _id: 'r3', name: 'Organic Forest Honey (500g)', category: 'Groceries', price: 649, comparePrice: 799, rating: 4.9, numReviews: 410, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Essentials' } },
  { _id: 'r4', name: 'Premium Yoga Mat', category: 'Sports', price: 1299, comparePrice: 1899, rating: 4.7, numReviews: 94, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&auto=format&fit=crop&q=80'], vendor: { storeName: 'Peak Athletics' } },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          ordersAPI.getMyOrders(),
          wishlistAPI.get(),
        ]);

        if (ordersRes.status === 'fulfilled') {
          const data = ordersRes.value.data?.data || ordersRes.value.data || [];
          setOrders(Array.isArray(data) && data.length > 0 ? data.slice(0, 3) : DEMO_ORDERS);
        } else {
          setOrders(DEMO_ORDERS);
        }

        if (wishlistRes.status === 'fulfilled') {
          const data = wishlistRes.value.data?.data?.items || wishlistRes.value.data?.items || [];
          setWishlistItems(Array.isArray(data) && data.length > 0 ? data.slice(0, 3) : DEMO_WISHLIST);
        } else {
          setWishlistItems(DEMO_WISHLIST);
        }
      } catch {
        setOrders(DEMO_ORDERS);
        setWishlistItems(DEMO_WISHLIST);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const firstName = user?.name?.split(' ')[0] || 'Customer';
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const pendingCount = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero welcome bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
              <h1 className="text-3xl md:text-4xl font-black">{firstName}&apos;s Dashboard</h1>
              <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/browse" className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg">
                Shop Now
              </Link>
              <Link to="/orders" className="bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl text-sm border border-white/30 hover:bg-white/20 transition-colors backdrop-blur-sm">
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'blue', link: '/orders' },
            { label: 'Delivered', value: deliveredCount, icon: Package, color: 'green', link: '/orders' },
            { label: 'In Progress', value: pendingCount, icon: Clock, color: 'orange', link: '/orders' },
            { label: 'Cart Items', value: cartCount, icon: ShoppingBag, color: 'purple', link: '/cart' },
          ].map(({ label, value, icon: Icon, color, link }) => (
            <Link key={label} to={link}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                ${color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                ${color === 'green' ? 'bg-green-100 text-green-600' : ''}
                ${color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                ${color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs font-medium text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <div key={order._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">#{typeof order._id === 'string' ? order._id.slice(-8).toUpperCase() : order._id}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {order.items?.[0]?.product?.name || 'Order item'} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(order.createdAt || order.date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`${getOrderStatusColor(order.status)} text-xs`}>{order.status}</span>
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(order.totalAmount || order.total)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/orders/${order._id}`}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Track Order
                    </Link>
                    {order.status === 'DELIVERED' && (
                      <span className="text-gray-300">•</span>
                    )}
                    {order.status === 'DELIVERED' && (
                      <Link to={`/invoice/${order._id}`} className="text-xs text-gray-500 font-medium hover:text-gray-700">
                        Download Invoice
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No orders yet</p>
                  <Link to="/browse" className="text-blue-600 text-sm font-semibold mt-2 inline-block hover:underline">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Quick Links */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700">Customer</span>
                </div>
              </div>
              <Link to="/profile" className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Manage Profile</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/cart', icon: ShoppingBag, label: 'View Cart', badge: cartCount > 0 ? cartCount : null },
                  { to: '/wishlist', icon: Heart, label: 'My Wishlist', badge: wishlistItems.length > 0 ? wishlistItems.length : null },
                  { to: '/orders', icon: Package, label: 'Order History', badge: null },
                  { to: '/browse', icon: Star, label: 'Browse Products', badge: null },
                ].map(({ to, icon: Icon, label, badge }) => (
                  <Link key={to} to={to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="flex items-center gap-3 text-sm text-gray-700 font-medium group-hover:text-blue-600">
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600" /> {label}
                    </span>
                    {badge && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist preview */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> My Wishlist
              </h2>
              <Link to="/wishlist" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {wishlistItems.map(item => {
                const prod = item.product || item;
                return (
                  <Link key={item._id} to={`/product/${prod._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                  >
                    <img
                      src={getProductImageUrl(prod)}
                      alt={prod.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&auto=format&fit=crop&q=80'; }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700">{prod.name}</p>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">{formatCurrency(prod.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended For You */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
            <Link to="/browse" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RECOMMENDED.map(product => (
              <Link key={product._id} to={`/product/${product._id}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80'; }}
                  />
                  {product.comparePrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-0.5">{product.vendor?.storeName}</p>
                  <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700">{product.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.numReviews})</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Address / shipping info placeholder */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Manage Delivery Addresses</h3>
              <p className="text-sm text-gray-600 mt-0.5">Save addresses for faster checkout at your favourite stores.</p>
            </div>
          </div>
          <Link to="/profile" className="flex-shrink-0 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Manage Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
