
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');

// Middleware setup
const corsOptions = {
  origin: [
    'http://127.0.0.1:5500', // static HTML dev server
    'http://localhost:3000', // React dev server or same-origin
    'http://127.0.0.1:3000', // Allow 127.0.0.1:3000 for local dev
    'http://localhost:5173', // Vite default dev server
    'http://127.0.0.1:5173', // Allow 127.0.0.1:5173 for local dev
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from the project root (one level up from backend)
app.use(express.static(path.join(__dirname, '..')));

// --- Middleware to Protect Admin Routes ---
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// --- Admin Login Route ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND role = ?', [username, 'admin'], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      req.session.isAdmin = true;
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});
// --- Admin Registration Route (for initial setup only, remove or protect in production) ---
app.post('/api/register-admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'admin'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists' });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, id: this.lastID });
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Logout Route ---
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Set up multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
// Serve uploaded images statically
app.use('/uploads', express.static(uploadDir));
// --- Image Upload Endpoint ---
// POST /api/products/upload-image
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file path to be stored in the product
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// --- Shipping Quote Endpoint ---
// POST /api/shipping-quote
app.post('/api/shipping-quote', (req, res) => {
  const { destination, weightKg } = req.body;
  if (!destination || !weightKg) {
    return res.status(400).json({ error: 'Missing destination or weight' });
  }

  // Example rates (USD, rough estimates)
  const rates = {
    UK:   [{ max: 1, cost: 60 }, { max: 5, cost: 150 }, { max: 10, cost: 300 }, { max: 1000, cost: 600 }],
    USA:  [{ max: 1, cost: 70 }, { max: 5, cost: 160 }, { max: 10, cost: 320 }, { max: 1000, cost: 650 }],
    Rwanda: [{ max: 1, cost: 20 }, { max: 5, cost: 40 }, { max: 10, cost: 80 }, { max: 1000, cost: 150 }],
    Kenya:  [{ max: 1, cost: 15 }, { max: 5, cost: 30 }, { max: 10, cost: 60 }, { max: 1000, cost: 120 }]
  };

  const destRates = rates[destination];
  if (!destRates) return res.status(400).json({ error: 'Unsupported destination' });

  let shippingCost = destRates.find(r => weightKg <= r.max)?.cost;
  if (!shippingCost) shippingCost = destRates[destRates.length - 1].cost;

  res.json({ destination, weightKg, shippingCost });
});

// --- Create Product Endpoint ---
// POST /api/products
app.post('/api/products', (req, res) => {
  const { name, image, price, stock } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Missing name or price' });
  }
  db.run(
    'INSERT INTO products (name, image, price, stock) VALUES (?, ?, ?, ?)',
    [name, image || null, price, stock || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, image, price, stock });
    }
  );
});

// Initialize SQLite DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) throw err;
  console.log('Connected to SQLite database.');
});

// Create tables if not exist
const initDb = () => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT NOT NULL,
    product_id INTEGER,
    size TEXT,
    quantity INTEGER,
    currency TEXT,
    price REAL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT NOT NULL,
    total REAL,
    currency TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};
initDb();


// --- Product Endpoints ---
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Cart Endpoints ---
// Use a session id from query or header for demo (in production use real sessions/auth)
function getSessionId(req) {
  return req.query.session || req.headers['x-session-id'] || 'guest';
}

// Get cart items
app.get('/api/cart', (req, res) => {
  const session = getSessionId(req);
  db.all('SELECT * FROM cart WHERE session = ?', [session], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add/update cart item
app.post('/api/cart', (req, res) => {
  const session = getSessionId(req);
  const { product_id, size, quantity, currency } = req.body;
  if (!product_id || !quantity) return res.status(400).json({ error: 'Missing product_id or quantity' });
  // Get product price
  db.get('SELECT price FROM products WHERE id = ?', [product_id], (err, prod) => {
    if (err || !prod) return res.status(404).json({ error: 'Product not found' });
    // Currency conversion (simple demo)
    let price = prod.price;
    if (currency === 'UGX') price = Math.round(price * 4000);
    if (currency === 'KES') price = Math.round(price * 170);
    // Upsert logic: if item exists, update quantity
    db.get('SELECT * FROM cart WHERE session = ? AND product_id = ? AND size = ? AND currency = ?', [session, product_id, size, currency], (err, row) => {
      if (row) {
        db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, row.id], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ updated: true });
        });
      } else {
        db.run('INSERT INTO cart (session, product_id, size, quantity, currency, price) VALUES (?, ?, ?, ?, ?, ?)', [session, product_id, size, quantity, currency, price], function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ added: true, id: this.lastID });
        });
      }
    });
  });
});

// Remove cart item
app.delete('/api/cart/:id', (req, res) => {
  const session = getSessionId(req);
  db.run('DELETE FROM cart WHERE id = ? AND session = ?', [req.params.id, session], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

// --- Order Endpoints ---
app.post('/api/orders', (req, res) => {
  const session = getSessionId(req);
  const { currency } = req.body;
  // Calculate total from cart
  db.all('SELECT * FROM cart WHERE session = ?', [session], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });
    let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    db.run('INSERT INTO orders (session, total, currency) VALUES (?, ?, ?)', [session, total, currency], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      // Optionally clear cart
      db.run('DELETE FROM cart WHERE session = ?', [session]);
      res.json({ order_id: this.lastID, total });
    });
  });
});

// Delete a product (and its image file) - Admin only
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.get('SELECT image FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    // Delete the image file if it exists
    if (row.image) {
      const imagePath = path.join(__dirname, 'public', 'images', row.image);
      fs.unlink(imagePath, (err2) => {
        // Ignore error if file doesn't exist
        // Delete the product from the database
        db.run('DELETE FROM products WHERE id = ?', [id], function (err2) {
          if (err2) return res.status(500).json({ error: 'Database error' });
          res.json({ success: true });
        });
      });
    } else {
      db.run('DELETE FROM products WHERE id = ?', [id], function (err2) {
        if (err2) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Kistie Store backend running on http://localhost:${PORT}`);
});
