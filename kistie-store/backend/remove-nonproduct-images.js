// Script to remove non-product images from products table based on name patterns
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.sqlite');

// List of patterns to match non-product images (case-insensitive, partial match)
const patterns = [
  'blog',
  'contact1',
  'contact2',
  'screenshot',
  'so251106'
];

function main() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    let totalRemoved = 0;
    let removed = [];
    db.all('SELECT id, name, image FROM products', (err, rows) => {
      if (err) {
        console.error('DB error:', err);
        db.close();
        return;
      }
      const toRemove = rows.filter(row =>
        patterns.some(pattern =>
          (row.name && row.name.toLowerCase().includes(pattern)) ||
          (row.image && row.image.toLowerCase().includes(pattern))
        )
      );
      if (toRemove.length === 0) {
        console.log('No non-product images found to remove.');
        db.close();
        return;
      }
      let done = 0;
      toRemove.forEach(row => {
        db.run('DELETE FROM products WHERE id = ?', [row.id], function(err2) {
          done++;
          if (!err2) {
            totalRemoved++;
            removed.push(row);
          }
          if (done === toRemove.length) {
            console.log(`Removed ${totalRemoved} non-product images from products table.`);
            removed.forEach(r => {
              console.log(`  ID ${r.id} | Name: ${r.name} | Image: ${r.image}`);
            });
            db.close();
          }
        });
      });
    });
  });
}

if (require.main === module) {
  main();
}