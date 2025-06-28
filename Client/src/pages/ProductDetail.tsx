/**
 * 产品详情页面组件 - 展示单个产品的详细信息
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, IndianRupee } from 'lucide-react'
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
  const [count,setcount] = useState(0);

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

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user && product) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user.id}/wishlist`)
        .then(res => {
          setIsWishlisted(res.data.some((item: any) => item.id == product.id));
        });
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
    }
  };

  const handleReviewUpdate = () => {
    // Refresh product data to get updated ratings
    fetchProduct();
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/products" className="flex items-center text-orange-500 hover:text-orange-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">{product.category}</span>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={product.images?.[count]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {product.discount}% OFF
              </div>
            )}
          </div>
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {product.images?.slice(0, 4).map((img, i) => (
              <img
                key={i}
                onClick={()=>{setcount(i)}}
                src={product.images?.[i]}
                alt={`${product.name} ${i + 1}`}
                className="w-full h-20 object-cover rounded border-2 border-gray-200 hover:border-orange-500 cursor-pointer transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.brand} {product.category}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.ratings || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.ratings} / 5
            </span>
        
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-orange-500">
              {formatCurrency(getFinalPrice())}
            </span>
            {product.discount && (
              <span className="text-2xl text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Stock :</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
             
                <span className="px-4 py-2 ">{product.stock}</span>
            
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                  isWishlisted ? 'text-red-500 border-red-300' : 'text-gray-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shipping and Security Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Free shipping on orders over ₹50</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Secure payment guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: 'Reviews' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Product Details</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><span className="font-medium">Brand:</span> {product.brand}</li>
                  <li><span className="font-medium">Category:</span> {product.category}</li>
                  <li><span className="font-medium">Stock:</span> {product.stock} units</li>
                  {product.discount && (
                    <li><span className="font-medium">Discount:</span> {product.discount}%</li>
                  )}
                </ul>
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
  );
}
