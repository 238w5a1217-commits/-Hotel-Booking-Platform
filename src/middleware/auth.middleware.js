const jwt        = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse  = require('../utils/apiResponse');
const User         = require('../features/auth/user.model');

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json(ApiResponse.error('Not authorized — no token provided', 401));
  }
  const token = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(401).json(ApiResponse.error('User no longer exists', 401));
  if (user.isBlocked) return res.status(403).json(ApiResponse.error('Account has been blocked by administrator', 403));
  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json(
      ApiResponse.error(`Forbidden: role '${req.user.role}' is not allowed to access this resource`, 403)
    );
  }
  next();
};

module.exports = { protect, authorize };

