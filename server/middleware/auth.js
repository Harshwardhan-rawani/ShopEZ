const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '').trim();


    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by decoded ID
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

module.exports = auth;
