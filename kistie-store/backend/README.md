
# Kistie Store Backend

This is the backend for the Kistie Store project. It provides a REST API for products, cart, and orders, with SQLite for persistence. The backend handles product inventory, cart management, currency conversion, and is ready for payment gateway integration.

**Note:** All business logic and API endpoints are implemented in Node.js/Express. Python scripts in `../flask_backend/` are used only for admin/maintenance tasks (e.g., database cleanup, verification) and are not part of the main backend stack.

## Features
- Product listing and inventory management
- Cart management (add, update, remove items)
- Order creation
- Currency conversion and pricing logic
- User/session support for persistent carts
- Ready for payment gateway integration

## Admin/Maintenance Scripts (Python)
- Python scripts for database cleanup and verification are located in `../flask_backend/`.
- These scripts are for admin/maintenance use only and do not serve the main application.

## Product images (single location)
- Canonical folder: **`../React/public/images/`** (see `paths.js` → `PRODUCT_IMAGES_DIR`).
- Store **only the filename** in SQLite (`products.image`); URLs are `/images/<filename>`.
- Node scripts in this folder (`auto-add-new-images.js`, `fix-db-image-references.js`, etc.) all use `PRODUCT_IMAGES_DIR`.

## Environment Variables
Create a `.env` file in the backend directory with the following content:

```
SESSION_SECRET=your_secret_key
DB_PATH=./db.sqlite
PORT=3000
```

Change `SESSION_SECRET` to a strong, random value in production. You can also adjust `DB_PATH` and `PORT` as needed.

## Getting Started
1. Install dependencies: `npm install`
2. Create a `.env` file as described above
3. Start the server: `npm start`
4. API runs on http://localhost:3000 (or your configured port)

## Folder Structure
- `/routes` - API route handlers
- `/models` - Database models
- `/controllers` - Business logic
- `/db.sqlite` - SQLite database file

## Requirements
- Node.js 18+
- npm

## To Do
- Add authentication
- Integrate payment gateway
- Add admin panel for inventory
