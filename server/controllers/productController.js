const { Product } = require('../models/Product');



exports.getAll = async (req, res) => {
  const filter = {};

  if (req.query.sellerId) {
    filter.sellerId = req.query.sellerId;
  }
  const products = await Product.find(filter);
  res.json(products);
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

