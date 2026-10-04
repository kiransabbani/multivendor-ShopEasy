import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, BarChart3, TrendingUp, 
  LogOut, Factory, RotateCw, ShoppingCart, User, Menu, X, ArrowLeft
} from 'lucide-react';

const VendorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/vendor/products', icon: Package },
    { name: 'Inventory', href: '/vendor/inventory', icon: BarChart3 },
    { name: 'Forecasting', href: '/vendor/forecasting', icon: TrendingUp },
    { name: 'Production', href: '/vendor/production', icon: Factory },
    { name: 'Reorder', href: '/vendor/reorder', icon: RotateCw },
    { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/vendor/profile', icon: User },
  ];

  const storeName = user?.vendor?.storeName || user?.vendorDetails?.storeName || user?.name || 'Vendor Store';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 bg-[#1e293b] border-b border-gray-800">
            <Link to="/vendor/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                ShopAI Vendor
              </span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Vendor Details */}
          <div className="p-4 border-b border-gray-800/60">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-white">{storeName}</p>
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Verified Vendor
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-230px)]">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0c1322]">
          <Link
            to="/"
            className="flex items-center w-full px-3.5 py-2 text-xs font-medium text-gray-400 rounded-lg hover:bg-[#1e293b] hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="mr-2.5 h-4 w-4" />
            Back to Marketplace
          </Link>
          <button
            onClick={logout}
            className="flex items-center w-full px-3.5 py-2 text-xs font-medium text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base font-semibold text-gray-800 hidden sm:block">
              {navigation.find(n => n.href === location.pathname)?.name || 'Vendor Portal'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Storefront
            </Link>
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-700 hidden md:inline-block max-w-[120px] truncate">
                {storeName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/70 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
