# Piaarya Ecommerce Platform

Full-stack ecommerce platform: admin dashboard first, now growing a
customer-facing web storefront, with iOS/Android apps planned later — all
backed by one shared API.

## Architecture

- `backend/` — Node.js + Express REST API, MongoDB (Mongoose). Serves the
  admin dashboard, the customer storefront, and (later) the mobile apps.
- `admin/` — React (Vite) + Tailwind CSS admin dashboard, consumes the
  backend API.
- `storefront/` — React (Vite) + Tailwind CSS customer-facing website,
  consumes the same backend API.

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # set MONGODB_URI to your MongoDB instance
npm install
npm run dev             # http://localhost:5001
npm run seed             # optional: sample products/customers/orders/etc.
```

Note: port 5000 is avoided by default because it conflicts with macOS AirPlay
Receiver. Change `PORT` in `.env` (and the proxy targets in
`admin/vite.config.js` / `storefront/vite.config.js`) if you'd rather use a
different port.

### Admin dashboard

```bash
cd admin
npm install
npm run dev              # http://localhost:5173 (proxies /api to :5001)
```

### Storefront

```bash
cd storefront
npm install
npm run dev              # http://localhost:5174 (proxies /api to :5001)
```

## Status

**Admin dashboard**: all 10 originally planned screens are built — Home,
Orders, Products, Inventory, Categories, Customers, Coupons, Reviews,
Returns, Payments — plus Marketing (abandoned cart recovery, email
campaigns), Team Management, Wishlist, and a Settings > Navigation
drag-and-drop menu builder that drives the storefront's header nav.

**Storefront**: homepage is built — hero slider, Explore tabs (Best
Sellers/New In/Bundles), category slider, trending products, a full-page
video placeholder, customer reviews, a feature bar, and footer. Product
listing/detail pages, cart, and checkout are not built yet.
