const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

// In-memory fallback user database if MongoDB connection is disabled
const memoryUsers = [];

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password, organization } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = await User.create({ name, email, password, organization });
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    // Memory fallback
    const existing = memoryUsers.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const newUser = { id: `USR_${Date.now()}`, name, email, role: 'analyst', organization };
    memoryUsers.push(newUser);
    return res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser.id)
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password.' });
  }

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (err) {
    // Continue to fallback
  }

  // Demo / fallback authentication
  if (email === 'commander@marineguard.ai' && password === 'admin123') {
    return res.json({
      _id: 'USR_DEMO_001',
      name: 'Marine Ops Commander',
      email: 'commander@marineguard.ai',
      role: 'admin',
      token: generateToken('USR_DEMO_001')
    });
  }

  return res.status(401).json({ error: 'Invalid credentials. Demo login: commander@marineguard.ai / admin123' });
};

module.exports = { registerUser, loginUser };
