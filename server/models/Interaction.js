const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  action: { type: String, enum: ['click', 'like', 'buy'], required: true },
  weight: { type: Number, required: true },
  category: { type: String }
}, { timestamps: true });

const Interaction = mongoose.model('Interaction', interactionSchema);
module.exports = { Interaction };
