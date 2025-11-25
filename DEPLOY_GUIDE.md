# 🚀 Complete Deployment Guide - Step by Step

## Quick Overview

Your app needs 2 parts deployed:
1. **Frontend** (Next.js) → Vercel (recommended)
2. **Backend** (Node.js/Express) → Render (recommended)

**Total time:** ~20 minutes

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:
- [ ] Firestore database is enabled (see `backend/FIRESTORE_SETUP_REQUIRED.md`)
- [ ] Test locally: `node backend/test-firebase.js` passes
- [ ] All code is pushed to GitHub
- [ ] You have your Firebase credentials ready

---

## 🎯 Recommended: Vercel + Render

### Part 1: Deploy Backend to Render (Do this first!)

#### Step 1: Sign up for Render
1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with your GitHub account

#### Step 2: Create Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect Account"** to connect GitHub
4. Find and select your repository: **Trading-News**
5. Click **"Connect"**

#### Step 3: Configure Service
Fill in these settings:

```
Name: trading-hub-backend
Region: Oregon (US West) [or closest to your users]
Branch: main
Root Directory: backend
Runtime: Node
Node Version: 20 (IMPORTANT: Select Node 20 or higher)
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

**Important:** Make sure to select **Node 20** or higher in the Node Version dropdown. Firebase requires Node 20+.

#### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add each of these (click "+ Add Environment Variable" for each):

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=super_secure_random_string_change_this_in_production_min_32_chars

# Firebase Configuration
FIREBASE_PROJECT_ID=tradinghub-1b8b0
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tradinghub-1b8b0.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://tradinghub-1b8b0.firebaseio.com
```

For `FIREBASE_PRIVATE_KEY`, copy the ENTIRE value from your `backend/.env` file (including quotes and `\n`):
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...[rest of key]...WvO/8Hk\n-----END PRIVATE KEY-----"
```

**Optional API Keys** (if you have them):
```bash
GNEWS_API_KEY=1122a09343633fead627161d198aa612
TWELVE_DATA_API_KEY=your_key
FINNHUB_API_KEY=your_key
```

#### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build and deployment
3. Once deployed, you'll see "Live" with a green dot
4. **Copy your backend URL** - looks like: `https://trading-hub-backend.onrender.com`

#### Step 6: Test Backend
```bash
curl https://your-backend-url.onrender.com/health
```

You should see: `{"status":"ok","timestamp":"..."}`

---

### Part 2: Deploy Frontend to Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

Follow the prompts to login (opens browser).

#### Step 3: Deploy from Terminal
```bash
cd /Users/alijendoubi/desktop/coding/trading/frontend
vercel
```

Answer the prompts:
```
? Set up and deploy? Y
? Which scope? [Select your account]
? Link to existing project? N
? What's your project's name? trading-hub
? In which directory is your code located? ./
? Want to override the settings? N
```

Wait for deployment (~2-3 minutes).

#### Step 4: Add Environment Variables
1. Go to: https://vercel.com/dashboard
2. Click on your project: **trading-hub**
3. Go to: **Settings** → **Environment Variables**
4. Add variable:
   ```
   Name: NEXT_PUBLIC_API_BASE_URL
   Value: https://your-backend-url.onrender.com
   Environments: [Check all: Production, Preview, Development]
   ```
5. Click **"Save"**

#### Step 5: Deploy to Production
```bash
vercel --prod
```

#### Step 6: Test Your App
1. Open the URL Vercel gives you (e.g., `https://trading-hub-xxx.vercel.app`)
2. Try registering a new user
3. Try logging in
4. Visit `/blog/new` after logging in

---

## 🎉 You're Live!

Your app is now deployed:
- **Frontend:** `https://trading-hub-xxx.vercel.app`
- **Backend:** `https://trading-hub-backend.onrender.com`

---

## 🔄 Updating Your App

