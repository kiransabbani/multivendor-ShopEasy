# 🛒 AI-Driven Multi-Vendor E-Commerce Platform

> Demand Forecasting · Smart Inventory · Production Planning · Production Hike Recommendations

A full-stack, production-grade multi-vendor e-commerce platform with AI-based demand forecasting using LSTM neural networks and Exponential Smoothing.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required For |
|---|---|---|
| Node.js | 18+ | Backend + Frontend |
| MongoDB | 6+ | Database |
| Python | 3.9+ | ML Forecasting Service |
| npm | 9+ | Package management |

---

## 📁 Project Structure

```
Multivendor/
├── backend/          Node.js + Express + MongoDB API (Port 5000)
├── frontend/         React + Vite + Tailwind CSS (Port 3000)
├── ml-service/       Python Flask LSTM Forecasting (Port 5001)
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1 — Start MongoDB

Ensure MongoDB is running on `localhost:27017`, or configure `backend/.env` with an
accessible MongoDB Atlas connection. For MongoDB Atlas, add the machine's current
IP address to the cluster network access list before seeding.

```powershell
# Windows (if MongoDB is installed as a service)
net start MongoDB
```

---

### Step 2 — Backend Setup

```powershell
cd backend
npm install
node scripts/seed.js    # Populates database with sample data
npm run dev             # Start backend on http://localhost:5000
```

The seed command must finish with `Data Imported!` before using the demo login
buttons. It creates the admin, vendor, and customer demo accounts. Public
registration creates customers and vendors; vendor accounts remain unavailable
until an administrator approves them.

**Expected seed output:**
```
Data Cleared...
Users: 16
Vendors: 5
Categories: 8
Products: 20
Sales History: 1800
Orders: 30
Data Imported!
```

---

### Step 3 — ML Service Setup (Optional but recommended)

```powershell
cd ml-service
pip install -r requirements.txt
python app.py           # Start ML service on http://localhost:5001
```

> **Note:** If the ML service is not running, the backend automatically falls back to a built-in JavaScript Exponential Smoothing implementation. The application works fully without the ML service.

---

### Step 4 — Frontend Setup

```powershell
cd frontend
npm install
npm run dev             # Start frontend on http://localhost:3000
```

---

## 🔑 Demo Credentials

### Admin
| Field | Value |
|---|---|
| Email | `admin@multivendor.com` |
| Password | `admin123` |

### Vendors
| Store | Email | Password |
|---|---|---|
| TechMart | `vendor1@multivendor.com` | `vendor123` |
| FashionHub | `vendor2@multivendor.com` | `vendor123` |
| HomeDecor Pro | `vendor3@multivendor.com` | `vendor123` |
| SportZone | `vendor4@multivendor.com` | `vendor123` |
| BookWorld | `vendor5@multivendor.com` | `vendor123` |

### Customers
| Email | Password |
|---|---|
| `customer1@example.com` | `customer123` |
| `customer2@example.com` | `customer123` |
| ... (up to customer10) | `customer123` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 3000)               │
│         Tailwind CSS · Recharts · React Router v6           │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP REST API
┌─────────────────────────▼───────────────────────────────────┐
│                Node.js + Express Backend (Port 5000)         │
│          JWT Auth · Mongoose ODM · 17 route groups           │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
┌──────────▼──────────┐    ┌─────────────▼───────────────────┐
│   MongoDB Database  │    │  Python Flask ML Service (5001)  │
│   (localhost:27017) │    │  LSTM · Exponential Smoothing   │
└─────────────────────┘    └─────────────────────────────────┘
```

---

## 🎯 Features

### Customer Features
- 🛍️ Browse products with advanced search, filters & sorting
- 🏠 Professional homepage (hero, categories, featured, trending, offers)
- 🛒 Shopping cart with quantity management
- ❤️ Wishlist management
- 📦 Order placement (Cash on Delivery + Online Payment)
- 📍 Address management
- 📋 Order history & tracking
- ❌ Order cancellation & return requests
- ⭐ Product ratings & reviews
- 🧾 Invoice viewing, download & print
- 🔔 Real-time notifications
- 🤖 AI-based product recommendations

### Vendor Features
- 📊 **Dashboard** — KPIs, charts, alerts, best sellers, recent orders
- 📦 **Product Management** — Add/edit/delete products with image upload
- 📈 **AI Demand Forecasting** — LSTM-powered 7/30-day demand forecasts
- 🏭 **Production Planning** — Required production with accept/modify/reject actions
- 🔥 **Production Hike Intelligence** — Growth analysis with hike labels
- 🔄 **Smart Reorder System** — Automated reorder recommendations
- 📊 **Inventory Management** — Status indicators (GREEN/YELLOW/RED/BLUE)
- 📉 **Sales Analytics** — Revenue, orders, category charts
- 🏆 **Performance Score** — Multi-factor vendor scoring (87/100 style)
- 🔔 **Smart Alerts** — Stockout risk, demand increase, production hike

