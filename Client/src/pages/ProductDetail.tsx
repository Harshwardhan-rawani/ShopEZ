/**
 * 产品详情页面组件 - 展示单个产品的详细信息
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, IndianRupee, Info, Sliders, MessageSquare } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'
import ReviewSection from '../components/ReviewSection'

interface Product {
  id: string | number;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  ratings: number;
  stock?: number;
  discount?: number;
  brand?: string;
  sellerId?: string;
  reviews?: any[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [count, setcount] = useState(0);

  const fetchProduct = async () => {
    if (id) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Check if product is in wishlist on mount and log click interaction
  useEffect(() => {
    if (user && product) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/wishlist`)
        .then(res => {
          setIsWishlisted(res.data.some((item: any) => item.id == product.id));
        });

      // Log click interaction
      axios.post(`${import.meta.env.VITE_API_URL}/api/interactions`, {
        productId: product.id,
        action: 'click'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).catch(err => console.error('Failed to log click interaction:', err));
    }
  }, [user, product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        description: product.description,
        category: product.category,
        rating: product.ratings,
        reviews: product.reviews?.length || 0,
        sellerId: product.sellerId || '',
        brand: product.brand || '',
        discount: product.discount
      });
    }
  };

  /**
   * 计算最终价格
   */
  const getFinalPrice = () => {
    if (!product) return 0;
    return product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;
  };

  /**
   * 处理分享
   */
  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleWishlist = async () => {
    if (!user) return;
    if (isWishlisted) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/wishlist`, {
        data: { productId: product?.id }
      });
      setIsWishlisted(false);
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/wishlist`, {
        product: {
          id: product?.id,
          name: product?.name,
          price: product?.price,
          image: product?.images?.[0] || '',
        }
      });
      setIsWishlisted(true);

      // Log like interaction
      if (product) {
        axios.post(`${import.meta.env.VITE_API_URL}/api/interactions`, {
          productId: product.id,
          action: 'like'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(err => console.error('Failed to log like interaction:', err));
      }
    }
  };

  const handleReviewUpdate = () => {
    fetchProduct();
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 bg-white w-fit px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          <Link to="/products" className="flex items-center text-[#F59E0B] hover:text-orange-600 font-bold text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-medium text-sm">{product.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-slate-900 font-bold text-sm line-clamp-1 max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center justify-center h-[500px]">
              <img
                src={product.images?.[count]}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply"
              />
              {product.discount && product.discount > 0 && (
                <div className="absolute top-6 left-6 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-red-200">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images?.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => { setcount(i) }}
                    className={`bg-white rounded-2xl border-2 p-2 h-24 flex items-center justify-center cursor-pointer transition-colors shadow-sm ${count === i ? 'border-[#F59E0B]' : 'border-gray-100 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={product.images?.[i]}
                      alt={`${product.name} ${i + 1}`}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
            <div>
              <p className="text-[#F59E0B] font-bold text-sm tracking-widest uppercase mb-2">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.ratings || 0)
                        ? 'text-[#F59E0B] fill-current'
                        : 'text-gray-200'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-500 bg-[#FAF8F5] px-3 py-1 rounded-full">
                  {product.ratings} / 5 ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end space-x-4">
              <span className="text-5xl font-black text-slate-900 flex items-center">
                {formatCurrency(getFinalPrice())}
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-2xl font-bold text-gray-400 line-through mb-1">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-[#FAF8F5] px-6 py-3 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-3">Stock:</span>
                  <span className="font-black text-slate-900">{product.stock || 0}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#F59E0B] text-white py-4 px-8 rounded-full font-black hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 shadow-sm text-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-16 h-16 flex items-center justify-center border-2 rounded-full transition-colors shadow-sm ${isWishlisted ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                    }`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-16 h-16 flex items-center justify-center border-2 border-gray-100 bg-white rounded-full transition-colors shadow-sm text-gray-400 hover:border-gray-300 hover:text-gray-600"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Shipping and Security Info */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center space-x-3 bg-[#FAF8F5] p-4 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-sm font-bold text-slate-900">Free shipping<br /><span className="text-xs text-gray-500 font-medium">Over ₹50</span></span>
              </div>
              <div className="flex items-center space-x-3 bg-[#FAF8F5] p-4 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-sm font-bold text-slate-900">Secure pay<br /><span className="text-xs text-gray-500 font-medium">100% Protected</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-gray-100 mb-8 w-fit shadow-sm overflow-x-auto">
            {[
              { key: 'description', label: 'Description', icon: Info },
              { key: 'specifications', label: 'Specifications', icon: Sliders },
              { key: 'reviews', label: 'Reviews', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap ${isActive
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

          <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-black text-slate-900 mb-6">About this item</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-8">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex flex-col border-b border-gray-100 pb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</span>
                    <span className="font-bold text-slate-900">{product.brand || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col border-b border-gray-100 pb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</span>
                    <span className="font-bold text-slate-900">{product.category}</span>
                  </div>
                  <div className="flex flex-col border-b border-gray-100 pb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Status</span>
                    <span className="font-bold text-slate-900">{product.stock ? `${product.stock} Units Available` : 'Out of Stock'}</span>
                  </div>
                  {product.discount && product.discount > 0 && (
                    <div className="flex flex-col border-b border-gray-100 pb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount</span>
                      <span className="font-bold text-[#F59E0B]">{product.discount}% Active</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection
                productId={String(product.id)}
                currentRating={product.ratings || 0}
                reviewCount={product.reviews?.length || 0}
                onReviewUpdate={handleReviewUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
