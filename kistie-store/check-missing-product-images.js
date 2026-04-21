// This script checks for product images in the DB that do NOT exist in the images folder.
// Usage: node check-missing-product-images.js

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'backend', 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, 'images');

// 1. Get all image filenames in /images
const imageFiles = new Set(fs.readdirSync(IMAGES_DIR));

// 2. Connect to the database
const db = new sqlite3.Database(DB_PATH, err => {
  if (err) throw err;
});

// 3. Query all products
console.log('Checking for missing product images...');
db.all('SELECT id, name, image FROM products', [], (err, rows) => {
  if (err) throw err;
  let missing = [];
  let present = [];
  rows.forEach(product => {
    if (!product.image || !imageFiles.has(product.image)) {
      missing.push({ id: product.id, name: product.name, image: product.image });
    } else {
      present.push(product.image);
    }
  });

  if (missing.length === 0) {
    console.log('All product images are present in the images folder.');
  } else {
    console.log('Products with missing images:');
    missing.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Image: ${p.image}`);
    });
  }

  // Optionally, show images in the folder not used by any product
  const usedImages = new Set(rows.map(p => p.image));
  const unusedImages = [...imageFiles].filter(img => !usedImages.has(img));
  if (unusedImages.length > 0) {
    console.log('\nImages in /images not used by any product:');
    unusedImages.forEach(img => console.log(img));
  }

  db.close();
});
