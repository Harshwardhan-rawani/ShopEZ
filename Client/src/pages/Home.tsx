/**
 * 首页组件 - 展示网站主要功能和特色产品
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Search, Package, MapPin, Truck, Headphones, Award } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'
import ProductCard from '../components/ui/ProductCard'

export default function Home() {
  const { addToCart, user } = useApp();
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: any[] }>({});
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products by category from backend
    const fetchPromises = [
      axios.get(`${import.meta.env.VITE_API_URL}/api/products/by-category`)
    ];

    if (user) {
      fetchPromises.push(
        axios.get(`${import.meta.env.VITE_API_URL}/api/products/recommendations/personalized`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      );
    }

    Promise.allSettled(fetchPromises)
      .then(results => {
        if (results[0].status === 'fulfilled') {
          setProductsByCategory(results[0].value.data);
        }
        if (results[1] && results[1].status === 'fulfilled') {
          setRecommendedProducts(results[1].value.data);
        }
        setLoading(false);
      });
  }, [user]);

  /**
   * 处理添加到购物车
   */
  const handleAddToCart = (product: any) => {
    addToCart({
      ...product,
      name: product.name,
      image: product.images?.[0],
      quantity: 1
    });
  };

  // Get all categories
  const categories = Object.keys(productsByCategory);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="bg-white mx-4 md:mx-8 mt-6 rounded-2xl overflow-hidden relative border border-gray-100">
        <div className="container mx-auto px-6 md:px-16 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="w-8 h-[2px] bg-[#F59E0B]"></span>
                <span className="text-[#F59E0B] font-semibold text-sm tracking-widest uppercase">Premium Store</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight uppercase">
                Shop Computers & Accessories
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
                Shop laptops, desktops, monitors, tablets, PC gaming, hard drives and storage, accessories and more.
              </p>
              <Link
                to="/products"
                className="inline-block bg-white text-slate-900 px-8 py-3.5 border-2 border-slate-200 rounded-full font-bold hover:border-slate-900 transition-colors"
              >
                View more
              </Link>
            </div>
            <div className="flex justify-center md:justify-end relative">
              <img
                src="/hero-image.png"
                alt="Modern Electronics Setup"
                className="w-full max-w-lg object-contain aspect-square"
              />
              <div className="absolute top-10 right-10 bg-[#F59E0B] text-white w-16 h-16 flex items-center justify-center rounded-full font-bold shadow-lg transform rotate-12">
                -20%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Top Strip */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-wrap items-center justify-between gap-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-10 h-10 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hi, {user.name}</p>
                <p className="font-semibold text-slate-900">Recommendations for you!</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Welcome to ShopEZ</p>
                <Link to="/login" className="font-semibold text-[#F59E0B] hover:underline">Sign in for recommendations</Link>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-12 flex-1 justify-center border-l border-gray-100 pl-8 ml-4">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
                <Package className="w-5 h-5 text-[#F59E0B] group-hover:text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Your Orders</p>
                <p className="text-xs text-gray-500">Track & return</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Electronics</p>
                <p className="text-xs text-[#F59E0B]">Big Sale 20%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop By Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Shop by categories</h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-[#F59E0B] font-medium hidden md:block">
            All departments →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category, idx) => (
            <Link key={category} to={`/products?category=${category}`} className="group bg-white rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-100 hover:border-[#F59E0B] transition-all text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                {productsByCategory[category]?.[0]?.images?.[0] ? (
                  <img src={productsByCategory[category][0].images[0]} alt={category} className="w-16 h-16 object-contain mix-blend-multiply" />
                ) : (
                  <Search className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            </Link>
          ))}
          {/* Static placeholders to fill grid if categories are few */}
          {categories.length < 5 && (
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-100 text-center opacity-50">
              <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">More coming...</h3>
            </div>
          )}
        </div>
      </section>

      {/* Delivery Banner */}
      <div className="container mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="relative z-10 max-w-lg mb-8 md:mb-0">
            <div className="text-[#F59E0B] font-bold text-xs tracking-wider uppercase mb-2">Worldwide Shipping</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 uppercase">ShopEZ Delivers To You</h2>
            <p className="text-gray-500 mb-6">Worldwide shipping. We deliver to over 100 countries and regions, right to your doorstep.</p>
            <Link to="/products" className="inline-block bg-white text-slate-900 px-6 py-2.5 border-2 border-slate-200 rounded-full font-bold hover:border-slate-900 transition-colors text-sm">
              View more
            </Link>
          </div>
          <div className="relative w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="w-48 h-48 bg-orange-50 rounded-full flex items-center justify-center absolute -top-4 right-10 -z-10"></div>
            <Truck className="w-40 h-40 text-[#F59E0B] opacity-80" />
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      {!loading && recommendedProducts.length > 0 && (
        <section className="container mx-auto px-4 mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Most viewed</h2>
            <Link to="/products" className="text-sm text-gray-500 hover:text-[#F59E0B] font-medium hidden md:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendedProducts.slice(0, 5).map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Products by Category (Top Sellers look) */}
      {loading ? (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-gray-500">Loading amazing products...</p>
          </div>
        </section>
      ) : (
        categories.slice(0, 2).map((category) => (
          <section key={category} className="container mx-auto px-4 mb-16">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Top sellers in {category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <Link to={`/products?category=${category}`} className="text-sm text-gray-500 hover:text-[#F59E0B] font-medium hidden md:block">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productsByCategory[category].slice(0, 5).map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Subscribe Section */}
      <section className="container mx-auto px-4 py-16 mb-8">
        <div className="bg-white rounded-3xl p-8 md:p-16 border border-gray-100 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="max-w-xl relative z-10 mb-8 md:mb-0">
            <div className="text-gray-400 font-bold text-xs tracking-wider uppercase mb-2">Stay up to date</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 uppercase">Subscribe to the news</h2>
            <p className="text-gray-500 mb-6">Be aware of all discounts and bargains! Don't miss your benefit.</p>
            <div className="flex">
              <input type="email" placeholder="Email address..." className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-l-full w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-[#F59E0B]" />
              <button className="bg-slate-900 text-white px-8 py-3 rounded-r-full font-bold hover:bg-[#F59E0B] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="relative z-10 flex justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-100 rounded-full flex items-center justify-center">
              <Award className="w-16 h-16 md:w-20 md:h-20 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF7F2] border-t border-gray-200 py-16">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Get to Know Us</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#F59E0B]">Careers</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Blog</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">About ShopEZ</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Investor Relations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Make Money with Us</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#F59E0B]">Sell products on ShopEZ</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Sell on ShopEZ Business</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Become an Affiliate</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Advertise Your Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">ShopEZ Payment Products</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#F59E0B]">ShopEZ Business Card</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Shop with Points</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Reload Your Balance</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">ShopEZ Currency Converter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Let Us Help You</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-[#F59E0B]">Your Account</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Your Orders</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Shipping Rates & Policies</Link></li>
              <li><Link to="/" className="hover:text-[#F59E0B]">Returns & Replacements</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="/" className="hover:text-[#F59E0B]">Conditions of Use</Link>
            <Link to="/" className="hover:text-[#F59E0B]">Privacy Notice</Link>
            <Link to="/" className="hover:text-[#F59E0B]">Consumer Health Data</Link>
          </div>
          <p>© 2026-2027, ShopEZ.com, Inc. or its affiliates</p>
        </div>
      </footer>
    </div>
  );
}