import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingBag, Zap, TrendingUp, Shield } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { label: 'Admin', email: 'admin@multivendor.com', password: 'admin123', color: 'from-rose-500 to-red-600' },
  { label: 'Vendor', email: 'vendor1@multivendor.com', password: 'vendor123', color: 'from-blue-500 to-indigo-600' },
  { label: 'Customer', email: 'customer1@example.com', password: 'customer123', color: 'from-emerald-500 to-teal-600' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" style={{transform: 'translate(40%, -40%)'}} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" style={{transform: 'translate(-40%, 40%)'}} />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">ShopAI</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              The AI-Powered<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Multi-Vendor
              </span><br />
              Commerce Platform
            </h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Demand forecasting, smart inventory, production intelligence — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Zap, label: 'AI Demand Forecasting', desc: 'LSTM-powered 7/30-day predictions' },
              { icon: TrendingUp, label: 'Production Intelligence', desc: 'Smart hike recommendations' },
              { icon: Shield, label: 'Secure Multi-Role Auth', desc: 'Admin, Vendor & Customer portals' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center space-x-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          © 2026 ShopAI Platform. Built for production-grade e-commerce.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center space-x-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">ShopAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Quick-fill credential pills */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Quick Demo Access</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => fillCredentials(cred)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${cred.color} hover:opacity-90 transition-opacity shadow-sm`}
                >
                  {cred.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input id="remember-me" type="checkbox" className="h-3.5 w-3.5 rounded text-blue-600 border-gray-300" />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register & Vendor links */}
          <div className="space-y-3">
            <Link
              to="/register"
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              Create Customer Account
            </Link>
            <Link
              to="/vendor/register"
              className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              Register as Vendor →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


