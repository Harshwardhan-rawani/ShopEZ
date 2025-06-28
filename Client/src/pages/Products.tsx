/**
 * 产品页面组件 - 展示产品列表和搜索功能
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Filter, Grid, List, IndianRupee } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'

interface Product {
  id: string;
  name: string;
  price: number;
  sellerId: string;
  images: string[];
  description: string;
  category: string;
  ratings: number;
  reviews: number;
  discount: number;
  brand?: string;
}

export default function Products() {
  const { addToCart } = useApp();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const categories = [
  "All",
  "smartphones",
  "fragrances",
  "groceries",
  "furniture",
  "tops",
  "womens-dresses",
    "womens-watches",
  "womens-bags",
  "womens-shoes",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",

  "womens-jewellery",
  "sunglasses",
 
]
;

  useEffect(() => {
    setLoading(true);
    // Fetch products from backend API instead of dummyjson
    axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => {
        // Map backend fields to local Product interface
        const products = res.data.map((p: any) => ({
          id: p._id,
          sellerId : p.sellerId,
          name: p.name,
          title: p.name, 
          price: p.price,
          images: p.images ? (Array.isArray(p.images) ? p.images : [p.images]) : [p.image],
          description: p.description,
          category: p.category,
          ratings: p.ratings || 0,
          reviews: p.sold || 0,
          discount: p.discount || 5,
          brand: p.brand,
        }));
        setProducts(products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = products;

    // 搜索过滤
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 分类过滤
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 价格范围过滤
    filtered = filtered.filter(product => {
      const finalPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.ratings) - (a.ratings);
        case 'reviews':
          return (b.reviews) - (a.reviews);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, priceRange, searchParams]);

  /**
   * 处理添加到购物车
   */
  console.log('products', products)

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    addToCart({
      ...product,
      name: product.name,
      image: product.images?.[0] || '',
      sellerId: product.sellerId || '',
      brand: product.brand || '',
      rating: product.ratings,
      reviews: product.reviews
    });
  };

  /**
   * 计算最终价格
   */
  const getFinalPrice = (product: Product) => {
    return product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;
  };

  // Skeleton card for loading state
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse relative">
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
        <span className="absolute top-4 right-4">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </span>
      </div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div className="flex items-center mb-3 space-x-2">
          <div className="h-4 w-20 bg-gray-100 rounded"></div>
          <div className="h-4 w-8 bg-gray-100 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
          <p className="text-gray-600">{filteredProducts.length} products found</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20 px-2 py-1 border rounded"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group-hover:ring-2 group-hover:ring-orange-400">
                    <div className="relative">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.ratings)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.ratings})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-orange-500 flex items-center">
                            <IndianRupee/>{formatCurrency(getFinalPrice(product))}
                          </span>
                        
                            <span className="text-sm text-gray-500 line-through flex items-center ">
                              <IndianRupee className='w-4'/>
                              {formatCurrency(product.price)}
                     </span>
                        </div>
                        <button
                          type="button"
                          onClick={e => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex">
                    <div className="w-48 h-32 relative">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                          <p className="text-gray-600 mb-3">{product.description}</p>

                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.ratings)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              ({product.reviews} reviews)
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold text-orange-500">
                              {formatCurrency(getFinalPrice(product))}
                            </span>
                            {product.discount && product.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/product/${product.id}`}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              View 
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}