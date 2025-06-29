const { Product } = require('../models/Product');

// Sample products data
const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 99999,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"],
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    category: "Mobile",
    discount: 5,
    sellerId: "sample-seller-1"
  },
  {
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    price: 89999,
    stock: 40,
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
    description: "Premium Android smartphone with AI features",
    category: "Mobile",
    discount: 10,
    sellerId: "sample-seller-1"
  },
  {
    name: "MacBook Pro M3",
    brand: "Apple",
    price: 199999,
    stock: 25,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    description: "Professional laptop with M3 chip for power users",
    category: "Laptop",
    discount: 0,
    sellerId: "sample-seller-2"
  },
  {
    name: "Dell XPS 13",
    brand: "Dell",
    price: 129999,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"],
    description: "Ultra-thin laptop with InfinityEdge display",
    category: "Laptop",
    discount: 15,
    sellerId: "sample-seller-2"
  },
  {
    name: "AirPods Pro",
    brand: "Apple",
    price: 24999,
    stock: 100,
    images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500"],
    description: "Wireless earbuds with active noise cancellation",
    category: "Earphone",
    discount: 8,
    sellerId: "sample-seller-3"
  },
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 34999,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
    description: "Premium wireless headphones with industry-leading noise cancellation",
    category: "Earphone",
    discount: 12,
    sellerId: "sample-seller-3"
  }
];

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.sellerId) {
      filter.sellerId = req.query.sellerId;
    }
    
    let products = await Product.find(filter);
    
    // If no products exist, create sample products
    if (products.length === 0) {
      console.log('No products found, creating sample products...');
      await Product.insertMany(sampleProducts);
      products = await Product.find(filter);
      console.log(`Created ${products.length} sample products`);
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
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

