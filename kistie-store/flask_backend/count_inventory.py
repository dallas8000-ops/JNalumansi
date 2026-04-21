import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM products')
count = c.fetchone()[0]
conn.close()

print(f"Number of items in inventory: {count}")
