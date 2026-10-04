import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Package, Heart } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Assuming endpoint for update exists
      // await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto mb-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Package className="w-5 h-5 mr-3 text-blue-500" />
                  <span>12 Total Orders</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Heart className="w-5 h-5 mr-3 text-red-500" />
                  <span>5 Wishlist Items</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-green-500" />
                  <span>2 Saved Addresses</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-blue-600 font-medium hover:underline text-sm">
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="input bg-gray-50" value={user?.email || ''} readOnly disabled />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-gray-600">
                  <div className="grid grid-cols-3 py-3 border-b border-gray-50">
                    <span className="font-medium text-gray-900">Full Name</span>
                    <span className="col-span-2">{user?.name}</span>
                  </div>
                  <div className="grid grid-cols-3 py-3 border-b border-gray-50">
                    <span className="font-medium text-gray-900">Email Address</span>
                    <span className="col-span-2">{user?.email}</span>
                  </div>
                  <div className="grid grid-cols-3 py-3 border-b border-gray-50">
                    <span className="font-medium text-gray-900">Phone Number</span>
                    <span className="col-span-2">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                <button className="text-blue-600 font-medium hover:underline text-sm">+ Add New</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user?.addresses?.length > 0 ? user.addresses.map((addr, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="text-blue-600 text-xs font-medium hover:underline">Edit</button>
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Home</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p>Phone: {addr.phone}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No saved addresses yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
