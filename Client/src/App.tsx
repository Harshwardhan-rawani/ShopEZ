/**
 * 主应用组件 - 定义整个应用的路由结构
 */
import { BrowserRouter, Route, Routes } from 'react-router'
import { createContext, useContext, useEffect, useState } from 'react'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Navbar from './components/Navbar'
import { Navigate } from 'react-router'
import Success from './pages/Success'
import Failure from './pages/Failure'

/**
 * 应用上下文类型定义
 */
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  promoApplied: boolean;
  setPromoApplied: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
}

/**
 * 用户数据类型
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}

/**
 * 购物车商品类型
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  brand: string;
  category: string;
}

/**
 * 产品数据类型
 */
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  discount?: number;
  sellerId?: string;
  brand?: string;
}

// 创建应用上下文
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 自定义Hook - 获取应用上下文
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

/**
 * 私有路由组件 - 仅在本地有token时允许访问
 */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Auto-login: fetch user info if token exists and user is not set
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  /**
   * 添加商品到购物车
   */
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        sellerId: product.sellerId || '',
        brand: product.brand || '',
        category: product.category
      }];
    });
  };

  /**
   * 从购物车移除商品
   */
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  /**
   * 更新购物车商品数量
   */
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const contextValue: AppContextType = {
    user,
    setUser,
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    promoApplied,
    setPromoApplied,
    promoCode,
    setPromoCode
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              }
            />
            <Route path="/success" element={<Success />} />
            <Route path="/failure" element={<Failure />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

// 导出类型以供其他组件使用
export type { User, CartItem, Product };
