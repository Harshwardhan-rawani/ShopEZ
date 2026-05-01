/**
 * 产品页面组件 - 展示产品列表和搜索功能
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useApp } from '../App'
import { Star, ShoppingCart, Filter, Grid, List, IndianRupee } from 'lucide-react'
import axios from 'axios'
import { formatCurrency } from '../lib/currency'
import ProductCard from '../components/ui/ProductCard'

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const categories = [
    "All",
    "Mobile",
    "Laptop",
    "Earphone"
  ];

  useEffect(() => {
    setLoading(true);
    // Fetch products from backend API
    axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(res => {
        console.log('Raw API response:', res.data);
        // Map backend fields to local Product interface
        const products = res.data.map((p: any) => ({
          id: p._id,
          sellerId: p.sellerId,
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
        console.log('Mapped products:', products);
        setProducts(products);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = products;
    console.log('=== FILTERING DEBUG ===');
    console.log('Initial products count:', products.length);
    console.log('Initial products:', products);

    // 搜索过滤
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // 分类过滤
    if (selectedCategory !== 'All') {
      console.log('Filtering by category:', selectedCategory);
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();

        console.log(`Product: ${product.name}, Category: ${productCategory}, Selected: ${selectedCat}`);

        // Map frontend categories to backend categories
        const categoryMapping: { [key: string]: string[] } = {
          'mobile': ['mobile', 'smartphone', 'smartphones', 'phone'],
          'laptop': ['laptop', 'laptops', 'computer', 'computers'],
          'earphone': ['earphone', 'earphones', 'headphone', 'headphones', 'audio']
        };

        if (categoryMapping[selectedCat]) {
          const matches = categoryMapping[selectedCat].includes(productCategory);
          console.log(`Category mapping check: ${matches}`);
          return matches;
        }

        const exactMatch = productCategory === selectedCat;
        console.log(`Exact match check: ${exactMatch}`);
        return exactMatch;
      });
      console.log('After category filter:', filtered.length);
    }

    // 价格范围过滤
    filtered = filtered.filter(product => {
      const finalPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;
      const inRange = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
      console.log(`Product: ${product.name}, Price: ${product.price}, Final: ${finalPrice}, In range: ${inRange}`);
      return inRange;
    });
    console.log('After price filter:', filtered.length);

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

    console.log('Final filtered products:', filtered);
    console.log('Final count:', filtered.length);
    console.log('=== END FILTERING DEBUG ===');
    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, priceRange, searchParams]);

  /**
   * 处理添加到购物车
   */
  console.log('products', products)
  console.log('filteredProducts', filteredProducts)
  console.log('loading', loading)

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
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Products</h1>
            <p className="text-gray-500 font-medium">{filteredProducts.length} products found</p>
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
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Filters</h3>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Category</h4>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-[#F59E0B] transition-colors group-hover:border-[#F59E0B]"></div>
                        <div className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full absolute opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span className={`ml-3 text-sm font-bold transition-colors ${selectedCategory === category ? 'text-[#F59E0B]' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3 py-2 text-sm font-bold text-slate-900 transition-colors"
                    />
                    <span className="text-gray-300 font-bold">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl px-3 py-2 text-sm font-bold text-slate-900 transition-colors"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sort By</h4>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-[#FAF8F5] border-transparent focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-900 transition-colors cursor-pointer"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product as any} onAddToCart={handleAddToCart} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 transition-colors shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-56 h-56 sm:h-auto bg-[#FAF8F5] rounded-2xl p-4 flex items-center justify-center relative flex-shrink-0">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="max-h-full object-contain mix-blend-multiply"
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-200">
                            {product.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-900 mb-2">{product.name}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

                            <div className="flex items-center">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(product.ratings)
                                      ? 'text-[#F59E0B] fill-current'
                                      : 'text-gray-200'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-gray-400 ml-2">
                                ({product.reviews} reviews)
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Price</p>
                            <div className="flex flex-col items-end">
                              <span className="text-2xl font-black text-[#F59E0B]">
                                {formatCurrency(getFinalPrice(product))}
                              </span>
                              {product.discount && product.discount > 0 ? (
                                <span className="text-sm font-bold text-gray-400 line-through mt-1">
                                  {formatCurrency(product.price)}
                                </span>
                              ) : <span className="text-sm opacity-0 mt-1">spacer</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3 justify-end mt-4 pt-4 border-t border-gray-100">
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-[#FAF8F5] text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-[#F59E0B] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center shadow-sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}