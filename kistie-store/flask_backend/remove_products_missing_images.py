import sqlite3
import os

# Paths
DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')
IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'React', 'public', 'images'))

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('SELECT id, name, image FROM products')
products = c.fetchall()
removed = 0

for prod in products:
    prod_id, name, image = prod
    if not image:
        continue
    # Remove leading slashes if present
    img_file = image.replace('images/', '').lstrip('/')
    img_path = os.path.join(IMAGES_DIR, img_file)
    if not os.path.isfile(img_path):
        print(f"Deleting product '{name}' (ID: {prod_id}) - missing image: {img_file}")
        c.execute('DELETE FROM products WHERE id = ?', (prod_id,))
        removed += 1

conn.commit()
conn.close()
print(f"Removed {removed} products with missing images.")
