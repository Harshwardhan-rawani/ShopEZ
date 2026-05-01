/**
 * 用户个人资料页面组件 - 管理用户账户信息
 */
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { User, Mail, Phone, MapPin, Calendar, Settings, Package, Heart, IndianRupee, Trash2, ShoppingCart } from 'lucide-react'
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
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <User className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Account Access</h2>
        <p className="text-gray-500 mb-8">Please log in to view and manage your profile.</p>
        <button
          onClick={() => window.location.href = '#/login'}
          className="bg-[#F59E0B] text-white px-10 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm"
        >
          Log In Now
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">My Account</h1>

        {/* Navigation Tabs (Pill style) */}
        <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-gray-100 mb-10 w-fit shadow-sm overflow-x-auto">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'orders', label: 'Orders', icon: Package },
            { key: 'wishlist', label: 'Wishlist', icon: Heart }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap ${
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
              <div>
                 <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                 <p className="text-sm text-gray-500 mt-1">Manage your personal details and contact information.</p>
              </div>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-bold transition-colors shadow-sm ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-[#FAF8F5] text-slate-900 hover:bg-gray-100'}`}
              >
                <Settings className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                  />
                ) : (
                  <div className="flex items-center p-4 bg-[#FAF8F5] rounded-2xl">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm text-gray-400"><User className="w-5 h-5"/></div>
                     <p className="text-slate-900 font-bold">{profileData.name || 'Not provided'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                  />
                ) : (
                  <div className="flex items-center p-4 bg-[#FAF8F5] rounded-2xl">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm text-gray-400"><Mail className="w-5 h-5"/></div>
                     <p className="text-slate-900 font-bold">{profileData.email || 'Not provided'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center p-4 bg-[#FAF8F5] rounded-2xl">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm text-gray-400"><Phone className="w-5 h-5"/></div>
                     <p className="text-slate-900 font-bold">{profileData.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-4 py-3 text-slate-900 font-bold transition-colors"
                    placeholder="Enter address"
                  />
                ) : (
                  <div className="flex items-center p-4 bg-[#FAF8F5] rounded-2xl">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm text-gray-400"><MapPin className="w-5 h-5"/></div>
                     <p className="text-slate-900 font-bold">{profileData.address || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                 <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                 <p className="text-xl font-bold text-slate-900 mb-2">No orders found</p>
                 <p className="text-gray-500">Looks like you haven't made any purchases yet.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between bg-[#FAF8F5] border-b border-gray-100 gap-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Order #{order._id.slice(-8).toUpperCase()}</h3>
                      <p className="text-sm font-medium text-gray-500 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="md:text-right flex flex-col md:items-end">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2 border ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-xl font-black text-[#F59E0B] flex items-center"><IndianRupee className='w-4'/>{order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Purchased Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-[#FAF8F5] rounded-xl p-2 flex items-center justify-center">
                             <img
                               src={item.image || ''}
                               alt={item.name || ''}
                               className="max-h-full object-contain mix-blend-multiply"
                             />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{item.name || item.product}</p>
                            <p className="text-sm font-medium text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">My Wishlist</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map(item => (
                <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group hover:border-orange-200 transition-colors">
                  <div className="p-4 bg-[#FAF8F5] flex items-center justify-center h-48 relative">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="max-h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                    />
                    <button
                        onClick={() => handleRemoveWishlist(item.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{item.title || item.name}</h3>
                      <p className="text-xl font-black text-[#F59E0B] mb-4">${item.price}</p>
                    </div>
                    <button className="w-full bg-[#FAF8F5] text-slate-900 py-3 rounded-full font-bold hover:bg-[#F59E0B] hover:text-white transition-colors flex items-center justify-center shadow-sm">
                       <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                   <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
                   <p className="text-gray-500">Save items you love to view them later.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
