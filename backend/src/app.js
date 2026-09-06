require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust reverse proxy (Render, Vercel, Cloudflare, Nginx) for accurate IP rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Global Rate Limiting for all API endpoints
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'La Roche Cafe API is running' });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
