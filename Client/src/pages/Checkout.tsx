/**
 * 结账页面组件 - 处理订单结账流程
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useApp } from '../App'
import { CreditCard, Truck, Shield, MapPin, IndianRupee } from 'lucide-react'
import axios from 'axios'
import { load } from '@cashfreepayments/cashfree-js';
import { formatCurrency } from '../lib/currency'

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

declare global {
  interface Window {
    Cashfree: any;
  }
}

export default function Checkout() {
  const { cart, setCart, user, promoApplied } = useApp();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscount = () => {
    if (promoApplied) {
      return getSubtotal() * 0.1;
    }
    return 0;
  };
  
  const getShippingCost = () => {
    const subtotal = getSubtotal() - getDiscount();
    if (subtotal >= 50) return 0;
    return selectedShipping === 'express' ? 19.99 : 9.99;
  };

  const getTax = () => {
    return (getSubtotal() - getDiscount()) * 0.08;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscount() + getShippingCost() + getTax();
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async () => {
    setIsProcessing(true);
    try {
      const paymentRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/cashfree`, {
        orderAmount: getTotal(),
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone || '9999999999'
      });

      const paymentSessionId = paymentRes.data.paymentSessionId;
      if (!paymentSessionId) throw new Error('Missing payment session');

      const cashfree = await load({ mode: 'sandbox' });
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: '_modal',
      };

      await cashfree.checkout(checkoutOptions);

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/create-after-payment`, {
          paymentVerified: true,
          order: {
            user: user?.id,
            items: cart.map(item => ({
              product: item.id,
              sellerId: item.sellerId,
              name: item.name,
              brand: item.brand,
              image: item.image,
              quantity: item.quantity,
              price: item.price
            })),
            shippingInfo,
            shippingMethod: selectedShipping,
            total: getTotal(),
            status: 'paid'
          }
        });
        setCart([]);
        navigate('/success');
      } catch (error) {
        navigate('/failure');
      }
    } catch (err) {
      console.error('Payment init error:', err);
      alert('Something went wrong. Please try again.');
      navigate('/failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      return shippingInfo.firstName && shippingInfo.lastName && 
             shippingInfo.email && shippingInfo.address && 
             shippingInfo.city && shippingInfo.zipCode;
    }
    if (step === 2) {
      return selectedShipping;
    }
    return true;
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Method', icon: Truck },
    { number: 3, title: 'Review', icon: Shield }
  ];

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some awesome products to your cart to proceed with checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-[#F59E0B] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 mb-10 text-center">Secure Checkout</h1>
        
        {/* Step Indicator */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12 space-y-4 md:space-y-0 md:space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-[#F59E0B] text-white shadow-md' 
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    currentStep >= step.number ? 'text-[#F59E0B]' : 'text-gray-400'
                  }`}>
                    Step {step.number}
                  </p>
                  <p className={`text-sm font-bold ${
                    currentStep >= step.number ? 'text-slate-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-12 h-1 rounded-full ml-4 ${
                    currentStep > step.number ? 'bg-[#F59E0B]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Country</label>
                    <select
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                    >
                      <option value="India">India</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Shipping Method</h2>
                <div className="space-y-4">
                  <div
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-colors ${
                      selectedShipping === 'standard' ? 'border-[#F59E0B] bg-orange-50' : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedShipping('standard')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedShipping === 'standard' ? 'border-[#F59E0B]' : 'border-gray-300'}`}>
                           {selectedShipping === 'standard' && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Standard Shipping</h3>
                          <p className="text-sm font-medium text-gray-500">5-7 business days</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">
                        {getSubtotal() >= 50 ? 'FREE' : '$9.99'}
                      </span>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-colors ${
                      selectedShipping === 'express' ? 'border-[#F59E0B] bg-orange-50' : 'border-gray-100 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedShipping('express')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedShipping === 'express' ? 'border-[#F59E0B]' : 'border-gray-300'}`}>
                           {selectedShipping === 'express' && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Express Shipping</h3>
                          <p className="text-sm font-medium text-gray-500">2-3 business days</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">$19.99</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-8">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-[#FAF8F5] rounded-2xl">
                      <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center">
                         <img src={item.image} alt={item.name} className="max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                        <p className="text-sm font-medium text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-black text-slate-900 text-lg">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Summary */}
                <div className="border-t border-gray-100 pt-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Shipping Address</h3>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed bg-[#FAF8F5] p-4 rounded-xl">
                        {shippingInfo.firstName} {shippingInfo.lastName}<br/>
                        {shippingInfo.address}<br/>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br/>
                        {shippingInfo.country}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Shipping Method</h3>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed bg-[#FAF8F5] p-4 rounded-xl">
                        {selectedShipping === 'standard' ? 'Standard Shipping (5-7 days)' : 'Express Shipping (2-3 days)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-8 py-4 rounded-full font-bold text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-0"
              >
                Back
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!validateStep(currentStep)}
                  className="px-10 py-4 bg-[#F59E0B] text-white rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to {currentStep === 1 ? 'Shipping' : 'Review'}
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={isProcessing}
                  className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Shield className="w-5 h-5" />
                  <span>{isProcessing ? 'Processing Securely...' : 'Place Secure Order'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sticky top-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              {/* Cart Items (Mini) */}
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#FAF8F5] rounded-xl p-1 flex items-center justify-center">
                       <img src={item.image} alt={item.name} className="max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs font-medium text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(getSubtotal())}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-bold">Promo Discount</span>
                    <span className="font-bold">- {formatCurrency(getDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Shipping</span>
                  <span className="font-bold text-slate-900">{getShippingCost() === 0 ? 'FREE' : formatCurrency(getShippingCost())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">Est. Tax</span>
                  <span className="font-bold text-slate-900">{formatCurrency(getTax())}</span>
                </div>
                <div className="flex justify-between font-black text-xl border-t border-gray-100 pt-4 mt-4 text-slate-900">
                  <span>Total</span>
                  <span className="text-[#F59E0B]">{formatCurrency(getTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}