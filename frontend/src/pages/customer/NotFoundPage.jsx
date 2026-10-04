import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">404 Error</span>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          The page you are looking for might have been moved, removed, or doesn&apos;t exist on our servers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <Link to="/browse" className="btn-secondary inline-flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
