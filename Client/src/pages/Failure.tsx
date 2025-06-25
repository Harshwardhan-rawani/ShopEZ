import { Link } from 'react-router'
import { XCircle } from 'lucide-react'

export default function Failure() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Oops! Something went wrong and your payment could not be processed.<br />
          Please try again or contact support if the issue persists.
        </p>
        <Link
          to="/cart"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Return to Cart
        </Link>
        <div className="mt-4">
          <Link
            to="/"
            className="text-orange-600 hover:underline text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
