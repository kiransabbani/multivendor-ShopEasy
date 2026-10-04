import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import BrowsePage from './pages/customer/BrowsePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import InvoicePage from './pages/customer/InvoicePage';
import ProfilePage from './pages/customer/ProfilePage';
import WishlistPage from './pages/customer/WishlistPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import { AboutPage, ContactPage, FAQPage } from './pages/customer/StaticPages';
import NotFoundPage from './pages/customer/NotFoundPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VendorRegisterPage from './pages/auth/VendorRegisterPage';

// Vendor Layout & Pages
import VendorLayout from './layouts/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorInventory from './pages/vendor/VendorInventory';
import VendorForecasting from './pages/vendor/VendorForecasting';
import VendorProduction from './pages/vendor/VendorProduction';
import VendorReorder from './pages/vendor/VendorReorder';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorProfile from './pages/vendor/VendorProfile';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <Routes>
            {/* Public and Customer Routes with Navbar/Footer */}
            <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
            <Route path="/browse" element={<><Navbar /><BrowsePage /><Footer /></>} />
            <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
            <Route path="/faq" element={<><Navbar /><FAQPage /><Footer /></>} />
            <Route path="/login" element={<><Navbar /><LoginPage /><Footer /></>} />
            <Route path="/register" element={<><Navbar /><RegisterPage /><Footer /></>} />
            <Route path="/vendor/register" element={<><Navbar /><VendorRegisterPage /><Footer /></>} />

            {/* Protected Customer Routes */}
            <Route path="/cart" element={<ProtectedRoute role="customer"><Navbar /><CartPage /><Footer /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute role="customer"><Navbar /><WishlistPage /><Footer /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute role="customer"><Navbar /><CheckoutPage /><Footer /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute role="customer"><Navbar /><OrderHistoryPage /><Footer /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute role="customer"><Navbar /><OrderDetailPage /><Footer /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute role="customer"><Navbar /><InvoicePage /><Footer /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute role="customer"><Navbar /><ProfilePage /><Footer /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute role="customer"><Navbar /><CustomerDashboard /><Footer /></ProtectedRoute>} />

            {/* Protected Vendor Routes */}
            <Route path="/vendor" element={<ProtectedRoute role="vendor"><VendorLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="inventory" element={<VendorInventory />} />
              <Route path="forecasting" element={<VendorForecasting />} />
              <Route path="production" element={<VendorProduction />} />
              <Route path="reorder" element={<VendorReorder />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="profile" element={<VendorProfile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="commissions" element={<AdminCommissions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 Fallback Route */}
            <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />
          </Routes>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
