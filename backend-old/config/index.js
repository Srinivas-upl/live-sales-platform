require('dotenv').config();

// Application Configuration
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  port: parseInt(process.env.PORT, 10) || 3001,
  host: process.env.HOST || 'localhost',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || 'http://localhost:3001',

  // Database
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    path: process.env.DB_PATH || './lspd.db'
  },

  // Payment (for future)
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET
  },

  // Email (for future)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  // App Info
  app: {
    name: process.env.APP_NAME || 'Live Sales Platform',
    version: process.env.npm_package_version || '1.0.0'
  }
};

// Validation
if (!config.jwt.secret || config.jwt.secret === 'your-super-secret-jwt-key') {
  console.warn('⚠️  WARNING: Using default JWT secret. Please set JWT_SECRET environment variable in production.');
}

// Freeze configuration to prevent accidental modifications
if (config.isProduction) {
  Object.freeze(config);
}

module.exports = config;
