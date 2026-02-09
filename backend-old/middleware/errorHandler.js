const config = require('../config');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('❌ Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    error = { message: 'Validation Error', errors, status: 400 };
  }

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', status: 404 };
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = { message: 'Duplicate entry', status: 400 };
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(error.errors && { details: error.errors }),
    ...(config.isDevelopment && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
