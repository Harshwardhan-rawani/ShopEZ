const { Product } = require('../models/Product');



exports.getAll = async (req, res) => {
  const filter = {};

  if (req.query.sellerId) {
    filter.sellerId = req.query.sellerId;
  }
  const products = await Product.find(filter);
  res.json(products);
};

exports.getByCategory = async (req, res) => {
  try {
    const products = await Product.find({}).limit(20); // Get all products first
    
    // Group products by category and take top 5 from each
    const productsByCategory = {};
    products.forEach(product => {
      if (product.category) {
        if (!productsByCategory[product.category]) {
          productsByCategory[product.category] = [];
        }
        if (productsByCategory[product.category].length < 4) {
          productsByCategory[product.category].push(product);
        }
      }
    });
    
    res.json(productsByCategory);
  } catch (err) {
    console.error('Error getting products by category:', err);
    res.status(500).json({ message: 'Failed to get products by category', error: err.message });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    const { categories, excludeIds } = req.body;
    
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories array is required' });
    }

    // Build filter to exclude products already in cart
    const filter = {
      category: { $in: categories }
    };
    
    if (excludeIds && Array.isArray(excludeIds) && excludeIds.length > 0) {
      filter._id = { $nin: excludeIds };
    }

    // Get recommended products from the same categories, excluding cart items
    const recommendedProducts = await Product.find(filter)
      .limit(8) // Limit to 8 recommended products
      .sort({ ratings: -1, sold: -1 }); // Sort by ratings and sales

    res.json(recommendedProducts);
  } catch (err) {
    console.error('Error getting recommended products:', err);
    res.status(500).json({ message: 'Failed to get recommended products', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

exports.create = async (req, res) => {
  try {
    let { name, brand, price, stock, images, description, category, sellerId, discount } = req.body;
    if (!name || !brand || !price || !stock || !images || !Array.isArray(images) || images.length === 0 || !sellerId) {
      return res.status(400).json({ message: 'Name, brand, price, stock, images, and sellerId are required' });
    }
      price = Number(price);
    stock = Number(stock);
    discount = discount ? Number(discount) : 0;
    // Remove any 'id' or 'slug' field from the document
    const product = new Product({
      name,
      brand,
      price,
      stock,
      images,
      description,
      discount,
      category,
      sellerId,
      sold: 0
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, brand, price, stock, images, description, category, sellerId } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brand, price, stock, images, description, category, sellerId },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

