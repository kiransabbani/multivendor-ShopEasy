import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Bell, Menu, X, User, LogOut, 
  Shield, Store, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAllRead } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                ShopAI
              </span>
            </Link>
            <div className="hidden lg:flex items-center space-x-4 text-sm font-medium text-gray-600">
              <Link to="/browse" className="hover:text-blue-600 transition-colors">
                Browse Products
              </Link>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Desktop Action Icons & Profile */}
          <div className="hidden md:flex items-center space-x-5">
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link 
                  to="/wishlist" 
                  aria-label="Wishlist" 
                  className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors relative"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                <Link 
                  to="/cart" 
                  aria-label="Cart" 
                  className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors relative"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    aria-label="Notifications"
                    className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors relative focus:outline-none"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllRead} 
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div key={notif._id} className={`px-4 py-2.5 hover:bg-gray-50 transition-colors text-xs ${!notif.isRead ? 'bg-blue-50/50 font-medium' : 'text-gray-600'}`}>
                              <p className="text-gray-800">{notif.title || notif.message}</p>
                              {notif.description && <p className="text-gray-500 text-[11px] mt-0.5">{notif.description}</p>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user?.name || 'Account'}
                  </span>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-1.5 border border-gray-100 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-blue-100 text-blue-700">
                        {user?.role}
                      </span>
                    </div>

                    {user?.role === 'customer' && (
                      <>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <ShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                          My Orders
                        </Link>
                      </>
                    )}
                    {user?.role === 'vendor' && (
                      <Link 
                        to="/vendor/dashboard" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Store className="h-4 w-4 mr-2 text-gray-400" />
                        Vendor Portal
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin/dashboard" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      >
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm px-3 py-1.5 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/cart" className="relative p-2 text-gray-600">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="pt-1">
            <SearchBar onSearchSubmit={() => setIsMenuOpen(false)} />
          </div>

          <div className="space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              Browse Products
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center px-3 py-2">
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>

              {user?.role === 'customer' && (
                <>
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-gray-400" /> Wishlist
                    </span>
                  </Link>
                  <Link 
                    to="/orders" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 gap-2"
                  >
                    <ShoppingBag className="h-5 w-5 text-gray-400" /> My Orders
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 gap-2"
                  >
                    <User className="h-5 w-5 text-gray-400" /> Profile
                  </Link>
                </>
              )}

              {user?.role === 'vendor' && (
                <Link 
                  to="/vendor/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-blue-600 rounded-md bg-blue-50 gap-2"
                >
                  <Store className="h-5 w-5" /> Vendor Portal
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-base font-medium text-red-600 rounded-md bg-red-50 gap-2"
                >
                  <Shield className="h-5 w-5" /> Admin Panel
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 gap-2"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
