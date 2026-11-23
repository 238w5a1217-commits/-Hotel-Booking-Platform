const ApiResponse = require('../utils/apiResponse');

const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `${field} already exists`;
    statusCode = 409;
  }
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }
  if (err.name === 'JsonWebTokenError') { message = 'Invalid token'; statusCode = 401; }
  if (err.name === 'TokenExpiredError') { message = 'Token expired'; statusCode = 401; }

  if (process.env.NODE_ENV === 'development') console.error('💥 Error:', err);

  res.status(statusCode).json(ApiResponse.error(message, statusCode));
};

module.exports = { notFound, errorHandler };

