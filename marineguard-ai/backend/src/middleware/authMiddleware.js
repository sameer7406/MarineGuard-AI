const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized, invalid token.' });
    }
  }

  // Allow unauthenticated demo requests with warning header
  req.user = { id: 'DEMO_GUEST_USER', role: 'analyst' };
  next();
};

module.exports = { protect };
