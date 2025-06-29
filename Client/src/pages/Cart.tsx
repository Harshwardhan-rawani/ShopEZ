/**
 * 购物车页面组件 - 显示购物车内容和管理功能
 */
import { Link } from 'react-router'
import { useApp } from '../App'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, IndianRupee } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, promoApplied, setPromoApplied, promoCode, setPromoCode } = useApp();
  const [promoError, setPromoError] = useState('');
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  // Fetch recommended products based on categories in cart
  useEffect(() => {
    if (cart.length > 0) {
      setLoadingRecommended(true);
      
      // Get unique categories from cart items
      const categories = [...new Set(cart.map(item => item.category))];
      const excludeIds = cart.map(item => item.id);
      
      axios.post(`${import.meta.env.VITE_API_URL}/api/products/recommended`, {
        categories,
        excludeIds
      })
        .then(res => {
          setRecommended(res.data);
          setLoadingRecommended(false);
        })
        .catch(err => {
          console.error('Error fetching recommended products:', err);
          setRecommended([]);
          setLoadingRecommended(false);
        });
    } else {
      setRecommended([]);
    }
  }, [cart]);

  /**
   * 计算购物车总价
   */
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  /**
   * 计算折扣
   */
  const getDiscount = () => {
    if (promoApplied) {
      return getTotalPrice() * 0.1;
    }
    return 0;
  };

  /**
   * 计算总商品数量
   */
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * 处理数量更新
   */
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
  };

  /**
   * 处理商品移除
   */
  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  /**
   * 处理应用优惠码
   */
  const handleApplyPromo = () => {
    if (promoApplied) return;
    if (promoCode.trim().toLowerCase() === 'save10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          to="/products"
          className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Unit Price: {formatCurrency(item.price)}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>- {formatCurrency(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {getTotalPrice() - getDiscount() >= 50 ? 'Free' : formatCurrency(9.99)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">
                  {formatCurrency((getTotalPrice() - getDiscount()) * 0.08)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-500">
                    {formatCurrency(
                      getTotalPrice() - getDiscount() +
                      ((getTotalPrice() - getDiscount()) >= 50 ? 0 : 9.99) +
                      ((getTotalPrice() - getDiscount()) * 0.08)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoApplied}
                  className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors ${promoApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
              {promoApplied && (
                <p className="text-green-600 text-xs mt-1">Promo code applied! You saved 10%.</p>
              )}
            </div>

            {/* Free Shipping Notice */}
            {getTotalPrice() - getDiscount() < 50 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-700">
                  Add {formatCurrency(50 - (getTotalPrice() - getDiscount()))} more to get free shipping!
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center block"
            >
              Proceed to Checkout
            </Link>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure checkout with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">You might also like</h2>
        {loadingRecommended ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recommended.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                  <p className="text-xl font-bold text-orange-500 mb-3">
                    {formatCurrency(product.price)}
                  </p>
                  <Link
                    to={`/product/${product._id}`}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-400 transition-colors text-center block"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recommendations available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
