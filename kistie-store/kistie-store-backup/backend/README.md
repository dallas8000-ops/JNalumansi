# Kistie Store Backend

This is the backend for the Kistie Store project. It provides a REST API for products, cart, and orders, with SQLite for persistence. The backend handles product inventory, cart management, currency conversion, and is ready for payment gateway integration.

## Features
- Product listing and inventory management
- Cart management (add, update, remove items)
- Order creation
- Currency conversion and pricing logic
- User/session support for persistent carts
- Ready for payment gateway integration


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
