const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id:         { type: Number, unique: true, required: true },
  title:      { type: String, required: true },
  slug:       { type: String, required: true, unique: true },
  price:      { type: Number, required: true },
  description:{ type: String, required: true },
  category:   { type: mongoose.Schema.Types.Mixed, required: true }, // can be object or string
  images:     [{ type: String, required: true }],
  creationAt: { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };
