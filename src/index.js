const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Create app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Services status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    gateway: 'UP',
    services: {
      products: process.env.PRODUCT_SERVICE_URL ,
      inventory: process.env.INVENTORY_SERVICE_URL,
      orders: process.env.ORDER_SERVICE_URL,
      users: process.env.USER_SERVICE_URL
    },
    timestamp: new Date().toISOString()
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

// Stock management routes (before proxy routes)
const stockRoutes = require('./routes/stock');
app.use('/api/stock', stockRoutes);

// Routes
const { setupProxies } = require('./proxy');
setupProxies(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Export app for testing
module.exports = app;

// Only start server if not in test environment
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(` API Gateway running on port ${PORT}`);
    console.log(` Health: http://localhost:${PORT}/health`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}