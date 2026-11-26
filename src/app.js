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

// Health check endpoint (for deployment platforms like Render/Railway/K8s/Vercel)
app.get(['/health', '/api/health'], (_req, res) => res.json({ status: 'OK', uptime: process.uptime(), time: new Date().toISOString() }));

// Seed endpoint for instant cloud database setup (GET / POST)
const handleSeed = async (_req, res) => {
  try {
    const { seedDatabase } = require('./scripts/seedData');
    const result = await seedDatabase(true);
    res.json({ success: true, message: 'Database successfully seeded!', ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seed failed', error: err.message });
  }
};
app.all(['/api/v1/seed', '/v1/seed'], handleSeed);

// API v1 routes (mounted on both /api/v1 and /v1 for Vercel/serverless rewrite compatibility)
['/api/v1', '/v1'].forEach((prefix) => {
  app.use(`${prefix}/auth`,       authRoutes);
  app.use(`${prefix}/properties`, propertyRoutes);
  app.use(`${prefix}/properties`, roomRoutes); // nested under /properties/:propertyId/rooms
  app.use(`${prefix}/inventory`,  inventoryRoutes);
  app.use(`${prefix}/bookings`,   bookingRoutes);
  app.use(`${prefix}/payments`,   paymentRoutes);
  app.use(`${prefix}/search`,     searchRoutes);
  app.use(`${prefix}/admin`,      adminRoutes);
});

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
