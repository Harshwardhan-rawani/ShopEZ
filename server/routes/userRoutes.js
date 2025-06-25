const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/:userId/wishlist', userController.getWishlist);
router.post('/:userId/wishlist', userController.addToWishlist);
router.delete('/:userId/wishlist', userController.removeFromWishlist);

module.exports = router;
