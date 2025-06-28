const express = require('express');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Create, update, delete reviews (protected)
router.post('/product/:productId', auth, reviewController.createReview);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router; 