import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('SELECT id, name FROM products WHERE image IS NULL OR image = ""')
no_image = c.fetchall()

for prod in no_image:
    print(f"Deleting product: {prod[1]} (ID: {prod[0]})")
    c.execute('DELETE FROM products WHERE id = ?', (prod[0],))

conn.commit()
conn.close()
print(f"Removed {len(no_image)} products without images.")
