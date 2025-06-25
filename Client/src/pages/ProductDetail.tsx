/**
 * 产品详情页面组件 - 展示单个产品的详细信息
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft } from 'lucide-react'
import axios from 'axios'

interface Product {
  id: string | number;
  title: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  rating: number;
  stock?: number;
  discount?: number;
  brand?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`https://dummyjson.com/products/${id}`)
        .then(res => {
          setProduct(res.data);
        });
    }
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
        ...product,
        name: product.title,
        image: product.images?.[0] || '',
        quantity
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
        title: product.title,
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
          title: product?.title,
          price: product?.price,
          image: product?.images?.[0] || '',
        }
      });
      setIsWishlisted(true);
    }
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
        <span className="text-gray-900 font-medium">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={product.images?.[0]}
              alt={product.title}
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
                src={img}
                alt={`${product.title} ${i + 1}`}
                className="w-full h-20 object-cover rounded border-2 border-gray-200 hover:border-orange-500 cursor-pointer transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-gray-600">{product.brand} {product.category}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} / 5
            </span>
            {product.stock !== undefined && (
              <span className="ml-4 text-sm text-gray-500">Stock: {product.stock}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-orange-500">
              ${getFinalPrice().toFixed(2)}
            </span>
            {product.discount && (
              <span className="text-2xl text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
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
              <span className="text-sm text-gray-700">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Secure payment guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews` }
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

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Brand:</span>
                <span className="text-gray-600">{product.brand || '-'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Category:</span>
                <span className="text-gray-600">{product.category}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Stock:</span>
                <span className="text-gray-600">{product.stock ?? '-'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Discount:</span>
                <span className="text-gray-600">{product.discount ? `${product.discount}%` : '-'}</span>
              </div>
            </div>
          )}

        {activeTab === 'reviews' && (
  <div className="space-y-6">
    {product.reviews && product.reviews.length > 0 ? (
      product.reviews.map((review, index) => (
        <div key={index} className="border p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-gray-800">{review.reviewerName}</h4>
            <span className="text-xs text-gray-400">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-yellow-500 text-sm mb-1">
            {'⭐'.repeat(review.rating)}{' '}
            <span className="text-gray-500 ml-2">({review.rating}/5)</span>
          </div>
          <p className="text-gray-600 text-sm">{review.comment}</p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No reviews available.</p>
    )}
  </div>
)}

        </div>
      </div>
    </div>
  );
}
