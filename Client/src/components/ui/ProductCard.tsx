import { Link } from 'react-router';
import { Star, ShoppingCart, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../lib/currency';
import { Product } from '../../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const getFinalPrice = (p: Product) => {
    return p.discount && p.discount > 0
      ? p.price * (1 - p.discount / 100)
      : p.price;
  };

  return (
    <Link
      to={`/product/${product.id || (product as any)._id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-orange-200 transition-colors duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center group-hover:bg-[#FAF8F5] transition-colors duration-300">
        <img
          src={product.image || (product as any).images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Discount Badge */}
        {product.discount && product.discount > 0 ? (
          <div className="absolute top-3 left-3 bg-[#F59E0B] text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            {product.discount}% OFF
          </div>
        ) : null}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Brand */}
        {product.brand && (
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            {product.brand}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || (product as any).ratings || 0)
                    ? 'text-[#F59E0B] fill-current'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 ml-1.5">
            {product.reviews || (product as any).sold || 0}
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-3.5 h-3.5" />
              {formatCurrency(getFinalPrice(product))}
            </span>
            {product.discount && product.discount > 0 && (
              <span className="text-[11px] text-gray-400 line-through flex items-center">
                <IndianRupee className="w-2.5 h-2.5" />
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigating to product detail
              onAddToCart(product);
            }}
            className="text-[#F59E0B] bg-orange-50 hover:bg-[#F59E0B] hover:text-white rounded-full p-2 transition-colors duration-300"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
