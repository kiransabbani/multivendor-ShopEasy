import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Store, Package, 
  ShoppingCart, DollarSign, BarChart3, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close mobile sidebar on route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Vendors', href: '/admin/vendors', icon: Store },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Commissions', href: '/admin/commissions', icon: DollarSign },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 bg-gray-950 border-b border-gray-800">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                Admin Panel
              </span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-180px)]">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isActive 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
        
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <Link
            to="/"
            className="flex items-center w-full px-3.5 py-2 text-xs font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors mb-1"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base font-semibold text-gray-800 hidden sm:block">
              {navigation.find(n => n.href === location.pathname)?.name || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Live Store
            </Link>
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-medium text-gray-700 hidden md:inline-block">
                {user?.name || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/70 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
