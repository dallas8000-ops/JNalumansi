// Script to rebuild db.sqlite and import products from images folder
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, '../React/public/images');

function getImageFiles() {
  return fs.readdirSync(IMAGES_DIR)
    .filter(f => fs.statSync(path.join(IMAGES_DIR, f)).isFile());
}

function main() {
  // Remove db.sqlite if it exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session TEXT NOT NULL,
      product_id INTEGER,
      size TEXT,
      quantity INTEGER,
      currency TEXT,
      price REAL,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
    db.run(`CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session TEXT NOT NULL,
      total REAL,
      currency TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 1
    )`);

    // Insert products from images
    const images = getImageFiles();
    const stmt = db.prepare('INSERT INTO products (name, image, price, stock) VALUES (?, ?, ?, ?)');
    images.forEach(img => {
      // Use filename (without extension) as name, filename as image, default price 100, stock 10
      const name = path.parse(img).name;
      stmt.run(name, img, 100, 10);
    });
    stmt.finalize();
    db.close(() => {
      console.log(`Database rebuilt. Imported ${images.length} products from /images.`);
    });
  });
}

if (require.main === module) {
  main();
}