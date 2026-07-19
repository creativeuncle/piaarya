# Piaarya Ecommerce Platform

Full-stack ecommerce platform: admin dashboard first, expanding later to a
customer-facing web storefront and iOS/Android apps, all backed by one
shared API.

## Architecture

- `backend/` — Node.js + Express REST API, MongoDB (Mongoose). Meant to
  eventually serve the admin dashboard, the customer storefront, and the
  mobile apps.
- `admin/` — React (Vite) + Tailwind CSS admin dashboard, consumes the
  backend API.

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # set MONGODB_URI to your MongoDB instance
npm install
npm run dev             # http://localhost:5000
```

### Admin dashboard

```bash
cd admin
npm install
npm run dev              # http://localhost:5173 (proxies /api to :5000)
```

## Status

Currently implemented: project scaffold + **Home** screen (dashboard stats:
total revenue, orders, processing orders, customers, products, categories,
reviews). Remaining screens (Orders, Products, Inventory, Categories,
Customers, Coupons, Reviews, Returns, Payments) are being added
incrementally — see the sidebar placeholders in the admin app.
