import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MapPin, CreditCard, CheckCircle, Package } from 'lucide-react';
import { cartAPI, ordersAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl, handleImageError } from '../../utils/helpers';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', pincode: '', name: '', phone: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartAPI.get();
        setCart(res.data.data);
      } catch {
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.18;
  const delivery = subtotal > 999 ? 0 : 50;
  const total = subtotal + tax + delivery;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    setPlacing(true);
    try {
      const res = await ordersAPI.place({ shippingAddress, paymentMethod });
      setOrderSuccess(res.data.data);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (orderSuccess) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-6">Your order has been placed successfully.</p>
        {Array.isArray(orderSuccess) ? orderSuccess.map(o => (
          <div key={o._id} className="bg-gray-50 rounded-xl p-4 mb-3 text-left">
            <p className="font-semibold text-blue-700">{o.orderNumber}</p>
            <p className="text-sm text-gray-600">Total: ₹{o.totalAmount?.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Status: {o.status}</p>
          </div>
        )) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-3 text-left">
            <p className="font-semibold text-blue-700">{orderSuccess.orderNumber}</p>
            <p className="text-sm text-gray-600">Total: ₹{orderSuccess.totalAmount?.toFixed(2)}</p>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/orders')} className="flex-1 btn-primary">View Orders</button>
          <button onClick={() => navigate('/browse')} className="flex-1 btn-secondary">Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-10">
        {[{ n: 1, label: 'Address', icon: MapPin }, { n: 2, label: 'Payment', icon: CreditCard }, { n: 3, label: 'Confirm', icon: Package }].map(({ n, label }, i) => (
          <React.Fragment key={n}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > n ? <CheckCircle className="w-5 h-5" /> : n}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= n ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-1 mx-3 rounded ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input className="input" value={shippingAddress.name} onChange={e => setShippingAddress(p => ({...p, name: e.target.value}))} placeholder="John Doe" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className="input" value={shippingAddress.phone} onChange={e => setShippingAddress(p => ({...p, phone: e.target.value}))} placeholder="9876543210" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label><input className="input" value={shippingAddress.street} onChange={e => setShippingAddress(p => ({...p, street: e.target.value}))} placeholder="123, MG Road" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input className="input" value={shippingAddress.city} onChange={e => setShippingAddress(p => ({...p, city: e.target.value}))} placeholder="Mumbai" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input className="input" value={shippingAddress.state} onChange={e => setShippingAddress(p => ({...p, state: e.target.value}))} placeholder="Maharashtra" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label><input className="input" value={shippingAddress.pincode} onChange={e => setShippingAddress(p => ({...p, pincode: e.target.value}))} placeholder="400001" /></div>
              </div>
              <button onClick={() => { if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) { toast.error('Fill required fields'); return; } setStep(2); }} className="btn-primary mt-6 w-full">Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Payment Method</h2>
              <div className="space-y-3">
                {[{ val: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' }, { val: 'online', label: 'Online Payment', desc: 'Credit/Debit card, UPI, Net Banking' }].map(opt => (
                  <label key={opt.val} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === opt.val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={opt.val} checked={paymentMethod === opt.val} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Order Review</h2>
              <div className="space-y-3 mb-6">
                {cart?.items?.map(item => (
                  <div key={item._id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                    <img 
                      src={getProductImageUrl(item.product)} 
                      alt={item.product?.name} 
                      onError={(e) => handleImageError(e)}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100" 
                    />
                    <div className="flex-1"><p className="font-medium text-gray-900 text-sm">{item.product?.name || 'Product'}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                    <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Address:</span><span className="font-medium text-right">{shippingAddress.street}, {shippingAddress.city} - {shippingAddress.pincode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment:</span><span className="font-medium capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1">
                  {placing ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card h-fit sticky top-4">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600"><span>Subtotal ({cart?.items?.length || 0} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span className="text-blue-600">₹{total.toFixed(2)}</span>
          </div>
          {subtotal < 999 && <p className="text-xs text-green-600 mt-2">Add ₹{(999 - subtotal).toFixed(0)} more for free delivery!</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
