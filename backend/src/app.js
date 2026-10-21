const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Serve in-house static uploads & menu items fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/menu-items', express.static(path.join(__dirname, '../../frontend/public/menu-items')));

// Trust reverse proxy (Render, Vercel, Cloudflare, Nginx) for accurate IP rate limiting
app.set('trust proxy', 1);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Middleware
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5050',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5050',
  'http://172.16.100.42:5050',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow non-browser requests (Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // 2. Allow if wildcard, development, port 5050 or college subnet
      if (
        process.env.CLIENT_URL === '*' ||
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes(':5050') ||
        origin.startsWith('http://172.16.') ||
        origin.startsWith('https://172.16.')
      ) {
        return callback(null, true);
      }

      // 3. Allow dynamic matching for configured origins (ignoring trailing slash)
      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.some((ao) => ao.replace(/\/$/, '') === cleanOrigin);
      if (isAllowed) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.options('*', cors());
app.use(express.json({ limit: '50kb' }));

// Health check endpoints (placed before global rate limiter so keep-alive pings don't consume rate limit quota)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Global Rate Limiting for all other API endpoints
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cms', cmsRoutes);

// Serve frontend static files if built
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // Client-side SPA routing fallback: serve index.html for any non-API route
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/menu-items') ||
      req.path === '/health'
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Fallback root endpoint if frontend is not built
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'La Roche Cafe API is running' });
  });
}

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
