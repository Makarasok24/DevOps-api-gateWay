# CI/CD Pipeline Documentation

## 🔄 Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD).

## 📋 Workflows

### 1. CI Pipeline (`ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**Jobs:**
- **Test** - Runs on Node.js 18.x and 20.x
  - Install dependencies
  - Run linter
  - Run unit tests
  - Generate coverage report
  - Upload to Codecov

- **Build** - Build application
  - Install dependencies
  - Run build script
  - Verify build artifacts

- **Docker** - Build and test Docker image
  - Build Docker image with commit SHA tag
  - Test image by running container
  - Health check verification

### 2. CD Pipeline (`cd.yml`)
**Triggers:** Push to `main` branch or manual dispatch

**Jobs:**
- **Deploy to Railway**
  - Run tests before deployment
  - Install Railway CLI
  - Deploy to Railway
  - Health check verification
  - Deployment status notification

### 3. Docker Pipeline (`docker.yml`)
**Triggers:** Push to `main`, tags, or PRs

**Jobs:**
- **Build and Push**
  - Build Docker image
  - Push to GitHub Container Registry
  - Tag with version/SHA
  - Run security scan with Trivy

### 4. Security Analysis (`codeql.yml`)
**Triggers:** Push to `main`/`develop`, PRs, or weekly schedule

**Jobs:**
- **CodeQL Analysis**
  - Static code analysis
  - Security vulnerability detection
  - Automated security alerts

### 5. Dependency Updates (`dependabot.yml`)
**Automated dependency management:**
- Weekly npm package updates
- GitHub Actions version updates
- Docker base image updates
- Auto-create PRs with updates

## 🔐 Required Secrets

Add these in GitHub Settings → Secrets and Variables → Actions:

```
RAILWAY_TOKEN - Railway authentication token
RAILWAY_URL - Your Railway app URL (optional for health checks)
```

### Getting Railway Token:
```bash
railway login
railway token
```

## 🚀 Deployment Flow

### Automatic Deployment
1. Push code to `main` branch
2. CI pipeline runs tests
3. If tests pass, CD pipeline deploys to Railway
4. Health check verifies deployment
5. Application is live

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "CD Pipeline - Deploy to Railway"
3. Click "Run workflow"
4. Select branch and run

## 📊 Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/your-username/your-repo/workflows/CI%20Pipeline/badge.svg)
![CD](https://github.com/your-username/your-repo/workflows/CD%20Pipeline/badge.svg)
![Docker](https://github.com/your-username/your-repo/workflows/Docker%20Build%20and%20Push/badge.svg)
```

## 🧪 Local Testing

### Test CI Pipeline Locally
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Build
npm run build
```

### Test Docker Build
```bash
# Build image
docker build -t api-gateway:test .

# Run container
docker run -d --name test -p 3000:3000 api-gateway:test

# Health check
curl http://localhost:3000/health

# Cleanup
docker stop test && docker rm test
```

## 🔧 Configuration Files

- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd.yml` - Continuous Deployment
- `.github/workflows/docker.yml` - Docker build and push
- `.github/workflows/codeql.yml` - Security analysis
- `.github/dependabot.yml` - Dependency updates
- `railway.json` - Railway deployment config
- `nixpacks.toml` - Railway build config

## 📈 Monitoring

### GitHub Actions Dashboard
- View workflow runs
- Check logs
- Monitor success/failure rates

### Railway Dashboard
- View deployments
- Check logs
- Monitor resource usage

## 🛠️ Troubleshooting

### CI Tests Fail
```bash
# Check test output
npm test

# Fix issues and commit
git commit -am "Fix tests"
git push
```

### Deployment Fails
1. Check Railway logs in GitHub Actions
2. Verify Railway token is valid
3. Check environment variables in Railway
4. Review health check endpoint

### Docker Build Fails
1. Test Docker build locally
2. Check Dockerfile syntax
3. Verify base image availability
4. Review build logs

## 🔄 Workflow Updates

To modify workflows:
1. Edit files in `.github/workflows/`
2. Commit and push changes
3. Workflows update automatically

## 📝 Best Practices

1. **Always run tests before deployment**
2. **Use semantic versioning for releases**
3. **Keep secrets secure - never commit them**
4. **Review Dependabot PRs regularly**
5. **Monitor CodeQL security alerts**
6. **Test locally before pushing**

## 🎯 Next Steps

- [ ] Add integration tests
- [ ] Set up staging environment
- [ ] Configure notifications (Slack/Discord)
- [ ] Add performance monitoring
- [ ] Implement blue-green deployment
- [ ] Add rollback capability

## 📞 Support

For issues with:
- **GitHub Actions**: Check Actions tab logs
- **Railway**: Check Railway dashboard
- **CI/CD**: Review workflow files
- **Docker**: Test build locally
