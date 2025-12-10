const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images
app.use('/images', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database setup
const db = new sqlite3.Database('./lspd.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeTables();
  }
});

// Initialize tables
function initializeTables() {
  // Users table for merchants
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    company_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    description TEXT,
    price REAL,
    size TEXT,
    color TEXT,
    image TEXT,
    stock_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);
}

// JWT secret
if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET not found, using default');
  process.env.JWT_SECRET = 'your_secret_key'; // For demo
}

// Helper functions
const hashPassword = async (password) => password;
const verifyPassword = async (password, hashedPassword) => password === hashedPassword;
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, companyName } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    
    db.run(`INSERT INTO users (first_name, last_name, email, password, company_name) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, companyName],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = generateToken({ id: this.lastID, email });
        res.json({ message: 'User registered successfully', token });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

// Protected route example
app.get('/api/profile', verifyToken, (req, res) => {
  db.get('SELECT id, first_name, last_name, email, company_name, created_at FROM users WHERE id = ?',
    [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(user);
  });
});

// Product routes
app.get('/api/products', verifyToken, (req, res) => {
  db.all('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id], (err, products) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(products);
  });
});

// Image upload route
app.post('/api/upload/image', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Return the image path that can be stored in the database
    const imagePath = `/images/${req.file.filename}`;
    res.json({
      success: true,
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.post('/api/products', verifyToken, (req, res) => {
  const { name, description, price, size, color, image, stock_quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(`INSERT INTO products (user_id, name, description, price, size, color, image, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, name, description, price, size, color, image || '', stock_quantity || 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });

      db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(product);
      });
    });
});

// Update product
app.put('/api/products/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, description, price, size, color, image, stock_quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  // First check if product exists and belongs to user
  db.get('SELECT * FROM products WHERE id = ? AND user_id = ?', [id, req.user.id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!product) return res.status(404).json({ error: 'Product not found or unauthorized' });

    // Update the product
    db.run(`UPDATE products SET 
      name = ?, 
      description = ?, 
      price = ?, 
      size = ?, 
      color = ?, 
      image = ?, 
      stock_quantity = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [name, description, price, size || '', color || '', image || '', stock_quantity || 0, id, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.get('SELECT * FROM products WHERE id = ?', [id], (err, updatedProduct) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json(updatedProduct);
        });
      });
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Ensure image path is absolute URL for frontend
    if (product.image && !product.image.startsWith('http')) {
      product.image = `${req.protocol}://${req.get('host')}${product.image}`;
    }

    res.json(product);
  });
});

// Delete product
app.delete('/api/products/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  // First get the product to check ownership and get image filename
  db.get('SELECT * FROM products WHERE id = ? AND user_id = ?', [id, req.user.id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!product) return res.status(404).json({ error: 'Product not found or unauthorized' });

    // Delete associated image file if it exists and is a local file
    if (product.image && product.image.startsWith('/images/')) {
      const filename = product.image.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      
      fs.unlink(filePath, (err) => {
        // Log error but continue with product deletion even if image deletion fails
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting product image:', err);
        }
      });
    }

    // Delete the product
    db.run('DELETE FROM products WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      res.json({ success: true, message: 'Product deleted successfully' });
    });
  });
});

// Order routes
app.post('/api/orders', (req, res) => {
  const { product_id, customer_name, customer_phone, delivery_address, quantity, amount } = req.body;

  if (!product_id || !customer_name || !customer_phone || !delivery_address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if product exists and has enough stock
  db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Create order
    db.run(`INSERT INTO orders (product_id, customer_name, customer_phone, delivery_address, amount, order_status, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_id, customer_name, customer_phone, delivery_address, amount, 'pending', 'simulated'],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Update product stock
        db.run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [quantity, product_id], (err) => {
          if (err) console.error('Failed to update stock:', err);
        });

        res.json({ message: 'Order placed successfully', orderId: this.lastID });
      });
  });
});

// Get orders for merchant
app.get('/api/orders', verifyToken, (req, res) => {
  db.all(`SELECT o.*, p.name as product_name, p.price, p.image
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE p.user_id = ?
    ORDER BY o.created_at DESC`, [req.user.id], (err, orders) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(orders);
  });
});

// Update order status
app.put('/api/orders/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  if (!order_status) {
    return res.status(400).json({ error: 'Order status is required' });
  }

  // First check if order exists and belongs to merchant
  db.get(`SELECT o.* FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.id = ? AND p.user_id = ?`, [id, req.user.id], (err, order) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!order) return res.status(404).json({ error: 'Order not found or unauthorized' });

    // Update the order status
    db.run(`UPDATE orders SET 
      order_status = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [order_status, id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, updatedOrder) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json(updatedOrder);
        });
      });
  });
});

// Delete image route (for cleanup when editing products)
app.delete('/api/upload/image/:filename', verifyToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting image:', err);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
    res.json({ success: true });
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Live Sales Platform API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
