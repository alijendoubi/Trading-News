# Deployment Guide

This guide covers how to build and deploy your Trading Hub application.

## 🔗 Repository

Your code is now on GitHub: **https://github.com/alijendoubi/Trading-News.git**

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account with Firestore enabled
- API keys for third-party services (Alpha Vantage, Finnhub, etc.)

## 🏗️ Building the Application

### Backend

```bash
cd backend
npm install
npm run build
```

The compiled files will be in `backend/dist/`

### Frontend

```bash
cd frontend
npm install
npm run build
```

The production build will be in `frontend/.next/`

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

Vercel is ideal for Next.js applications and offers free hosting.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```
   
3. **Configure Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL

4. **Production Deployment:**
   ```bash
   vercel --prod
   ```

**Vercel Dashboard:** https://vercel.com/dashboard

### Option 2: Render (Recommended for Full Stack)

Render can host both frontend and backend.

#### Backend Deployment:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** trading-hub-backend
   - **Root Directory:** backend
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
   
5. Add environment variables from `backend/.env`:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `JWT_SECRET`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - All API keys (ALPHA_VANTAGE_API_KEY, FINNHUB_API_KEY, etc.)

#### Frontend Deployment:

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** trading-hub-frontend
   - **Root Directory:** frontend
   - **Build Command:** `npm install && npm run build && npm run export`
   - **Publish Directory:** `out`
   
4. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` - Your backend URL from Render

### Option 3: Railway

Railway offers easy deployment with automatic HTTPS.

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add two services:
   - **Backend:** Root directory `backend`, start command `npm start`
   - **Frontend:** Root directory `frontend`, start command `npm start`
5. Configure environment variables in Railway dashboard

### Option 4: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App" → Select your GitHub repository
3. Configure two components:
   - **Backend API:** Node.js service
   - **Frontend:** Static site or Node.js service
4. Add environment variables
5. Deploy

### Option 5: Self-Hosted (VPS)

#### Using PM2 on Ubuntu/Debian:

1. **Install Node.js and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone and Setup:**
   ```bash
   git clone https://github.com/alijendoubi/Trading-News.git
   cd Trading-News
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm run build
   
   # Copy .env.example to .env and configure
   cp .env.example .env
   nano .env
   
   # Start with PM2
   pm2 start dist/server.js --name trading-backend
   pm2 save
   pm2 startup
   ```

4. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run build
   
   # Create .env.local
   echo "NEXT_PUBLIC_API_BASE_URL=http://your-server-ip:3001" > .env.local
   
   # Start with PM2
   pm2 start npm --name trading-frontend -- start
   pm2 save
   ```

5. **Setup Nginx as Reverse Proxy:**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/trading-hub
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   
       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/trading-hub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-here

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# API Keys
ALPHA_VANTAGE_API_KEY=your-key
FINNHUB_API_KEY=your-key
NEWSAPI_KEY=your-key
CRYPTOPANIC_API_KEY=your-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=TradingHub
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Update all API keys and secrets
- [ ] Set strong JWT_SECRET
- [ ] Enable Firebase security rules
- [ ] Configure CORS properly in backend
- [ ] Use HTTPS for all connections
- [ ] Never commit `.env` or `serviceAccountKey.json`
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Configure proper error logging

## 📊 Monitoring

### PM2 Monitoring (Self-Hosted)

```bash
# View logs
pm2 logs trading-backend
pm2 logs trading-frontend

# Monitor resources
pm2 monit

# Restart services
pm2 restart trading-backend
pm2 restart trading-frontend
```

### Cloud Platform Monitoring

- **Vercel:** Built-in analytics in dashboard
- **Render:** Metrics tab in service dashboard
- **Railway:** Built-in metrics and logs
- **DigitalOcean:** App platform metrics

## 🔄 Continuous Deployment

### Vercel (Automatic)

Vercel automatically deploys on every push to main branch.

### Render (Automatic)

Enable "Auto-Deploy" in service settings for automatic deployments.

### Railway (Automatic)

Railway automatically deploys on every push.

### Self-Hosted with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd Trading-News
            git pull origin main
            cd backend && npm install && npm run build
            cd ../frontend && npm install && npm run build
            pm2 restart all
```

## 🐛 Troubleshooting

### Registration/Login Issues

The current implementation uses Firebase Firestore for authentication. Ensure:

1. Firebase is properly initialized
2. Firestore has the `users` collection
3. Service account key is correctly configured
4. Firebase security rules allow read/write to users collection

### Build Errors

```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### Port Already in Use

```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

## 📚 Additional Resources

- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Firebase Docs:** https://firebase.google.com/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs

## 🎯 Quick Start Commands

```bash
# Local Development
npm run dev

# Production Build
npm run build

# Start Production Server
npm start

# Push to GitHub
git add -A
git commit -m "Your message"
git push origin main
```

## 📧 Support

For issues or questions:
- Check the documentation in the repo
- Review backend logs: `backend/logs/`
- Check Firebase console for database issues
- Review environment variable configuration

---

**Repository:** https://github.com/alijendoubi/Trading-News.git

**Last Updated:** November 25, 2024
