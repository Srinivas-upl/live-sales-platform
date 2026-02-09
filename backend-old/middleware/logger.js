const config = require('../config');

// Simple logging middleware
const logger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(`${statusColor}[${new Date().toISOString()}] ${req.method} ${req.url} ${status}${resetColor} - ${duration}ms`);
  });

  next();
};

module.exports = logger;
