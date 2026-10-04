import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VendorRegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    storeName: '', storeDescription: '', contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        name,
        email,
        password,
        storeName,
        storeDescription,
        contactPhone
      } = formData;
      const userData = {
        name,
        email,
        password,
        role: 'vendor',
        storeName,
        storeDescription,
        contactPhone
      };
      
      const user = await register(userData);
      toast.success('Registration successful! Please wait for admin approval.');
      navigate(user?.role === 'vendor' ? '/vendor/dashboard' : '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Become a Vendor
        </h2>
        <div className="flex justify-center mt-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>1</div>
            <div className={`w-16 h-1 ${step === 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={nextStep}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="input mt-1" />
              </div>
              <button type="submit" className="w-full btn-primary">Next Step</button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Store Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <input name="storeName" type="text" required value={formData.storeName} onChange={handleChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                <input name="contactPhone" type="text" required value={formData.contactPhone} onChange={handleChange} className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Description</label>
                <textarea name="storeDescription" rows="4" required value={formData.storeDescription} onChange={handleChange} className="input mt-1"></textarea>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 btn-secondary">Back</button>
                <button type="submit" disabled={loading} className="w-2/3 btn-primary">
                  {loading ? 'Submitting...' : 'Register Store'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
