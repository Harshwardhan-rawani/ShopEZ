const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { User } = require('../models/User');

exports.getOverview = async (req, res) => {
  const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
  const totalOrders = await Order.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments();
  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts
  });
};

exports.getTopProducts = async (req, res) => {
  const products = await Product.find().sort({ sold: -1 }).limit(5);
  res.json(products);
};

exports.getSalesByPeriod = async (req, res) => {
  // Example: group by month, week, etc.
  // ...implement as needed...
  res.json([]);
};
