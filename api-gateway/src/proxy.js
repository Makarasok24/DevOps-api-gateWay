const { createProxyMiddleware } = require('http-proxy-middleware');

function setupProxies(app) {
  // Product Service
  app.use('/api/products', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api/products': '/' }
  }));

  // Inventory Service
  app.use('/api/inventory', createProxyMiddleware({
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api/inventory': '/' }
  }));

  // Order Service
  app.use('/api/orders', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:4000',
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/' }
  }));

  // User Service
  app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/' }
  }));
}

module.exports = { setupProxies };