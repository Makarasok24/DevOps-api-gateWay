# API Gateway - Build & Deployment Guide

## 🚀 Quick Start

### Build the application
```bash
npm run build
```

### Deploy with Docker Compose
```bash
npm run docker:up
```

Or use the deployment script:
```bash
chmod +x build.sh deploy.sh
./deploy.sh
```

## 📦 Available Scripts

### Development
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Testing
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Building & Deployment
- `npm run build` - Build Docker image
- `npm run build:prod` - Build Docker image (no cache)
- `npm run deploy` - Run tests and build
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t api-gateway:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### Check Health
```bash
curl http://localhost:3000/health
```

### View Service Status
```bash
curl http://localhost:3000/api/status
```

## 🔧 Environment Variables

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Required environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `PRODUCT_SERVICE_URL` - Product service endpoint
- `INVENTORY_SERVICE_URL` - Inventory service endpoint
- `ORDER_SERVICE_URL` - Order service endpoint
- `USER_SERVICE_URL` - User service endpoint

## 📍 API Endpoints

### Health & Status
- `GET /health` - Health check endpoint
- `GET /api/status` - Service status and configuration

### Microservices Routes
- `/api/products` - Product Service
- `/api/inventory` - Inventory Service
- `/api/orders` - Order Service
- `/api/users` - User Service

## 🔍 Monitoring

### View Logs
```bash
# Docker logs
docker-compose logs -f

# Specific service
docker logs api-gateway -f
```

### Check Container Status
```bash
docker-compose ps
```

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api-gateway

# Rebuild without cache
npm run build:prod
```

### Port already in use
```bash
# Stop existing container
docker-compose down

# Or change PORT in .env
```

### Health check failing
```bash
# Check if service is running
curl http://localhost:3000/health

# View detailed logs
docker logs api-gateway
```

## 📊 Production Deployment

1. **Run tests**
   ```bash
   npm test
   ```

2. **Build image**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   ./deploy.sh
   ```

4. **Verify deployment**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/status
   ```

## 🔐 Security

- Helmet.js for security headers
- CORS enabled
- Rate limiting (100 requests per 15 minutes)
- Request compression
- Environment-based configuration

## 📝 Notes

- Default port: 3000
- Health check interval: 30s
- Request timeout: 30s
- Log rotation: 10MB max, 3 files
