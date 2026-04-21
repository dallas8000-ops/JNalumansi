// Script to remove products from db.sqlite that reference missing images in /images
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, '../images');

function normalize(filename) {
  return filename ? filename.trim().toLowerCase() : '';
}

function getImageFiles() {
  return fs.readdirSync(IMAGES_DIR)
    .filter(f => fs.statSync(path.join(IMAGES_DIR, f)).isFile())
    .map(f => normalize(f));
}

function main() {
  const imageFiles = new Set(getImageFiles());
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.all('SELECT id, name, image FROM products', (err, rows) => {
      if (err) {
        console.error('DB error:', err);
        db.close();
        return;
      }
      const toRemove = rows.filter(row => !imageFiles.has(normalize(row.image)));
      if (toRemove.length === 0) {
        console.log('No products to remove. All images exist.');
        db.close();
        return;
      }
      let removed = 0;
      const removePromises = toRemove.map(row => new Promise((resolve, reject) => {
        db.run('DELETE FROM products WHERE id = ?', [row.id], function(err2) {
          if (err2) reject(err2);
          else {
            removed++;
            resolve();
          }
        });
      }));
      Promise.all(removePromises).then(() => {
        console.log(`Removed ${removed} products with missing images.`);
        if (removed > 0) {
          console.log('Removed product IDs:');
          toRemove.forEach(row => {
            console.log(`  ID ${row.id} | Name: ${row.name} | Image: ${row.image}`);
          });
        }
        db.close();
      }).catch(e => {
        console.error('Error removing products:', e);
        db.close();
      });
    });
  });
}

if (require.main === module) {
  main();
}