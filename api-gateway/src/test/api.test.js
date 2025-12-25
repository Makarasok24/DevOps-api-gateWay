const request = require('supertest');
const app = require('../index');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('API Gateway', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.log and console.error
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  afterAll((done) => {
    done();
  });

  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.service).toBe('api-gateway');
  });

  test('Status endpoint shows all services', async () => {
    const response = await request(app).get('/api/status');
    expect(response.statusCode).toBe(200);
    expect(response.body.gateway).toBe('UP');
    expect(response.body.services).toHaveProperty('products');
    expect(response.body.services).toHaveProperty('inventory');
    expect(response.body.services).toHaveProperty('orders');
    expect(response.body.services).toHaveProperty('users');
  });

  test('404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Not Found');
  });

  describe('Product Service Proxy', () => {
    test('should proxy GET request to product service and log correctly', async () => {
      const mockData = {
        data: [{ id: 1, name: 'Test Product' }]
      };

      axios.mockResolvedValue({
        status: 200,
        data: mockData
      });

      const response = await request(app).get('/api/products');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockData);

      // Verify logs
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Request] GET /api/products')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] GET /api/products -> http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io/api/v1/products')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] Response 200 from /api/products')
      );
    });

    test('should proxy GET request with query parameters', async () => {
      const mockData = {
        current_page: 2,
        data: []
      };

      axios.mockResolvedValue({
        status: 200,
        data: mockData
      });

      const response = await request(app).get('/api/products?page=2');

      expect(response.statusCode).toBe(200);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('?page=2')
      );
    });

    test('should handle product service errors and log them', async () => {
      axios.mockRejectedValue({
        message: 'Network Error',
        response: { status: 503 }
      });

      const response = await request(app).get('/api/products');

      expect(response.statusCode).toBe(503);
      expect(response.body.error).toBe('Service Unavailable');
      expect(response.body.service).toBe('product-service');

      // Verify error log
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy Error]'),
        'Network Error'
      );
    });

    test('should proxy POST request to product service', async () => {
      const newProduct = { name: 'New Product', price: 10 };
      const mockResponse = { id: 1, ...newProduct };

      axios.mockResolvedValue({
        status: 201,
        data: mockResponse
      });

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(mockResponse);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] POST /api/products')
      );
    });
  });

  describe('Inventory Service Proxy', () => {
    test('should proxy request to inventory service and log correctly', async () => {
      const mockData = { inventory: [] };

      axios.mockResolvedValue({
        status: 200,
        data: mockData
      });

      const response = await request(app).get('/api/inventory');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Request] GET /api/inventory')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] GET /api/inventory -> http://localhost:8000/')
      );
    });

    test('should handle inventory service errors', async () => {
      axios.mockRejectedValue({
        message: 'Connection refused',
        response: { status: 500 }
      });

      const response = await request(app).get('/api/inventory');

      expect(response.statusCode).toBe(500);
      expect(response.body.service).toBe('inventory-service');
    });
  });

  describe('Order Service Proxy', () => {
    test('should proxy request to order service and log correctly', async () => {
      const mockData = { orders: [] };

      axios.mockResolvedValue({
        status: 200,
        data: mockData
      });

      const response = await request(app).get('/api/orders');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Request] GET /api/orders')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] GET /api/orders -> http://localhost:4000/')
      );
    });

    test('should handle order service errors', async () => {
      axios.mockRejectedValue({
        message: 'Timeout',
        response: { status: 504 }
      });

      const response = await request(app).get('/api/orders');

      expect(response.statusCode).toBe(504);
      expect(response.body.service).toBe('order-service');
    });
  });

  describe('User Service Proxy', () => {
    test('should proxy request to user service and log correctly', async () => {
      const mockData = { users: [] };

      axios.mockResolvedValue({
        status: 200,
        data: mockData
      });

      const response = await request(app).get('/api/users');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Request] GET /api/users')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] GET /api/users -> http://localhost:5000/')
      );
    });

    test('should handle user service errors', async () => {
      axios.mockRejectedValue({
        message: 'Not Found',
        response: { status: 404 }
      });

      const response = await request(app).get('/api/users');

      expect(response.statusCode).toBe(404);
      expect(response.body.service).toBe('user-service');
    });
  });

  describe('Logging Verification', () => {
    test('should log all requests through request middleware', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: {}
      });

      await request(app).get('/api/products');
      await request(app).get('/api/inventory');
      await request(app).post('/api/orders').send({});

      // Verify all requests were logged
      expect(consoleLogSpy).toHaveBeenCalledWith('[Request] GET /api/products');
      expect(consoleLogSpy).toHaveBeenCalledWith('[Request] GET /api/inventory');
      expect(consoleLogSpy).toHaveBeenCalledWith('[Request] POST /api/orders');
    });

    test('should log successful proxy responses', async () => {
      axios.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      await request(app).get('/api/products');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy] Response 200 from /api/products')
      );
    });

    test('should log proxy errors with details', async () => {
      const errorMessage = 'Service unavailable';
      axios.mockRejectedValue({
        message: errorMessage,
        response: { status: 503 }
      });

      await request(app).get('/api/products');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Proxy Error] /api/products:'),
        errorMessage
      );
    });
  });
});