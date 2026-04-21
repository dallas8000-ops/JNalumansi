import sqlite3
import os

missing_images = [
    'images/WhatsApp Image 2026-01-02 at 14.11.37.jpeg',
    'images/WhatsApp Image 2026-01-02 at 14.10.59.jpeg',
    'images/WhatsApp Image 2026-01-02 at 14.10.56.jpeg'
]

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
removed = 0

for img in missing_images:
    c.execute('SELECT id, name FROM products WHERE image = ?', (img,))
    products = c.fetchall()
    for prod in products:
        print(f"Deleting product '{prod[1]}' (ID: {prod[0]}) - image: {img}")
        c.execute('DELETE FROM products WHERE id = ?', (prod[0],))
        removed += 1

conn.commit()
conn.close()
print(f"Removed {removed} products referencing missing images.")
