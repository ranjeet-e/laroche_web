require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const path = require('path');
const kitchenRoutes = require('./routes/kitchenRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Serve in-house static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile), matching CLIENT_URL, localhost, or any *.vercel.app deployment
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
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

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'La Roche Cafe API is running' });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
