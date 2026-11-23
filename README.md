# Ajintara — Mini Ajintara Hotel Booking Platform

A full-stack, production-grade hotel listing and booking platform for India built for the **Ajintara Technical Assessment (Full-Stack Developer / Platform Owner)**.

Built entirely in a **single unified folder structure** with a **vertical feature-based architecture**.

---

## 🌟 Tech Stack & Highlights

- **Frontend**: React (Vite) + Tailwind CSS + Lucide React + TanStack React Query + Zustand
- **Backend API**: Node.js + Express.js + Mongoose (MongoDB ODM)
- **Database**: MongoDB Atlas (`test.gg7r1on.mongodb.net/ajintara`)
- **Security**: Helmet, Express Mongo Sanitize, Rate Limiting, Bcrypt (12 salt rounds), JWT authentication, Role-based Access Control (RBAC)
- **Concurrency & Transactions (A4)**: MongoDB multi-document ACID Session Transactions to strictly prevent double-booking
- **Indian Standard Time (IST) Everywhere (A5)**: Check-in 2:00 PM IST (08:30 UTC), Check-out 12:00 PM IST (06:30 UTC), refund windows measured in IST
- **Tax Engine (A3)**: Configurable per-night GST slabs (5% ≤ ₹7,500, 18% > ₹7,500) computed individually for each night

---

## 🏗️ Clean Single-Folder Feature-Based Architecture

Everything lives directly in one project root (`ajintara/`) with domain-driven feature folders where models, controllers, routes, and UI components are co-located:

```text
ajintara/
├── .github/
│   └── workflows/
│       └── ci.yml               # Part B7: CI/CD Pipeline
├── src/
│   ├── config/                  # DB connection, Tax slabs, Global constants
│   ├── middleware/              # Auth guard (JWT/RBAC), Rate limiting, Global error handling
│   ├── utils/                   # Pricing breakdown, Date & IST conversions, Async handler
│   ├── jobs/                    # Part B3: Background cron jobs (10-minute hold release)
│   ├── components/              # Shared UI & Layout (Navbar, PrivateRoute)
│   ├── store/                   # Zustand persisted auth store
│   ├── lib/                     # Axios instance with JWT interceptors
│   ├── features/                # 📁 Feature-based domain vertical slices:
│   │   ├── auth/                # user.model, auth.controller, auth.routes, LoginPage, RegisterPage
│   │   ├── properties/          # property.model, property.controller, property.routes, HotelPage, HotelCard
│   │   ├── rooms/               # room.model, room.controller, room.routes
│   │   ├── inventory/           # inventory.model, inventory.controller, inventory.routes, ManageInventory
│   │   ├── bookings/            # booking.model, booking.controller, booking.routes, BookingFlow, MyBookings, BookingDetail
│   │   ├── payments/            # payment.model, payment.controller, payment.routes (Mock & Razorpay)
│   │   ├── search/              # search.controller, search.routes, SearchPage
│   │   ├── partner/             # PartnerDashboard, AddProperty
│   │   └── admin/               # admin.controller, admin.routes, AdminDashboard, AdminProperties, AdminBookings, AdminUsers
│   ├── scripts/                 # Database seed script & Concurrency stress test (A4)
│   └── tests/                   # Part B7: Pricing, Per-night GST, and Refund unit tests
├── index.html                   # Vite entry HTML
├── server.js                    # Express backend entry
├── vite.config.js               # Vite frontend configuration with /api proxy
├── tailwind.config.js           # Tailwind CSS theme configuration
├── postcss.config.js
├── package.json                 # Single unified package.json
├── ANSWERS.md                   # Part C: In-depth engineering answers
├── README.md                    # Project documentation
└── .env                         # Pre-configured environment variables
```

---

## 🚀 How to Run Locally Step-by-Step

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 2. Environment Variables
The `.env` file is already in the root directory pre-configured with the MongoDB Atlas cluster:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ajintara:Nagoor271%40%23@test.gg7r1on.mongodb.net/ajintara
JWT_SECRET=ajintara_super_secret_jwt_key_2024_xK9mP
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database
Seed 10 approved properties across 5+ Indian cities, room types, date-specific inventory overrides, and test accounts:
```bash
npm run seed
```

### 5. Start Full Application (Backend + Frontend together)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

*(Alternatively run individually: `npm run server` or `npm run client`)*

---

## 🔑 Test Login Credentials

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Guest** | `guest@ajintara.com` | `Guest@123` | Search, filter, 3-step checkout with GST breakdown, test payment, cancel with refund |
| **Partner** | `partner@ajintara.com` | `Partner@123` | Add property (starts pending), configure rooms, set date prices/inventory, view bookings |
| **Admin** | `admin@ajintara.com` | `Admin@123` | Approve/reject properties with reasons, block/unblock users, monitor revenue & top 5 cities |

---

## 🛡️ Inventory Correctness & Double-Booking Prevention (A4 Requirement)

### How We Prevent Double-Booking
1. **Multi-Document ACID Transactions**: In `src/features/bookings/booking.controller.js`, booking creation is enclosed within a MongoDB session transaction (`mongoose.startSession()`).
2. **Atomic Inventory Verification**: Inside the transaction, all active reservations (`confirmed` or `pending`) across the requested nights are aggregated. If `bookedCount + requestedQuantity > totalRooms`, the transaction aborts with HTTP `409 Conflict`.
3. **Automated Concurrency Stress Test**:
   Execute the automated concurrency test that fires **10 simultaneous requests for the last remaining room**:
   ```bash
   npm run test:concurrency
   ```
   *Result*: Exactly **1 booking succeeds**, while **9 are safely rejected**, demonstrating bulletproof concurrency control.

---

## 🇮🇳 Timezone & Date Standards (A5 Requirement)

- **Standard**: All dates follow **Indian Standard Time (IST, UTC+05:30)**.
- **Storage**: Calendar dates are stored as ISO `YYYY-MM-DD` strings representing the date in IST.
- **Check-in/Out Times**: Check-in is fixed at **2:00 PM IST (08:30 UTC)** and check-out at **12:00 PM IST (06:30 UTC)**.
- **Refund Windows**: Measured from check-in time in IST:
  - `> 48 hours`: 100% refund
  - `24 to 48 hours`: 50% refund
  - `< 24 hours`: No refund

---

## 🧩 Part B — Platform Tasks Included

1. **B3: Automatic Hold Expiry**:
   - Starting checkout places the room on a **10-minute hold** (`holdExpiresAt`).
   - A background cron job (`src/jobs/cronJobs.js`) runs every minute to automatically release expired holds if payment is not finished.
2. **B7: CI/CD Pipeline & Unit Tests**:
   - GitHub Actions pipeline configured in `.github/workflows/ci.yml`.
   - Comprehensive test suite covering pricing breakdown, per-night GST slabs, and cancellation refunds (`src/tests/pricing.test.js`).
   - Run tests:
     ```bash
     npm test
     ```

---

## 📝 Part C — Written Questions
Full in-depth production incident response, database indexing, webhooks, circuit breakers, and deployment strategies are documented in [ANSWERS.md](file:///C:/Users/nagoo/Downloads/ajintara/ANSWERS.md).
