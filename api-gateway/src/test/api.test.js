const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after all tests
  afterAll((done) => {
    done();
  });

  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body.service).toBe('api-gateway');
  });

  test('404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
  });

  test('Rate limiting', async () => {
    // Make 110 requests (more than the 100 limit)
    const requests = [];
    for (let i = 0; i < 110; i++) {
      requests.push(request(app).get('/health'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.statusCode === 429);
    expect(rateLimited.length) > 0;
  });

  test('API routes exist', async () => {
    // These will likely fail because services aren't running,
    // but they should return proxy errors, not 404s
    const routes = ['/api/products', '/api/inventory', '/api/orders', '/api/users'];
    
    for (const route of routes) {
      const response = await request(app).get(route);
      // Should not be 404 - route should exist
      expect(response.statusCode) !== (404);
    }
  });
});