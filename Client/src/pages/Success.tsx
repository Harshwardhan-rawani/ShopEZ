import { Link } from 'react-router'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Success() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-12 max-w-lg w-full text-center shadow-sm">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
           <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-500 mb-10 text-lg">
          Thank you for your purchase. Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-4">
           <Link
             to="/products"
             className="w-full bg-[#F59E0B] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center justify-center shadow-sm"
           >
             <ShoppingBag className="w-5 h-5 mr-2" /> Continue Shopping
           </Link>
           <Link
             to="/profile"
             className="w-full bg-[#FAF8F5] text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
           >
             View My Orders <ArrowRight className="w-5 h-5 ml-2" />
           </Link>
        </div>
      </div>
    </div>
  );
}
