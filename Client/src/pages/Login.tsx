/**
 * 登录页面组件 - 处理用户登录
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useApp } from '../App'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import * as api from '../services/api';

export default function Login() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 处理表单输入变化
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(formData.email, formData.password);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 快速登录演示
   */
  const quickLogin = (role: 'customer' | 'seller' | 'admin') => {
    const users = {
      customer: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'customer' as const
      },
      seller: {
        id: '2',
        name: 'John Smith',
        email: 'seller@example.com',
        role: 'seller' as const
      },
      admin: {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const
      }
    };

    setUser(users[role]);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">ShopEZ</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account to continue shopping</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Login Buttons */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => quickLogin('customer')}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Customer
            </button>
            <button
              onClick={() => quickLogin('seller')}
              className="w-full bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
            >
              Seller
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="w-full bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-500 font-semibold">
              Sign up now
            </Link>
          </p>
        </div>

        {/* Social Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
              <img
                src="https://pub-cdn.sider.ai/u/U0Y3HGZW7LV/web-coder/685ac1739ac9f9652371ce3f/resource/66f9bd9e-f036-4252-9231-a93c47866fca.jpg"
                alt="Google"
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
              <img
                src="https://pub-cdn.sider.ai/u/U0Y3HGZW7LV/web-coder/685ac1739ac9f9652371ce3f/resource/2177deb6-8d29-4595-8c77-6a667ba9b946.jpg"
                alt="Facebook"
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
