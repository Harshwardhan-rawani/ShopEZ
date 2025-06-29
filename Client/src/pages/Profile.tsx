/**
 * 用户个人资料页面组件 - 管理用户账户信息
 */
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { User, Mail, Phone, MapPin, Calendar, Settings, Package, Heart, IndianRupee } from 'lucide-react'
import axios from 'axios'

export default function Profile() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Fetch user credentials from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const u = res.data.user;
        setProfileData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          city: u.city || '',
          country: u.country || ''
        });
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        });
      }).catch(() => {});
    }
  }, [setUser]);

  // Fetch user orders from backend
  useEffect(() => {
    if (user?.id) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/orders/user?userId=${user.id}`)
        .then(res => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  }, [user?.id]);

  // Fetch wishlist from backend
  useEffect(() => {
    if (user?.id) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/wishlist`)
        .then(res => setWishlist(res.data))
        .catch(() => setWishlist([]));
    }
  }, [user?.id]);

  /**
   * 处理个人资料更新
   */
  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: profileData.name,
        email: profileData.email
      });
    }
    setIsEditing(false);
  };

  // Remove from wishlist
  const handleRemoveWishlist = async (productId: string | number) => {
    if (!user) return;
    await axios.delete(`http://localhost:5000/api/users/${user.id}/wishlist`, {
      data: { productId }
    });
    setWishlist(wishlist.filter(item => item.id !== productId));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h2>
        <button
          onClick={() => window.location.href = '#/login'}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'orders', label: 'Orders', icon: Package },
              { key: 'wishlist', label: 'Wishlist', icon: Heart }
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {profileData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    placeholder="Enter address"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {profileData.address || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No orders found.</div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Order {order._id}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-lg font-semibold mt-1 flex items-center "><IndianRupee className='w-4'/>{order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={item.image || ''}
                          alt={item.name || ''}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name || item.product}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Wishlist</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{item.title || item.name}</h3>
                    <p className="text-lg font-bold text-orange-500 mb-3">${item.price}</p>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveWishlist(item.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="text-gray-500 text-center py-8 col-span-full">No items in wishlist.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
