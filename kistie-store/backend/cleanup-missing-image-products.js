const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, '..', 'React', 'public', 'images');

function normalizeDbImage(value) {
  if (!value || typeof value !== 'string') return '';
  let out = value.trim();
  if (!out) return '';
  try {
    out = decodeURIComponent(out);
  } catch {
    // Keep original if decoding fails.
  }
  return out.replace(/^\/+/, '').replace(/^images\//i, '');
}

function run() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = new Set(
    fs.readdirSync(IMAGES_DIR)
      .filter((f) => fs.statSync(path.join(IMAGES_DIR, f)).isFile())
      .map((f) => f.toLowerCase())
  );

  const db = new sqlite3.Database(DB_PATH);
  db.all('SELECT id, name, image FROM products', [], (err, rows) => {
    if (err) {
      console.error('Failed to read products:', err.message);
      db.close();
      process.exit(1);
    }

    const missing = rows.filter((row) => {
      const rel = normalizeDbImage(row.image);
      if (!rel) return false;
      return !files.has(rel.toLowerCase());
    });

    if (missing.length === 0) {
      console.log('No products with missing images found.');
      db.close();
      return;
    }

    const ids = missing.map((m) => m.id);
    const placeholders = ids.map(() => '?').join(', ');
    db.run(`DELETE FROM products WHERE id IN (${placeholders})`, ids, function deleteDone(deleteErr) {
      if (deleteErr) {
        console.error('Failed to delete products:', deleteErr.message);
      } else {
        console.log(`Deleted ${this.changes} products with missing images.`);
        missing.forEach((m) => {
          console.log(`- ${m.id}: ${m.name} (${m.image})`);
        });
      }
      db.close();
    });
  });
}

if (require.main === module) {
  run();
}
