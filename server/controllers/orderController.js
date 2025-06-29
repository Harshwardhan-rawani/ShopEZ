const { Order } = require('../models/Order');
const { Product } = require('../models/Product');
const { User } = require('../models/User');
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
      status: 'pending',
      paymentStatus: 'paid'
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Order creation failed', error: err });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err });
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

// GET /api/orders?sellerId=xxx - Get orders with complete customer details
exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.query.sellerId) {
      // Find all products for this seller
      const sellerProducts = await Product.find({ sellerId: req.query.sellerId }).select('_id');
      const productIds = sellerProducts.map(p => p._id.toString());
      filter['items.product'] = { $in: productIds };
    }
    
    // Populate user details to get complete customer information
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone createdAt')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// GET /api/orders/:orderId/customer - Get complete customer details for a specific order
exports.getOrderCustomerDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'firstName lastName email phone role createdAt')
      .exec();
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Combine user details with shipping info for complete customer profile
    const customerDetails = {
      orderId: order._id,
      orderDate: order.createdAt,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      
      // User account details
      user: order.user ? {
        id: order.user._id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        fullName: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.user.phone,
        role: order.user.role,
        accountCreated: order.user.createdAt
      } : null,
      
      // Shipping details
      shipping: {
        firstName: order.shippingInfo?.firstName,
        lastName: order.shippingInfo?.lastName,
        fullName: `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.trim(),
        email: order.shippingInfo?.email,
        phone: order.shippingInfo?.phone,
        address: order.shippingInfo?.address,
        city: order.shippingInfo?.city,
        state: order.shippingInfo?.state,
        zipCode: order.shippingInfo?.zipCode,
        country: order.shippingInfo?.country,
        completeAddress: `${order.shippingInfo?.address || ''}, ${order.shippingInfo?.city || ''}, ${order.shippingInfo?.state || ''} ${order.shippingInfo?.zipCode || ''}, ${order.shippingInfo?.country || ''}`.trim()
      },
      
      // Order items
      items: order.items.map(item => ({
        name: item.name,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        image: item.image
      }))
    };
    
    res.json(customerDetails);
  } catch (err) {
    console.error('Error fetching customer details:', err);
    res.status(500).json({ message: 'Failed to fetch customer details', error: err.message });
  }
};

