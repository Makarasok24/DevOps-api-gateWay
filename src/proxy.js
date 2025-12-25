const axios = require('axios');

// Service URLs
const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8000',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:4000',
  users: process.env.USER_SERVICE_URL || 'http://localhost:5000'
};

// Path mappings
const PATH_MAPPINGS = {
  products: '/api/v1/products',
  inventory: '/',
  orders: '/',
  users: '/'
};

function setupProxies(app) {
  // Product Service
  app.use('/api/products', async (req, res) => {
    try {
      const path = req.path === '/' ? PATH_MAPPINGS.products : PATH_MAPPINGS.products + req.path;
      const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const url = `${SERVICES.products}${path}${queryString}`;
      
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(SERVICES.products).host
        },
        timeout: 30000
      });
      
      console.log(`[Proxy] Response ${response.status} from ${req.originalUrl}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Proxy Error] ${req.originalUrl}:`, error.message);
      res.status(error.response?.status || 503).json({
        error: 'Service Unavailable',
        message: error.response?.data || error.message,
        service: 'product-service',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Inventory Service
  app.use('/inventory', async (req, res) => {
    try {
      const path = req.path === '/' ? PATH_MAPPINGS.inventory : PATH_MAPPINGS.inventory + req.path;
      const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const url = `${SERVICES.inventory}${path}${queryString}`;
      
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(SERVICES.inventory).host
        },
        timeout: 30000
      });
      
      console.log(`[Proxy] Response ${response.status} from ${req.originalUrl}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Proxy Error] ${req.originalUrl}:`, error.message);
      res.status(error.response?.status || 503).json({
        error: 'Service Unavailable',
        message: error.response?.data || error.message,
        service: 'inventory-service',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Order Service
  app.use('/api/orders', async (req, res) => {
    try {
      const path = req.path === '/' ? PATH_MAPPINGS.orders : PATH_MAPPINGS.orders + req.path;
      const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const url = `${SERVICES.orders}${path}${queryString}`;
      
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(SERVICES.orders).host
        },
        timeout: 30000
      });
      
      console.log(`[Proxy] Response ${response.status} from ${req.originalUrl}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Proxy Error] ${req.originalUrl}:`, error.message);
      res.status(error.response?.status || 503).json({
        error: 'Service Unavailable',
        message: error.response?.data || error.message,
        service: 'order-service',
        timestamp: new Date().toISOString()
      });
    }
  });

  // User Service
  app.use('/api/users', async (req, res) => {
    try {
      const path = req.path === '/' ? PATH_MAPPINGS.users : PATH_MAPPINGS.users + req.path;
      const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      const url = `${SERVICES.users}${path}${queryString}`;
      
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(SERVICES.users).host
        },
        timeout: 30000
      });
      
      console.log(`[Proxy] Response ${response.status} from ${req.originalUrl}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Proxy Error] ${req.originalUrl}:`, error.message);
      res.status(error.response?.status || 503).json({
        error: 'Service Unavailable',
        message: error.response?.data || error.message,
        service: 'user-service',
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('✅ Microservices routes configured (using axios):');
  console.log('  - /api/products  -> Product Service');
  console.log('  - /api/inventory -> Inventory Service');
  console.log('  - /api/orders    -> Order Service');
  console.log('  - /api/users     -> User Service');
}

module.exports = { setupProxies };