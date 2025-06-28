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

  /**
   * 处理表单输入变化
   */
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  /**
   * 处理订单提交
   */


const handleSubmitOrder = async () => {
  setIsProcessing(true);

  try {
    // 1. Get payment session from backend
    const paymentRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/cashfree`, {
      orderAmount: getTotal(),
      customerEmail: shippingInfo.email,
      customerPhone: shippingInfo.phone
    });

    const paymentSessionId = paymentRes.data.paymentSessionId;
    if (!paymentSessionId) throw new Error('Missing payment session');

    // 2. Load Cashfree SDK (returns instance!)
    const cashfree = await load({ mode: 'sandbox' });

    // 3. Define checkout options
    const checkoutOptions = {
      paymentSessionId,
      redirectTarget: '_modal',
    };

    // 4. Launch Cashfree Checkout
    await cashfree.checkout(checkoutOptions);

    // 5. Save order after payment (simulate success/failure)
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





  /**
   * 验证步骤
   */
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
    { number: 1, title: 'Shipping Information', icon: MapPin },
    { number: 2, title: 'Shipping Method', icon: Truck },
    { number: 3, title: 'Review Order', icon: Shield }
  ];

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart to proceed with checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      
      {/* Step Indicator */}
 <div className="flex items-center justify-center mb-12 space-x-4">
  {steps.map((step, index) => {
    const Icon = step.icon;
    return (
      <div key={step.number} className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
          currentStep >= step.number 
            ? 'bg-orange-500 border-orange-500 text-white' 
            : 'bg-white border-gray-300 text-gray-500'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-2">
          <p className={`text-sm font-medium ${
            currentStep >= step.number ? 'text-orange-600' : 'text-gray-500'
          }`}>
            Step {step.number}
          </p>
          <p className={`text-xs ${
            currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {step.title}
          </p>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-8 h-0.5 ml-3 ${
            currentStep > step.number ? 'bg-orange-500' : 'bg-gray-300'
          }`} />
        )}
      </div>
    );
  })}
</div>


      <div className="grid lg:grid-cols-3 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  >
                    <option value="India">India</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedShipping === 'standard' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedShipping('standard')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Standard Shipping</h3>
                      <p className="text-sm text-gray-600">5-7 business days</p>
                    </div>
                    <span className="font-semibold">
                      {getSubtotal() >= 50 ? 'FREE' : '$9.99'}
                    </span>
                  </div>
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedShipping === 'express' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedShipping('express')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Express Shipping</h3>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                    <span className="font-semibold">$19.99</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping & Payment Summary */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br/>
                      {shippingInfo.address}<br/>
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br/>
                      {shippingInfo.country}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Shipping Method</h3>
                    <p className="text-sm text-gray-600">
                      {selectedShipping === 'standard' ? 'Standard Shipping (5-7 days)' : 'Express Shipping (2-3 days)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>{isProcessing ? 'Processing...' : 'Place Order'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(getSubtotal())}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>- {formatCurrency(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{getShippingCost() === 0 ? 'FREE' : formatCurrency(getShippingCost())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(getTax())}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}