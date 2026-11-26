const path = require('path');
const fs = require('fs');
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
  contentSecurityPolicy: false, // Allows Vite dev and external image assets
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());

// Dynamic CORS configuration (supports local dev, custom FRONTEND_URL, Vercel, Netlify, Render)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, health probes, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check endpoint (for deployment platforms like Render/Railway/K8s)
app.get('/health', (_req, res) => res.json({ status: 'OK', uptime: process.uptime(), time: new Date().toISOString() }));

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

// Full-stack single-service deployment support:
// If Vite production build exists in dist/, serve it directly!
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handlers for unhandled API routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
