import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../App';
import axios from 'axios';
import { useParams } from 'react-router';

interface Review {
  _id: string;
  rating: number;
  review: string;
  userName: string;
  createdAt: string;
  user: string;
}

interface ReviewSectionProps {
  productId: string;
  currentRating: number;
  reviewCount: number;
  onReviewUpdate: () => void;
}

export default function ReviewSection({ productId, currentRating, reviewCount, onReviewUpdate }: ReviewSectionProps) {
  const { user } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams()
  console.log(params.id)
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/product/${params.id}`);
      setReviews(response.data);
      
      // Check if user has already reviewed
      if (user) {
        const userReview = response.data.find((r: Review) => r.user === user.id);
        setUserReview(userReview || null);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reviews/product/${params.id}`,
        { rating, review: reviewText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviews([response.data, ...reviews]);
      setUserReview(response.data);
      setShowReviewForm(false);
      setRating(5);
      setReviewText('');
      onReviewUpdate();
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReview) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/reviews/${userReview._id}`,
        { rating, review: reviewText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviews(reviews.map(r => r._id === userReview._id ? response.data : r));
      setUserReview(response.data);
      setIsEditing(false);
      setRating(5);
      setReviewText('');
      onReviewUpdate();
    } catch (error) {
      alert('Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/reviews/${userReview._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviews(reviews.filter(r => r._id !== userReview._id));
      setUserReview(null);
      onReviewUpdate();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const startEditing = () => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review);
      setIsEditing(true);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold">Reviews</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(currentRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {currentRating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>
        
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Review Form */}
      {(showReviewForm || isEditing) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold mb-4">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          <form onSubmit={isEditing ? handleUpdateReview : handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                maxLength={500}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Share your experience with this product..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewText.length}/500 characters
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setIsEditing(false);
                  setRating(5);
                  setReviewText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Review */}
      {userReview && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Your Review</h4>
            <div className="flex space-x-2">
              <button
                onClick={startEditing}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteReview}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < userReview.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-700">{userReview.review}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(userReview.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* All Reviews */}
      <div className="space-y-4">
        {reviews.filter(r => !user || r.user !== user.id).map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{review.userName}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-2">{review.review}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
} 