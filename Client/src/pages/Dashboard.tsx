/**
 * 商家仪表板页面组件 - 管理订单和产品
 */
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { Package, DollarSign, ShoppingBag, Users, Eye, Edit, Trash2, Plus, UploadCloud, IndianRupee } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'

interface Order {
  _id: string;
  customer: string;
  items: any[];
  amount: number;
  total?: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | string;
  paymentStatus: 'paid' | 'unpaid';
  date: string;
  shippingInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  images: string[]; // changed from image to images
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

  // Order status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Payment status color
  const getPaymentStatusColor = (paymentStatus: string) => {
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
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the orders list with the new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    }
  };

  // Stats - Only count shipped orders in revenue
  const shippedOrders = orders.filter(order => order.status === 'delivered');
  const totalRevenue = shippedOrders.reduce((sum, order) => sum + (order.amount || order.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = new Set(orders.map(order => order.customer)).size;

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
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);
      } else {
        throw new Error('Image upload failed');
      }
    }

    // Determine whether to replace or append based on product type or toggle
    const allowMultiple = true; // ← change this flag dynamically if needed

    setProductForm((prev) => ({
      ...prev,
      images: allowMultiple
        ? [...(prev.images || []), ...uploadedUrls]
        : uploadedUrls,
    }));
  } catch (err) {
    console.error('Upload error:', err);
    alert('Failed to upload image(s).');
  } finally {
    setUploading(false);
  }
};


  // Add/Edit Product
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (productForm._id) {
        // Edit
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${productForm._id}`,
          { ...productForm, sellerId: user?.id },
          config
        );
      } else {
        // Add (attach sellerId)
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products`,
          { ...productForm, sellerId: user?.id },
          config
        );
      }
      // Refresh products for this seller
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products?sellerId=${user?.id}`,
        config
      );
      setProducts(res.data);
      console.log(products)
      setShowProductModal(false);
      setProductForm({
        name: '',
        price: 0,
        stock: 0,
        images: [],
        brand: '',
        description: '',
        category: '',
      });
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
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(products.filter(p => p._id !== id));
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">This page is only accessible to sellers and admins.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Seller Dashboard</h1>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: DollarSign },
              { key: 'orders', label: 'Orders', icon: Package },
              { key: 'products', label: 'Products', icon: ShoppingBag }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer || (order.shippingInfo?.firstName + ' ' + order.shippingInfo?.lastName)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items?.map(i => (
                            <div key={i.product || i.name} className="mb-3 flex items-center gap-4">
                              <img
                                src={i.image || i.images?.[0]}
                                alt={i.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium">{i.name || i.product}</div>
                                {i.brand && <div className="text-xs text-gray-400">Brand: {i.brand}</div>}
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.amount || order.total || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Order Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer || (order.shippingInfo?.firstName + ' ' + order.shippingInfo?.lastName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items?.map(i => (
                          <div key={i.product || i.name} className="mb-3 flex items-center gap-4">
                            <img
                              src={i.image || i.images?.[0]}
                              alt={i.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{i.name || i.product}</div>
                              {i.brand && <div className="text-xs text-gray-400">Brand: {i.brand}</div>}
                            </div>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.amount || order.total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                        </select>
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <button
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                onClick={() => {
                  setProductForm({ name: '', price: 0, stock: 0, images: [], brand: '', description: '', category: '' });
                  setShowProductModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-orange-500">{formatCurrency(product.price)}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Sold: {product.sold || 0}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 10 ? 'In Stock' : 
                         product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        className="p-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Modal */}
            {showProductModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-lg relative m-4 sm:my-12 max-h-[90vh] overflow-y-auto">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        onClick={() => setShowProductModal(false)}
      >
        ×
      </button>
      <h3 className="text-xl font-semibold mb-6">
        {productForm._id ? 'Edit Product' : 'Add Product'}
      </h3>
      <form onSubmit={handleSaveProduct} className="space-y-4">
        {/* Form Fields (same as your original code) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={productForm.name || ''}
            onChange={handleProductChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
             <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        name="brand"
                        value={productForm.brand || ''}
                        onChange={handleProductChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        name="price"
                        type="number"
                        value={productForm.price || ''}
                        onChange={handleProductChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        name="stock"
                        type="number"
                        value={productForm.stock || ''}
                        onChange={handleProductChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                      <input
                        name="discount"
                        type="number"
                        value={productForm.discount || ''}
                        onChange={handleProductChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        name="category"
                        value={productForm.category || ''}
                        onChange={handleProductChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={productForm.description || ''}
                        onChange={handleProductChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full"
          />
          {uploading && (
            <div className="text-orange-500 text-sm mt-1 flex items-center">
              <UploadCloud className="w-4 h-4 mr-1" /> Uploading...
            </div>
          )}
          <div className="flex flex-wrap mt-2 gap-2">
            {(productForm.images || []).map((img, idx) => (
              <img key={idx} src={img} alt="Product" className="w-16 h-16 object-cover rounded border" />
            ))}
          </div>
        </div>
        {/* Continue with other inputs like category, description, etc. */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setShowProductModal(false)}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (productForm._id ? 'Save Changes' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
          </div>  
        )}
      </div>
    </div>
  );
}