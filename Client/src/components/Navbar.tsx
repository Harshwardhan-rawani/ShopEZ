/**
 * 导航栏组件 - 提供网站主要导航功能
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useApp } from '../App'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, setUser, cart } = useApp();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();

  };

  /**
   * 处理搜索提交
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  /**
   * 计算购物车商品总数
   */
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-xl tracking-tighter">S</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">ShopEZ</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium products..."
                className="w-full px-5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white focus:border-orange-500 transition-all duration-300 w-64 focus:w-full"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
              Products
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>

                {(user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-orange-500 transition-colors shadow-sm hover:shadow-md">
                  Join Now
                </Link>
              </div>
            )}

            {/* Shopping Cart */}
            <Link to="/cart" className="relative group p-2 hover:bg-orange-50 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-orange-500"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <Link
                to="/products"
                className="block py-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 hover:text-orange-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  {(user.role === 'seller' || user.role === 'admin') && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block py-2 text-gray-700 hover:text-orange-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/analytics"
                        className="block py-2 text-gray-700 hover:text-orange-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-gray-700 hover:text-orange-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-gray-700 hover:text-orange-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-gray-700 hover:text-orange-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <Link
                to="/cart"
                className="flex items-center py-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cartItemsCount})
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
