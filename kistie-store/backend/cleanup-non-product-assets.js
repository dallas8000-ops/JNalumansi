const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

const whereClause = `
  LOWER(name) LIKE '%screenshot%' OR LOWER(image) LIKE '%screenshot%' OR
  LOWER(name) LIKE '%contact%' OR LOWER(image) LIKE '%contact%' OR
  LOWER(name) LIKE '%banner%' OR LOWER(image) LIKE '%banner%' OR
  LOWER(name) LIKE '%logo%' OR LOWER(image) LIKE '%logo%'
`;

db.all(`SELECT id, name, image FROM products WHERE ${whereClause}`, [], (err, rows) => {
  if (err) {
    console.error('Failed to read rows:', err.message);
    db.close();
    process.exit(1);
  }

  console.log(`Will remove ${rows.length} non-product assets`);
  rows.forEach((r) => console.log(`${r.id} | ${r.name} | ${r.image}`));

  db.run(`DELETE FROM products WHERE ${whereClause}`, [], function onDelete(deleteErr) {
    if (deleteErr) {
      console.error('Failed to delete rows:', deleteErr.message);
      db.close();
      process.exit(1);
    }
    console.log(`Deleted ${this.changes} rows.`);
    db.close();
  });
});
