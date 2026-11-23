const jwt        = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse  = require('../../utils/apiResponse');
const User         = require('./user.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json(ApiResponse.error('Name, email, and password are required', 400));

  const allowedRoles = ['guest', 'partner'];
  const userRole = allowedRoles.includes(role) ? role : 'guest';

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json(ApiResponse.error('Email is already registered', 409));

  const user  = await User.create({ name, email, password, role: userRole, phone });
  const token = signToken(user._id);
  res.status(201).json(ApiResponse.success({ token, user }, 'Registration successful', 201));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json(ApiResponse.error('Email and password required', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json(ApiResponse.error('Invalid email or password', 401));

  if (user.isBlocked)
    return res.status(403).json(ApiResponse.error('Account has been blocked by administrator', 403));

  const token   = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.json(ApiResponse.success({ token, user: userObj }, 'Login successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json(ApiResponse.error('Token required', 400));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user    = await User.findById(decoded.id);
  if (!user || user.isBlocked) return res.status(401).json(ApiResponse.error('Unauthorized', 401));
  res.json(ApiResponse.success({ token: signToken(user._id) }, 'Token refreshed'));
});

module.exports = { register, login, refreshToken };

