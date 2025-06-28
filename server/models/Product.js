const mongoose = require('mongoose');

// Remove the 'id' field and any unique index on slug or other fields not used
const productSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  brand:     { type: String, required: true },
  price:     { type: Number, required: true },
  stock:     { type: Number, required: true },
  images:    [{ type: String, required: true }],
  description: { type: String },
  discount:  { type: Number, default: 0 },
  category:  { type: String },
  reviews:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  ratings:   { type: Number, default: 0 },
  sold:      { type: Number, default: 0 },
  sellerId:  { type: String, required: true }
}, { timestamps: true });

exports.Product = mongoose.model('Product', productSchema);

