const { Review } = require('../models/Review');
const { Product } = require('../models/Product');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;
    console.log(req.user)

    const existingReview = await Review.findOne({ product: productId, user: userId });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create new review
    const newReview = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      review,
      userName: `${req.user.firstName} ${req.user.lastName}`,
    });

    // Update product's average rating
    await updateProductRating(productId);

    res.status(201).json(newReview);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const existingReview = await Review.findOne({ _id: reviewId, user: userId });
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, review },
      { new: true }
    );

    // Update product's average rating
    await updateProductRating(existingReview.product);

    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const existingReview = await Review.findOne({ _id: reviewId, user: userId });
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update product's average rating
    await updateProductRating(existingReview.product);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

// Helper function to update product's average rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      ratings: averageRating,
      reviews: reviews.length
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
} 