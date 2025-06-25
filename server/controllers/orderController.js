const { Order } = require('../models/Order');
const axios = require('axios');

exports.createAfterPayment = async (req, res) => {
  try {
    console.log('Creating order after payment:', req.body);
    // In production, verify payment with Cashfree using payment session/orderId
    if (!req.body.paymentVerified) {
      return res.status(400).json({ message: 'Payment not verified' });
    }
    const order = await Order.create({
      ...req.body.order,
      status: 'paid'
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Order creation failed', error: err });
  }
};

// Cashfree payment session creation endpoint
exports.createCashfreeSession = async (req, res) => {
  try {
    const { orderAmount, customerEmail, customerPhone , order } = req.body;
  generatedOrderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const { data: cashfreeRes } = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_id: generatedOrderId,
        order_amount: 1,
        order_currency: 'INR',
        customer_details: {
          customer_id: generatedOrderId, // or a UUID/order_id
          customer_email: customerEmail,
          customer_phone: customerPhone
        }
      },
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json({ paymentSessionId: cashfreeRes.payment_session_id });

  } catch (err) {
    console.error('Cashfree Error:', err?.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to create payment session',
      error: err?.response?.data || err.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
};

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
};
 

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err });
  }
};