### Option 1: Automatic (Recommended)

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make your changes
git add -A
git commit -m "Your changes"
git push origin main
```

Both services will automatically detect the push and redeploy!

### Option 2: Manual

**Redeploy Frontend:**
```bash
cd frontend
vercel --prod
```

**Redeploy Backend:**
Go to Render dashboard → Select service → Click "Manual Deploy" → "Deploy latest commit"

---

## 📊 Monitoring & Logs

### Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click "Deployments"
4. Click on a deployment to see logs

### Render Logs
1. Go to: https://dashboard.render.com
2. Click your service
3. Click "Logs" tab
4. Real-time logs will appear

---

## 🐛 Troubleshooting

### Frontend: "Failed to fetch" errors
**Problem:** Frontend can't reach backend

**Solutions:**
1. Check `NEXT_PUBLIC_API_BASE_URL` in Vercel settings
2. Make sure backend URL is correct (include `https://`, no trailing slash)
3. Check CORS settings in backend
4. Redeploy frontend after fixing

### Backend: "5 NOT_FOUND" error
**Problem:** Firestore database not enabled

**Solution:**
1. Enable Firestore: https://console.firebase.google.com/project/tradinghub-1b8b0/firestore
2. Wait 2 minutes
3. Redeploy backend

### Backend: Build fails
**Problem:** Missing dependencies or environment variables

**Solutions:**
1. Check all environment variables are set in Render
2. Check build logs in Render dashboard
3. Make sure `package.json` has all dependencies

### Backend: "Application Error" or crashes
**Problem:** Runtime error

**Solutions:**
1. Check logs in Render dashboard
2. Common issues:
   - Missing environment variables
   - Firebase credentials incorrect
   - Port configuration (should be 3001)

---

## 💡 Tips

### Free Tier Limitations

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds
- 750 hours/month free

**Vercel Free Tier:**
- 100GB bandwidth
- Unlimited deployments
- Custom domains supported

### Upgrade Options

**If you need always-on backend:**
- Render: $7/month for "Starter" tier
- Railway: $5/month
- DigitalOcean: $5/month

### Custom Domain

**Vercel (Frontend):**
1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as instructed

**Render (Backend):**
1. Upgrade to paid plan ($7/month)
2. Add custom domain in service settings
3. Update DNS records

---

## 📱 Progressive Web App (Optional)

To make your app installable:

1. Add to `frontend/public/manifest.json`:
```json
{
  "name": "Trading Hub",
  "short_name": "Trading",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. Add to `frontend/app/layout.tsx`:
```tsx
<link rel="manifest" href="/manifest.json" />
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update Firestore security rules
- [ ] Add rate limiting (already configured)
- [ ] Enable HTTPS only (automatic on Vercel/Render)
- [ ] Review CORS settings
- [ ] Remove any test accounts
- [ ] Backup Firestore data regularly

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Firebase Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

## ✅ Deployment Checklist

Use this checklist:

**Backend (Render):**
- [ ] Service created and connected to GitHub
- [ ] All environment variables added
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Service is "Live"
- [ ] Health check works: `/health`

**Frontend (Vercel):**
- [ ] Project deployed via Vercel CLI
- [ ] `NEXT_PUBLIC_API_BASE_URL` environment variable set
- [ ] Production deployment successful
- [ ] Site loads correctly
- [ ] Can register/login
- [ ] API calls work

**Testing:**
- [ ] Registration works
- [ ] Login works
- [ ] Protected routes work
- [ ] Blog creation works
- [ ] No console errors

---

## 🎯 Next Steps After Deployment

1. **Monitor logs** for any errors
2. **Test all features** thoroughly
3. **Set up error tracking** (optional - Sentry)
4. **Add analytics** (optional - Google Analytics)
5. **Get feedback** from users
6. **Iterate and improve**

---

**Congratulations! Your trading app is now live! 🎉**

**Support:** Check logs in Vercel/Render dashboards if issues occur
**Updates:** Push to GitHub and both services auto-deploy
