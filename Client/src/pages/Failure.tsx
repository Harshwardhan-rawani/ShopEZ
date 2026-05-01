import { Link } from 'react-router'
import { XCircle, RefreshCcw, Home } from 'lucide-react'

export default function Failure() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-12 max-w-lg w-full text-center shadow-sm">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
           <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Failed</h1>
        <p className="text-gray-500 mb-10 text-lg">
          Oops! Something went wrong and your payment could not be processed. Please try again or contact support if the issue persists.
        </p>
        <div className="space-y-4">
           <Link
             to="/cart"
             className="w-full bg-[#F59E0B] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center justify-center shadow-sm"
           >
             <RefreshCcw className="w-5 h-5 mr-2" /> Return to Cart
           </Link>
           <Link
             to="/"
             className="w-full bg-[#FAF8F5] text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
           >
             <Home className="w-5 h-5 mr-2" /> Back to Home
           </Link>
        </div>
      </div>
    </div>
  );
}
