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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">ShopEZ</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-orange-500 transition-colors">
              Products
            </Link>
            
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>
                
                {(user.role === 'seller' || user.role === 'admin') && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/analytics" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Analytics
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-orange-500 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Sign Up
                </Link>
              </>
            )}

            {/* Shopping Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
