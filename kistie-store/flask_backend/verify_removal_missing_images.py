import sqlite3
import os

missing_images = [
    'images/fotografia.jpg',
    'images/WhatsApp Image 2026-01-02 at 14.30.39.jpeg',
    'images/WhatsApp Image 2026-01-02 at 14.12.44.jpeg'
]

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

for img in missing_images:
    c.execute('SELECT id, name FROM products WHERE image = ?', (img,))
    products = c.fetchall()
    if products:
        for prod in products:
            print(f"STILL PRESENT: '{prod[1]}' (ID: {prod[0]}) - image: {img}")
    else:
        print(f"REMOVED: No product with image {img}")

conn.close()
