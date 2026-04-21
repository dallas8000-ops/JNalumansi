// remove-bad-products.js
// Run with: node remove-bad-products.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "DELETE FROM products WHERE name='Fashionable' OR image IS NULL OR image=''",
    function (err) {
      if (err) {
        console.error('Error deleting products:', err.message);
      } else {
        console.log(`Deleted ${this.changes} unwanted products.`);
      }
    }
  );
});

db.close();
