from flask import Flask, send_from_directory, request, jsonify, session
from flask_cors import CORS
import sqlite3
import os

from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
app = Flask(__name__, static_folder=str(PROJECT_ROOT), static_url_path='')
app.secret_key = 'your_secret_key'
from datetime import timedelta
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
app.permanent_session_lifetime = timedelta(days=1)
DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite')

# --- Serve static files and HTML from project root ---
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Serve any file from the project root (HTML, JS, CSS, images, etc.)
    return app.send_static_file(filename)

# --- SQLite DB Helper ---
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session TEXT NOT NULL,
        product_id INTEGER,
        size TEXT,
        quantity INTEGER,
        currency TEXT,
        price REAL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session TEXT NOT NULL,
        total REAL,
        currency TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()


def ensure_admin_table():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
    )''')
    # Insert default admin if not exists
    c.execute('SELECT * FROM users WHERE username = ?', ('admin',))
    if not c.fetchone():
        c.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ('admin', 'admin', 'admin'))
    conn.commit()
    conn.close()

init_db()
ensure_admin_table()

# --- API Endpoints ---
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return jsonify([dict(row) for row in products])


# --- Admin Auth Decorator ---
from functools import wraps
def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

# --- Admin Login ---
@app.route('/api/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ? AND password = ? AND role = ?', (username, password, 'admin'))
    user = c.fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    session['is_admin'] = True
    return jsonify({'success': True})

# --- Admin Logout ---
@app.route('/api/logout', methods=['POST'])
def admin_logout():
    session.pop('is_admin', None)
    return jsonify({'success': True})

# --- Add Product (Admin only) ---
@app.route('/api/products', methods=['POST'])
@require_admin
def add_product():
    data = request.json
    name = data.get('name')
    image = data.get('image')
    price = data.get('price')
    stock = data.get('stock', 0)
    if not name or price is None:
        return jsonify({'error': 'Missing name or price'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute('INSERT INTO products (name, image, price, stock) VALUES (?, ?, ?, ?)',
                (name, image, price, stock))
    conn.commit()
    conn.close()
    return jsonify({'id': cur.lastrowid, 'name': name, 'image': image, 'price': price, 'stock': stock})

# --- Delete Product (Admin only) ---
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@require_admin
def delete_product(product_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'deleted': True})

@app.route('/api/cart', methods=['GET'])
def get_cart():
    session_id = request.args.get('session', 'guest')
    conn = get_db()
    cart = conn.execute('SELECT * FROM cart WHERE session = ?', (session_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in cart])

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    session_id = request.args.get('session', 'guest')
    product_id = data.get('product_id')
    size = data.get('size')
    quantity = data.get('quantity')
    currency = data.get('currency')
    if not product_id or not quantity:
        return jsonify({'error': 'Missing product_id or quantity'}), 400
    conn = get_db()
    prod = conn.execute('SELECT price FROM products WHERE id = ?', (product_id,)).fetchone()
    if not prod:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    price = prod['price']
    if currency == 'UGX': price = round(price * 4000)
    if currency == 'KES': price = round(price * 170)
    cur = conn.cursor()
    cur.execute('INSERT INTO cart (session, product_id, size, quantity, currency, price) VALUES (?, ?, ?, ?, ?, ?)',
                (session_id, product_id, size, quantity, currency, price))
    conn.commit()
    conn.close()
    return jsonify({'added': True, 'id': cur.lastrowid})

@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json
    session_id = request.args.get('session', 'guest')
    currency = data.get('currency')
    conn = get_db()
    items = conn.execute('SELECT * FROM cart WHERE session = ?', (session_id,)).fetchall()
    if not items:
        conn.close()
        return jsonify({'error': 'Cart is empty'}), 400
    total = sum(item['price'] * item['quantity'] for item in items)
    cur = conn.cursor()
    cur.execute('INSERT INTO orders (session, total, currency) VALUES (?, ?, ?)',
                (session_id, total, currency))
    order_id = cur.lastrowid
    cur.execute('DELETE FROM cart WHERE session = ?', (session_id,))
    conn.commit()
    conn.close()
    return jsonify({'order_id': order_id, 'total': total})

if __name__ == '__main__':
    app.run(debug=True, port=3000)
