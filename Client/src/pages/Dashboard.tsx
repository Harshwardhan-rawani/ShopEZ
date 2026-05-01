/**
 * 商家仪表板页面组件 - 管理订单和产品
 */
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { Package, DollarSign, ShoppingBag, Users, Eye, Edit, Trash2, Plus, UploadCloud, IndianRupee, X, MapPin } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'

interface Order {
  _id: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  items: any[];
  amount: number;
  total?: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | string;
  paymentStatus: 'paid' | 'unpaid';
  date: string;
  createdAt: string;
  shippingInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  images: string[];
  sellerId: string;
  brand?: string;
  description?: string;
  category?: string;
  discount?: number;
}

export default function Dashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    images: [],
    brand: '',
    discount: 0,
    description: '',
    category: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch only this seller's products and orders
  useEffect(() => {
    if (user?.role === 'seller' || user?.role === 'admin') {
      axios.get(`${import.meta.env.VITE_API_URL}/api/products?sellerId=${user.id}`)
        .then(res => setProducts(res.data))
        .catch(() => setProducts([]));
      axios.get(`${import.meta.env.VITE_API_URL}/api/orders?sellerId=${user.id}`)
        .then(res => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  }, [user]);

  // Order status color (Modern flat badges)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Payment status color (Modern flat badges)
  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prevOrders => 
        prevOrders.map(order => order._id === orderId ? { ...order, status: newStatus } : order)
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    }
  };

  // Fetch complete customer details
  const handleViewCustomerDetails = async (orderId: string) => {
    setLoadingCustomer(true);
    setShowCustomerModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/customer`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCustomer(response.data);
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      alert('Failed to fetch customer details');
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          throw new Error('Image upload failed');
        }
      }
      setProductForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image(s).');
    } finally {
      setUploading(false);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (productForm._id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${productForm._id}`, { ...productForm, sellerId: user?.id }, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, { ...productForm, sellerId: user?.id }, config);
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?sellerId=${user?.id}`, config);
      setProducts(res.data);
      setShowProductModal(false);
      setProductForm({ name: '', price: 0, stock: 0, images: [], brand: '', description: '', category: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setProducts(products.filter(p => p._id !== id));
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-8">This productive space is reserved exclusively for sellers and admins.</p>
      </div>
    );
  }

  // Stats - Only count shipped orders in revenue
  const shippedOrders = orders.filter(order => order.status === 'delivered');
  const totalRevenue = shippedOrders.reduce((sum, order) => sum + (order.amount || order.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = new Set(orders.map(order => order.user?._id)).size;

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
           <div>
             <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Seller Dashboard</h1>
             <p className="text-gray-500 font-medium">Manage your products, orders, and track your business growth.</p>
           </div>
           
           {/* Modern Pill Navigation */}
           <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-gray-100 mt-6 md:mt-0 shadow-sm">
             {[
               { key: 'overview', label: 'Overview', icon: DollarSign },
               { key: 'orders', label: 'Orders', icon: Package },
               { key: 'products', label: 'Products', icon: ShoppingBag }
             ].map(tab => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.key;
               return (
                 <button
                   key={tab.key}
                   onClick={() => setActiveTab(tab.key as any)}
                   className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                     isActive
                       ? 'bg-[#F59E0B] text-white shadow-md'
                       : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                   }`}
                 >
                   <Icon className="w-4 h-4" />
                   <span>{tab.label}</span>
                 </button>
               );
             })}
           </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-orange-200 transition-colors shadow-sm">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Revenue</p>
                <p className="text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-orange-200 transition-colors shadow-sm">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Orders</p>
                <p className="text-3xl font-black text-slate-900">{totalOrders}</p>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-orange-200 transition-colors shadow-sm">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Products</p>
                <p className="text-3xl font-black text-slate-900">{totalProducts}</p>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-orange-200 transition-colors shadow-sm">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Customers</p>
                <p className="text-3xl font-black text-slate-900">{totalCustomers}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-[#F59E0B] hover:text-orange-600">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#FAF8F5]">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-900">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{order.user?.firstName + ' ' + order.user?.lastName}</div>
                          <button
                            onClick={() => handleViewCustomerDetails(order._id)}
                            className="text-[#F59E0B] hover:text-orange-600 text-xs font-medium flex items-center mt-1"
                          >
                            View Details <Eye className="w-3 h-3 ml-1" />
                          </button>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-900">
                          {formatCurrency(order.amount || order.total || 0)}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No orders yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-black text-slate-900">Full Order Management</h2>
              <p className="text-sm text-gray-500 mt-1">Track and update the status of all your orders here.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#FAF8F5]">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount & Payment</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">#{order._id.slice(-6).toUpperCase()}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt || order.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{order.user?.firstName + ' ' + order.user?.lastName}</div>
                        <button
                          onClick={() => handleViewCustomerDetails(order._id)}
                          className="text-[#F59E0B] hover:text-orange-600 text-xs font-medium flex items-center mt-1"
                        >
                          View Details <Eye className="w-3 h-3 ml-1" />
                        </button>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items?.slice(0,3).map((i, idx) => (
                            <img
                              key={idx}
                              src={i.image || i.images?.[0]}
                              alt={i.name}
                              className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                              title={i.name || i.product}
                            />
                          ))}
                          {order.items?.length > 3 && (
                            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 text-xs font-bold text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-black text-slate-900 mb-2">{formatCurrency(order.amount || order.total || 0)}</div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getPaymentStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="relative">
                           <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`appearance-none w-full pl-4 pr-10 py-2.5 text-xs font-bold rounded-xl outline-none focus:ring-2 focus:ring-[#F59E0B] cursor-pointer border transition-colors ${getStatusBadge(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900">Inventory Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your storefront catalog.</p>
              </div>
              <button
                className="flex items-center space-x-2 bg-[#F59E0B] text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm"
                onClick={() => {
                  setProductForm({ name: '', price: 0, stock: 0, images: [], brand: '', description: '', category: '' });
                  setShowProductModal(true);
                }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-orange-200 transition-colors shadow-sm flex flex-col">
                  <div className="p-6 pb-0 flex-grow">
                    <div className="bg-[#FAF8F5] rounded-2xl p-4 flex items-center justify-center mb-6 aspect-square relative">
                       <img
                         src={product.images[0]}
                         alt={product.name}
                         className="max-h-full object-contain mix-blend-multiply"
                       />
                       <span className={`absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">{product.category} • {product.brand}</p>
                    
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Price</p>
                        <span className="text-xl font-black text-[#F59E0B]">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-gray-400 font-bold uppercase mb-1">Stock / Sold</p>
                         <span className="text-sm font-bold text-slate-700">{product.stock} / {product.sold || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 border-t border-gray-50 mt-auto flex space-x-3">
                    <button
                      className="flex-1 bg-gray-50 text-slate-900 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteProduct(product._id)}
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products yet</h3>
                <p className="text-gray-500">Start adding products to your catalog to make sales.</p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative my-8 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <button
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900">
                  {productForm._id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Fill in the product details to list it on the store.</p>
              </div>
              
              <form onSubmit={handleSaveProduct} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product Name</label>
                    <input
                      name="name"
                      value={productForm.name || ''}
                      onChange={handleProductChange}
                      required
                      placeholder="e.g. MacBook Pro M3"
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand</label>
                    <input
                      name="brand"
                      value={productForm.brand || ''}
                      onChange={handleProductChange}
                      required
                      placeholder="e.g. Apple"
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                    <input
                      name="category"
                      value={productForm.category || ''}
                      onChange={handleProductChange}
                      placeholder="e.g. Laptop"
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (₹)</label>
                    <input
                      name="price"
                      type="number"
                      value={productForm.price || ''}
                      onChange={handleProductChange}
                      required
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Discount (%)</label>
                     <input
                       name="discount"
                       type="number"
                       value={productForm.discount || ''}
                       onChange={handleProductChange}
                       className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                     />
                   </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available Stock</label>
                    <input
                      name="stock"
                      type="number"
                      value={productForm.stock || ''}
                      onChange={handleProductChange}
                      required
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      name="description"
                      value={productForm.description || ''}
                      onChange={handleProductChange}
                      rows={4}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-medium transition-colors resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product Images</label>
                    
                    <div className="flex items-center justify-center w-full">
                       <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-[#FAF8F5] hover:bg-gray-50 transition-colors">
                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                               <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                               <p className="mb-2 text-sm text-gray-500 font-bold"><span className="text-[#F59E0B]">Click to upload</span> or drag and drop</p>
                               <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                           </div>
                           <input id="dropzone-file" type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                       </label>
                    </div>

                    {uploading && (
                      <div className="text-[#F59E0B] text-sm mt-3 flex items-center font-bold">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#F59E0B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading images...
                      </div>
                    )}
                    {productForm.images && productForm.images.length > 0 && (
                      <div className="flex flex-wrap mt-4 gap-3">
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-white p-1">
                             <img src={img} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
                
                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowProductModal(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full font-bold bg-[#F59E0B] text-white hover:bg-orange-600 transition-colors shadow-sm"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : (productForm._id ? 'Save Changes' : 'Publish Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Details Modal */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative my-8 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <button
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
                onClick={() => setShowCustomerModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="mb-8">
                 <h3 className="text-2xl font-black text-slate-900">Customer & Order Details</h3>
                 <p className="text-sm text-gray-500 mt-1">Complete overview of the transaction and customer info.</p>
              </div>

              {loadingCustomer ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-10 w-10 text-[#F59E0B] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500 font-bold">Loading details...</p>
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-6">
                  {/* Order Info Card */}
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-gray-100">
                    <h4 className="font-black text-slate-900 mb-4 flex items-center"><Package className="w-5 h-5 mr-2 text-[#F59E0B]" /> Order Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Order ID</p>
                        <p className="text-sm font-bold text-slate-900">#{selectedCustomer.orderId.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Date</p>
                        <p className="text-sm font-bold text-slate-900">{new Date(selectedCustomer.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Status</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded-md border ${getStatusBadge(selectedCustomer.orderStatus)}`}>
                          {selectedCustomer.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${getPaymentStatusBadge(selectedCustomer.paymentStatus)}`}>
                          {selectedCustomer.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="col-span-2">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
                         <p className="text-2xl font-black text-[#F59E0B]">{formatCurrency(selectedCustomer.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* User Info */}
                    {selectedCustomer.user && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="font-black text-slate-900 mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-blue-500" /> Account Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Full Name</p>
                            <p className="text-sm font-medium text-slate-900">{selectedCustomer.user.fullName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                            <p className="text-sm font-medium text-slate-900">{selectedCustomer.user.email}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                            <p className="text-sm font-medium text-slate-900">{selectedCustomer.user.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Member Since</p>
                            <p className="text-sm font-medium text-slate-900">{new Date(selectedCustomer.user.accountCreated).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Shipping Info */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="font-black text-slate-900 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-green-500" /> Shipping Info</h4>
                      <div className="space-y-4">
                         <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Recipient</p>
                           <p className="text-sm font-medium text-slate-900">{selectedCustomer.shipping.fullName}</p>
                         </div>
                         <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Contact</p>
                           <p className="text-sm font-medium text-slate-900">{selectedCustomer.shipping.email} <br/> {selectedCustomer.shipping.phone}</p>
                         </div>
                         <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Delivery Address</p>
                           <p className="text-sm font-medium text-slate-900 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl mt-1">
                             {selectedCustomer.shipping.completeAddress}
                           </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-black text-slate-900 mb-4 mt-6 border-b border-gray-100 pb-2">Purchased Items ({selectedCustomer.items.length})</h4>
                    <div className="space-y-3">
                      {selectedCustomer.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-2xl">
                          <div className="w-16 h-16 bg-[#FAF8F5] rounded-xl p-1 flex-shrink-0">
                             <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1">Brand: {item.brand} • Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 font-bold mb-1">{formatCurrency(item.price)} each</div>
                            <div className="font-black text-slate-900">{formatCurrency(item.total)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-[#FAF8F5] rounded-2xl">
                  <p className="text-gray-500 font-medium">Customer details are unavailable or corrupted.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}