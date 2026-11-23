const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const { errorHandler, notFound } = require('./middleware/error.middleware');

// ── Feature-based routes ──────────────────────────────────────
const authRoutes       = require('./features/auth/auth.routes');
const propertyRoutes   = require('./features/properties/property.routes');
const roomRoutes       = require('./features/rooms/room.routes');
const inventoryRoutes  = require('./features/inventory/inventory.routes');
const bookingRoutes    = require('./features/bookings/booking.routes');
const paymentRoutes    = require('./features/payments/payment.routes');
const searchRoutes     = require('./features/search/search.routes');
const adminRoutes      = require('./features/admin/admin.routes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows Vite local dev assets
}));
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// API v1 routes
const v1 = '/api/v1';
app.use(`${v1}/auth`,       authRoutes);
app.use(`${v1}/properties`, propertyRoutes);
app.use(`${v1}/properties`, roomRoutes); // nested under /properties/:propertyId/rooms
app.use(`${v1}/inventory`,  inventoryRoutes);
app.use(`${v1}/bookings`,   bookingRoutes);
app.use(`${v1}/payments`,   paymentRoutes);
app.use(`${v1}/search`,     searchRoutes);
app.use(`${v1}/admin`,      adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;

