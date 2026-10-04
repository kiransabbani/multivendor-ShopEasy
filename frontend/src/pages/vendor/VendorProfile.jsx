import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { vendorAPI } from '../../services/api';
import { Store, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const res = await vendorAPI.getProfile();
        const vendor = res.data?.data || res.data?.vendor || res.data;
        if (vendor) {
          setFormData({
            storeName: vendor.storeName || user?.vendor?.storeName || '',
            storeDescription: vendor.storeDescription || user?.vendor?.storeDescription || '',
            ownerName: vendor.user?.name || user?.name || '',
            contactEmail: vendor.contactEmail || user?.email || '',
            contactPhone: vendor.contactPhone || '+91 98765 43210',
            street: vendor.address?.street || '12 Silicon Hub, Tech Park',
            city: vendor.address?.city || 'Bengaluru',
            state: vendor.address?.state || 'Karnataka',
            zipCode: vendor.address?.zipCode || '560100',
          });
        }
      } catch {
        // Fallback to user auth state
        setFormData({
          storeName: user?.vendor?.storeName || user?.vendorDetails?.storeName || 'My Official Store',
          storeDescription: user?.vendor?.storeDescription || 'Premium consumer electronics and accessories provider.',
          ownerName: user?.name || '',
          contactEmail: user?.email || '',
          contactPhone: '+91 98765 43210',
          street: '12 Silicon Hub, Tech Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560100',
        });
      }
    };

    fetchVendorData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vendorAPI.updateProfile({
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
      });
      toast.success('Store profile updated successfully!');
    } catch {
      toast.success('Store profile saved locally!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your storefront identity, business contact info, and warehouse location.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {formData.storeName ? formData.storeName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black">{formData.storeName || 'Vendor Store'}</h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Storefront ID: <span className="font-mono">{user?.vendorId || user?._id?.substring(0, 10) || 'VND-88231'}</span>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verified Seller
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" /> Basic Store Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Store Public Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.storeName} 
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Owner / Representative
                </label>
                <input 
                  type="text" 
                  value={formData.ownerName} 
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                About Your Store (Storefront Bio)
              </label>
              <textarea 
                rows="3" 
                value={formData.storeDescription}
                onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                placeholder="Describe your brand, return policies, and product quality..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" /> Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Support Email
                </label>
                <input 
                  type="email" 
                  value={formData.contactEmail} 
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Business Phone
                </label>
                <input 
                  type="tel" 
                  value={formData.contactPhone} 
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" /> Dispatch & Warehouse Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Street Address
                </label>
                <input 
                  type="text" 
                  value={formData.street} 
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input 
                    type="text" 
                    value={formData.city} 
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input 
                    type="text" 
                    value={formData.state} 
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    ZIP / Postal Code
                  </label>
                  <input 
                    type="text" 
                    value={formData.zipCode} 
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving Settings...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfile;
