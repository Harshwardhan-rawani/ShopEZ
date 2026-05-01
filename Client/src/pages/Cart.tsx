/**
 * 购物车页面组件 - 显示购物车内容和管理功能
 */
import { Link } from 'react-router'
import { useApp } from '../App'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, IndianRupee } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'
import ProductCard from '../components/ui/ProductCard'

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, promoApplied, setPromoApplied, promoCode, setPromoCode, addToCart } = useApp();
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

  const handleAddToCartRecommended = (product: any) => {
    addToCart({
      ...product,
      name: product.name,
      image: product.images?.[0],
      quantity: 1
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-16 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-[#F59E0B] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-500">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          to="/products"
          className="flex items-center text-[#F59E0B] hover:text-orange-600 transition-colors font-medium mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Recommendations & Cart Items */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recommended Products (Moved Above the fold) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-slate-900">You might also like</h2>
            </div>

            {loadingRecommended ? (
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="min-w-[220px] w-[220px] flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gray-100"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommended.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {recommended.map((product) => (
                  <div key={product._id} className="min-w-[220px] w-[220px] flex-shrink-0">
                    <ProductCard product={product} onAddToCart={handleAddToCartRecommended} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recommendations available at the moment.</p>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Items</h2>
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-stretch space-y-4 sm:space-y-0 sm:space-x-6 hover:border-orange-200 transition-colors">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-contain bg-[#FAF8F5] rounded-xl p-2"
                />

                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-[#FAF8F5] rounded-full px-1 py-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-600 hover:text-[#F59E0B] shadow-sm disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-600 hover:text-[#F59E0B] shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex items-center sm:items-end justify-between sm:flex-col pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto">
                  <span className="sm:hidden text-sm text-gray-500 font-medium">Total:</span>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(getTotalPrice())}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span className="font-semibold">- {formatCurrency(getDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-slate-900">
                  {getTotalPrice() - getDiscount() >= 50 ? 'Free' : formatCurrency(9.99)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Tax</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency((getTotalPrice() - getDiscount()) * 0.08)}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-[#F59E0B]">
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
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Promo Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B] text-sm"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoApplied}
                  className={`bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors ${promoApplied ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F59E0B]'}`}
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-2 font-medium">{promoError}</p>}
              {promoApplied && (
                <p className="text-green-600 text-xs mt-2 font-medium">Promo code applied! You saved 10%.</p>
              )}
            </div>

            {/* Free Shipping Notice */}
            {getTotalPrice() - getDiscount() < 50 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start space-x-3">
                <span className="text-xl">🚚</span>
                <p className="text-sm text-orange-800 font-medium leading-relaxed">
                  Add <span className="font-bold">{formatCurrency(50 - (getTotalPrice() - getDiscount()))}</span> more to your cart to get free shipping!
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full bg-[#F59E0B] text-white py-4 px-6 rounded-full font-bold hover:bg-orange-600 transition-colors text-center block shadow-sm hover:shadow-md"
            >
              Proceed to Checkout
            </Link>

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <p className="text-xs font-medium uppercase tracking-wide">
                Secure SSL Checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ensure style exists for horizontal hide scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
