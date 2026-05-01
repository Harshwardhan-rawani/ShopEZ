const { Interaction } = require('../models/Interaction');
const { Product } = require('../models/Product');

exports.logInteraction = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const userId = req.user.id;

    if (!productId || !action) {
      return res.status(400).json({ message: 'Product ID and action are required' });
    }

    const validActions = ['click', 'like', 'buy'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action type' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Determine weight based on action
    let weight = 1;
    if (action === 'like') weight = 3;
    if (action === 'buy') weight = 5;

    const interaction = new Interaction({
      user: userId,
      product: productId,
      action: action,
      weight: weight,
      category: product.category
    });

    await interaction.save();
    res.status(201).json({ message: 'Interaction logged successfully', interaction });
  } catch (err) {
    console.error('Error logging interaction:', err);
    res.status(500).json({ message: 'Failed to log interaction', error: err.message });
  }
};
