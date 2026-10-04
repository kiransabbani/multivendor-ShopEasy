import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
              ShopAI
            </h3>
            <p className="text-gray-400 mb-4">
              Your one-stop destination for AI-powered shopping. Discover top products from India&apos;s best vendors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/vendor/register" className="hover:text-white">Become a Vendor</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/browse?category=electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link to="/browse?category=fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link to="/browse?category=home" className="hover:text-white">Home & Garden</Link></li>
              <li><Link to="/browse?category=beauty" className="hover:text-white">Beauty & Health</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>123 AI Street, Tech Park</li>
              <li>Bangalore, India 560001</li>
              <li>Email: support@shopai.com</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ShopAI Multi-vendor Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
