// Script to clean up products in the database:
// - Remove products with images matching excluded list
// - Remove products whose image file does not exist
// - Do NOT assign random images to products with missing images
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, '../React/public/images');

// Images to exclude from products (for layout/CSS only)
const excluded = [
  'blog.png', 'blog banner', 'contact1.jpg', 'contact2-2.jpg', 'contact2.jpg', 'contact.jpg', 'contact22.jpg', 'banner.png-2.jpg'
];

// Get all valid images in the images folder
const validImages = fs.readdirSync(IMAGES_DIR)
  .filter(f => !excluded.some(ex => f.toLowerCase().includes(ex)) && !f.startsWith('.'));

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  // Remove products with excluded images
  db.run(
    `DELETE FROM products WHERE ` +
    excluded.map(e => `image LIKE '%${e}%'`).join(' OR ')
  );

  // Remove products whose image file does not exist
  db.all('SELECT id, image FROM products', [], (err, rows) => {
    if (err) throw err;
    rows.forEach(row => {
      const imgFile = row.image.replace(/^images\//, '');
      if (!validImages.includes(imgFile)) {
        // Remove product with missing image
        db.run('DELETE FROM products WHERE id = ?', [row.id]);
      }
    });
  });

  console.log('Strict product cleanup complete.');
});

db.close();
