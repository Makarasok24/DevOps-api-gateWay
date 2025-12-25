# API Gateway - Microservices Architecture

API Gateway for routing requests to multiple microservices with built-in security, rate limiting, and monitoring.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Access Points
- Health Check: http://localhost:3000/health
- Service Status: http://localhost:3000/api/status
- Products API: http://localhost:3000/api/products
- Inventory API: http://localhost:3000/api/inventory
- Orders API: http://localhost:3000/api/orders
- Users API: http://localhost:3000/api/users

## 📦 Deployment

### Railway (Automatic)
Push to `main` branch triggers automatic deployment:
```bash
git push origin main
```

Railway automatically:
- ✅ Detects Node.js app
- ✅ Installs dependencies
- ✅ Starts the service
- ✅ Monitors health at `/health`

### Docker
```bash
# Build
npm run build:docker

# Run
docker-compose up -d

# View logs
npm run docker:logs
```

## 🔄 CI/CD Workflow

### Branch Strategy
- `main` → Production (Railway auto-deploys, no GitHub Actions)
- `develop` → Development (CI/CD runs on push)
- `feature/*` → Feature branches (CI runs on PR)

### GitHub Actions
- **CI Pipeline** - Runs on `develop` and PRs
  - Tests on Node 18.x & 20.x
  - Coverage reports
  - Docker build verification

- **CD Pipeline** - Manual only (`workflow_dispatch`)
  - Disabled for automatic runs
  - Railway handles deployment

- **Docker Build** - Runs on `develop` and tags
  - Builds and pushes to GHCR
  - Security scanning

- **CodeQL** - Security analysis
  - Runs on `develop` and PRs
  - Weekly scheduled scans

### To Deploy
```bash
# Deploy to production
git checkout main
git merge develop
git push origin main
# Railway auto-deploys!

# Run CI manually
# Go to Actions → Select workflow → Run workflow
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run build:docker` | Build Docker image |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:logs` | View container logs |

## 🔐 Environment Variables

Create `.env` file (see `.env.example`):
```env
NODE_ENV=production
PORT=3000
PRODUCT_SERVICE_URL=http://your-product-service.com
INVENTORY_SERVICE_URL=http://your-inventory-service.com
ORDER_SERVICE_URL=http://your-order-service.com
USER_SERVICE_URL=http://your-user-service.com
```

## 🏗️ Architecture

```
API Gateway
├── /health              → Health check
├── /api/status          → Service status
├── /api/products/*      → Product Service
├── /api/inventory/*     → Inventory Service
├── /api/orders/*        → Order Service
└── /api/users/*         → User Service
```

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ CORS enabled
- ✅ Rate limiting (100 req/15min)
- ✅ Request compression
- ✅ Request logging
- ✅ Error handling

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Service Status
```bash
curl http://localhost:3000/api/status
```

### View Logs
```bash
# Docker
docker logs api-gateway -f

# Railway
railway logs
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# With coverage
npm run test:coverage
```

## 📚 Documentation

- [CI/CD Documentation](CI-CD.md)
- [Railway Deployment](RAILWAY.md)
- [Docker Deployment](DEPLOYMENT.md)

## 🤝 Contributing

1. Create feature branch from `develop`
2. Make changes and add tests
3. Create PR to `develop`
4. CI runs automatically
5. After review, merge to `develop`
6. Merge `develop` to `main` to deploy

## 📝 Project Structure

```
.
├── src/
│   ├── index.js           # Main application
│   ├── proxy.js           # Service routing
│   ├── middleware/        # Custom middleware
│   └── test/              # Test files
├── .github/
│   └── workflows/         # CI/CD pipelines
├── coverage/              # Test coverage reports
├── logs/                  # Application logs
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── nixpacks.toml          # Railway build config
├── railway.json           # Railway deployment config
└── package.json           # Dependencies & scripts
```

## 🔗 Links

- Railway Dashboard: [railway.app](https://railway.app)
- GitHub Actions: [Actions tab]
- Product Service: Check `PRODUCT_SERVICE_URL`

## 📞 Support

For issues or questions:
1. Check logs: `npm run docker:logs` or Railway dashboard
2. Review documentation in `/docs`
3. Check GitHub Actions for CI/CD issues
4. Verify environment variables

---

Built with ❤️ using Node.js, Express, and Axios
