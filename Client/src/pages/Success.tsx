import { Link } from 'react-router'
import { CheckCircle } from 'lucide-react'

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully.<br />
          You will receive a confirmation email shortly.
        </p>
        <Link
          to="/products"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Continue Shopping
        </Link>
        <div className="mt-4">
          <Link
            to="/profile"
            className="text-orange-600 hover:underline text-sm"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
