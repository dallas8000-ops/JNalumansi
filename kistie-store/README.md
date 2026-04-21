
# Kistie Store

A modern full-stack fashion e-commerce capstone project: inventory management, admin workflow, shopping cart, shipping quotes, and order creation. Built with Node.js/Express, SQLite, and a responsive React frontend. Python scripts are used for admin/maintenance tasks only.

### Capstone Status (Current Scope)

- Completed core flow: product catalog, inventory CRUD, cart, shipping quote, and order placement.
- Mobile-money checkout (MTN/Airtel/M-Pesa) is integration-ready in UI/backend but still in demo mode until real provider credentials + callbacks are finalized.
- Exchange rates are fetched daily and support `EUR`, `USD`, `UGX`, and `KES`.

### Where to put product images (one folder only)

Use **`kistie-store/React/public/images/`** for every catalog and inventory photo. The database column `products.image` should hold **only the filename** (for example `Dress.jpg`). The app serves it at **`/images/Dress.jpg`**. The canonical path is defined in **`kistie-store/backend/paths.js`** (`PRODUCT_IMAGES_DIR`); backend scripts use the same value. **`kistie-store/images/`** is not wired to the React app or API `/images` route - move files from there into `React/public/images` if you still need them.

Do not store non-product assets (contact images, banners, screenshots, logos) as product rows.

Static HTML that injects images from the API should load **`kistie-store/productImageUrl.js`** before your page script so DB filenames become **`/images/...`** URLs. In plain HTML you can set **`src="/images/filename.jpg"`** when the page is served from Express.

## For Reviewers

- [Live Demo](https://jnalumansi.onrender.com)
- [Source Code](https://github.com/dallas8000-ops/JNalumansi)
- Features: Inventory management, admin dashboard, shopping cart, order placement, responsive design, and more.

## Project Overview
Kistie Store is a professional e-commerce platform for fashion retail, featuring:
- Admin authentication and inventory workflow
- Product catalog with images, prices, and details
- Add, edit, and delete products (CRUD)
- Shopping cart, shipping quotes, and order placement
- RESTful API (Node.js/Express)
- SQLite database for persistent storage
- Responsive, modern UI (React + Bootstrap)
- CORS and security best practices
- Python scripts for database cleanup and admin maintenance (not part of main stack)

## Tech Stack
- Backend: Node.js, Express, SQLite
- Frontend: React, Bootstrap, Vite
- Admin/Maintenance: Python scripts (for DB cleanup, not for serving the app)
- Deployment: Render.com

## Architecture Overview
- Node.js/Express REST API (products, cart, admin, exchange rates, orders)
- SQLite database for persistent storage
- React frontend consuming API
- Python scripts for DB maintenance (admin only)

## Getting Started

### Local Setup
1. Clone the repo:
   ```
   git clone https://github.com/dallas8000-ops/JNalumansi.git
   cd JNalumansi/kistie-store/backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the backend server:
   ```
   npm start
   ```
4. Open `kistie-store/index.html` in your browser for the frontend.

### Admin/Maintenance Scripts
- Python scripts for database cleanup and verification are in `kistie-store/flask_backend/`. See script comments for usage.

### Admin Login
- Admin credentials are set up via the backend. (See backend/README.md for setup.)

### Demo Notes for Review
- Payment buttons are functional in demo mode and return provider status messages.
- Real payment finalization (provider tokens/webhooks) is intentionally deferred to final integration.
- This project prioritizes reliable CRUD, cart/order logic, and API integration patterns for capstone evaluation.

### Live Demo
- [Kistie Store on Render](https://jnalumansi.onrender.com)

## Screenshots
_Add screenshots of your main features here for best results._

## Errors Found and Fixes Applied

### 1) Catalog showed blank product placements
- **Issue:** Some product rows pointed to deleted/missing image files, causing broken cards and blank spaces.
- **Fix:** Added backend filtering for missing image files and cleaned DB rows referencing non-existent files. Added frontend image-failure guards to hide broken cards.
- **Files:** `backend/index.js`, `backend/cleanup-missing-image-products.js`, `React/src/components/Catalog.jsx`

### 2) Inventory updates/deletes looked unreliable
- **Issue:** A duplicate `/api/products` route returned stale static product data, so DB edits did not reflect correctly.
- **Fix:** Removed duplicate static route and kept DB-backed product endpoint as source of truth.
- **Files:** `backend/index.js`

### 3) Admin login/session instability
- **Issue:** Admin login status sometimes dropped, making edit/delete fail with 403 behavior.
- **Fix:** Improved session handling (`saveUninitialized: false`, cookie config, session regenerate/save on login, clear cookie on logout) and selected latest admin row by username.
- **Files:** `backend/index.js`

### 4) Delete button feedback was unclear
- **Issue:** Delete failures did not always provide useful feedback.
- **Fix:** Improved delete error handling in inventory UI and immediate list refresh/update after delete attempts.
- **Files:** `React/src/components/Inventory.jsx`

### 5) Non-product assets were imported as products
- **Issue:** Screenshot/contact/banner assets were added to product catalog.
- **Fix:** Added stronger exclusion rules in image auto-import script and removed existing non-product product rows from DB.
- **Files:** `backend/auto-add-new-images.js`, `backend/cleanup-non-product-assets.js`

### 6) Currency handling mismatch
- **Issue:** Catalog/cart currency behavior was inconsistent with expected multi-currency support.
- **Fix:** Added live exchange-rate endpoint with daily cache and enabled `EUR`, `USD`, `UGX`, `KES` for pricing flows.
- **Files:** `backend/index.js`, `React/src/components/Catalog.jsx`

### 7) Payment integration not finalized
- **Issue:** Real mobile-money payment provider setup (MTN/Airtel/M-Pesa credentials and callbacks) was not completed.
- **Fix:** Implemented integration-ready backend endpoint and cart UI workflow with explicit demo-mode status messaging.
- **Files:** `backend/index.js`, `React/src/components/Cart.jsx`

### 8) Admin page UX mismatch for workflow
- **Issue:** Placeholder admin route did not support actual inventory/cart operations.
- **Fix:** Routed admin navigation to inventory workflow and added inventory-side cart overview, shipping quote, and order trigger support.
- **Files:** `React/src/App.jsx`, `React/src/components/Inventory.jsx`

## Known Limitations / Future Work

- Finalize real payment provider integration for `MTN`, `Airtel`, and `M-Pesa` with production credentials, callback handling, and webhook verification.
- Add transaction status pages and retry logic so users can track pending/failed/successful mobile-money payments.
- Improve role/security model (separate admin roles, stronger session policies, audit logging, and route-level authorization hardening).
- Add automated tests (API integration tests and frontend component tests) to support safer future refactors.
- Add product categorization, filtering, and search UX improvements for larger catalogs.
- Add deployment environment secrets management and provider-specific config docs for production rollout.

## License
MIT

---

**Built for Kistie Store**
