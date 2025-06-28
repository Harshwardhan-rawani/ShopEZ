const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items:     [{
    product: { type: mongoose.Schema.Types.Mixed },
    sellerId: String,
    quantity: Number,
    price: Number,
    name: String,
    brand: String,
    image: String
  }],
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingMethod: String,
  total: Number,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipping', 'delivered'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'unpaid'], 
    default: 'unpaid' 
  },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order };