### Admin Features
- 👥 User management (activate/deactivate)
- 🏪 Vendor management (approve/reject/suspend)
- 📦 Product moderation
- 📋 Order management
- 💰 Commission management & reports
- 📊 Platform analytics dashboard

---

## 🧠 AI Demand Forecasting

### Algorithm Selection
```
Sales History Length ≥ 30 days → LSTM Neural Network
Sales History Length < 30 days → Exponential Smoothing (fallback)
```

### LSTM Architecture
```
Input (14-day lookback window)
    ↓
LSTM(64, return_sequences=True)
    ↓
Dropout(0.2)
    ↓
LSTM(32)
    ↓
Dropout(0.2)
    ↓
Dense(1) → Next day demand
```

### Business Logic Chain
```
Historical Sales (90 days)
        ↓
   Demand Forecast (7/30-day)
        ↓
   Inventory Analysis
   ├── Current Stock vs Recommended
   ├── Reorder Point = (AvgDailyDemand × LeadTime) + SafetyStock
   └── Stockout Date = Stock / AvgDailyDemand
        ↓
   Production Planning
   └── Required = ForecastedDemand + SafetyStock - CurrentStock
        ↓
   Production Hike Intelligence
   ├── Growth > 50% → 🔥 Critical Production Increase
   ├── Growth > 25% → ⚠️ High Increase
   ├── Growth > 10% → ↗️ Moderate Increase
   └── Else → ✅ No Increase Required
        ↓
   Reorder Recommendation
   └── Reorder = Demand30d + SafetyStock - CurrentStock
        ↓
   Vendor Decision (Accept / Modify / Reject)
```

---

## 📊 Database Schema

| Model | Description |
|---|---|
| `User` | Customers and Admins |
| `Vendor` | Vendor profiles and store info |
| `Product` | Products with inventory fields |
| `Category` | 8 product categories |
| `Cart` | Customer shopping carts |
| `Wishlist` | Customer wishlists |
| `Order` | Multi-vendor orders |
| `Invoice` | Auto-generated invoices |
| `Review` | Product reviews |
| `SalesHistory` | Daily sales records (90 days) |
| `Forecast` | AI forecast results |
| `Production` | Production planning & recommendations |
| `ReorderRecommendation` | Reorder alerts & actions |
| `Commission` | Platform commission tracking |
| `Notification` | Smart alerts for vendors/customers |
| `Coupon` | Discount codes |

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register customer or vendor |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Browse products (search, filter, sort) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Create product (vendor) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/trending` | Trending products |

### AI Forecasting
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forecasting/run/:productId` | Run AI forecast |
| GET | `/api/forecasting/:productId` | Get latest forecast |
| GET | `/api/forecasting/vendor/all` | All vendor forecasts |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory/vendor` | Inventory with AI insights |
| PUT | `/api/inventory/:productId/update-stock` | Update stock |

### Production
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/production/vendor` | Production recommendations |
| PUT | `/api/production/:id/action` | Accept/modify/reject |

### ML Service (Python)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/forecast` | Run LSTM/ES forecast |
| POST | `/forecast/batch` | Batch forecast for multiple products |

---

## 💰 Commission Model

```
Product Price = ₹1,000
Platform Commission (10%) = ₹100
Vendor Earnings = ₹900
```

Commission rate is configurable via `COMMISSION_RATE` in `.env`.

---

## 🏆 Vendor Performance Score

Calculated from 5 factors:
1. **Sales Score** (30%) — Revenue relative to platform average
2. **Rating Score** (25%) — Customer ratings (1–5 stars)
3. **Order Completion Rate** (20%) — % orders fulfilled
4. **Delivery Performance** (15%) — On-time delivery
5. **Return Rate** (10%) — Lower returns = higher score

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/multivendor
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
COMMISSION_RATE=0.10
NODE_ENV=development
```

### ML Service
```env
PORT=5001
```

---





## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Router v6 |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB |
| **ML Service** | Python, Flask, TensorFlow/Keras, Pandas, NumPy, statsmodels |
| **Auth** | JWT (Bearer tokens), bcrypt password hashing |
| **File Uploads** | Multer (local filesystem) |

---

## 📝 License

For educational purposes. Built for college project demonstration.
