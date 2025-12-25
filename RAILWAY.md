# Railway Deployment Guide

## 🚂 Quick Deploy to Railway

### 1. Install Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy from GitHub
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect and deploy

### 3. Configure Environment Variables

In Railway Dashboard, add these variables:

```env
NODE_ENV=production
PORT=3000
PRODUCT_SERVICE_URL=http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io
INVENTORY_SERVICE_URL=http://localhost:8000
ORDER_SERVICE_URL=http://localhost:4000
USER_SERVICE_URL=http://localhost:5000
```

### 4. Deploy from CLI (Alternative)
```bash
# Initialize Railway project
railway init

# Link to project
railway link

# Deploy
railway up
```

## ⚙️ Railway Configuration

### Automatic Detection
Railway automatically detects:
- Node.js version from `package.json` engines
- Start command from `package.json` scripts.start
- Build command from `package.json` scripts.build

### Health Check
- Path: `/health`
- Timeout: 300 seconds
- Railway will monitor this endpoint

### Environment Variables
Set in Railway Dashboard under "Variables" tab:
- `PORT` - Railway provides this automatically
- `NODE_ENV=production`
- Add your service URLs

## 🔧 Troubleshooting

### Build Fails
1. Check Node version in `package.json` engines
2. Ensure all dependencies are in `dependencies` (not devDependencies)
3. Check Railway build logs

### App Crashes
1. Check Railway logs: `railway logs`
2. Verify environment variables
3. Check health endpoint: `https://your-app.railway.app/health`

### Port Issues
Railway provides PORT via environment variable. Our app already handles this:
```javascript
const PORT = process.env.PORT || 3000;
```

## 📊 Monitoring

### View Logs
```bash
railway logs
```

Or in Railway Dashboard → Deployments → View Logs

### Check Status
```bash
railway status
```

### Health Check
```bash
curl https://your-app.railway.app/health
```

## 🔄 Redeploy

### From GitHub
Push to your connected branch:
```bash
git push origin main
```
Railway auto-deploys on push.

### From CLI
```bash
railway up
```

## 📝 Files for Railway

- `package.json` - Contains engines, scripts, dependencies
- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration
- `Procfile` - Process configuration (backup)

## 🌐 Custom Domain

1. Go to Railway Dashboard
2. Settings → Domains
3. Add custom domain
4. Update DNS records

## 💡 Tips

1. **Use Railway environment variables** - Don't commit `.env` files
2. **Monitor logs** - Check for errors after deployment
3. **Test health endpoint** - Ensure `/health` returns 200
4. **Check service URLs** - Update PRODUCT_SERVICE_URL to production URLs
5. **Enable auto-deploy** - Deploy automatically on git push

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check build logs for specific errors
