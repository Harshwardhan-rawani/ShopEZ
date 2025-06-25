const { User } = require('../models/User');

exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.wishlist || []);
};

exports.addToWishlist = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const product = req.body.product;
  if (!user.wishlist.some(item => item.id === product.id)) {
    user.wishlist.push(product);
    await user.save();
  }
  res.json(user.wishlist);
};

exports.removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.wishlist = user.wishlist.filter(item => item.id !== req.body.productId);
  await user.save();
  res.json(user.wishlist);
};
