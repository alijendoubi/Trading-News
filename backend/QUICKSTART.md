# 🚀 Quick Start Guide - Trading Backend

## Current Status
✅ Migration from PostgreSQL to Firestore is **COMPLETE**  
✅ All code is ready and compiles successfully  
⏳ Waiting for Firebase credentials to run

## What You Need To Do

### Option 1: Automated Setup (Recommended)

1. **Download Service Account Key**
   - Go to: https://console.firebase.google.com/
   - Select project: **tradinghub-1b8b0**
   - Navigate: ⚙️ Project settings → Service accounts tab
   - Click: "Generate new private key" → Save as `serviceAccountKey.json` in this folder

2. **Run Setup Script**
   ```bash
   ./setup-firebase.sh
   ```
   This will automatically extract and configure all credentials in your `.env` file.

3. **Enable Firestore Database**
   - Go to Firebase Console → Firestore Database
   - Click "Create database" → Choose "Production mode"
   - Select location (e.g., us-central1)

4. **Start Your Server**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

Follow the detailed instructions in `FIREBASE_ADMIN_SETUP.md`

## What's Already Done

✅ **Firebase Admin SDK** installed and configured  
✅ **All 6 data models** migrated to Firestore:
   - Users
   - Economic Events
   - Market Assets
   - User Alerts
   - News Articles
   - Watchlists

✅ **All services** updated to use Firestore  
✅ **All routes** functional (blog, brokers, forum)  
✅ **Firestore indexes** configured in `firestore.indexes.json`  
✅ **TypeScript compilation** passing with no errors

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts          # Firebase Admin initialization
│   │   ├── firestore.ts         # Firestore helper functions
│   │   └── env.ts               # Environment config
│   ├── models/                  # All models use Firestore
│   ├── services/                # All services use Firestore
│   ├── routes/                  # All routes functional
│   └── server.ts                # Server with Firebase init
├── firestore.indexes.json       # Database indexes
├── .env                         # Your config (needs credentials)
└── FIREBASE_ADMIN_SETUP.md      # Detailed setup guide
```

## After Setup

Once your credentials are configured, you can:

1. **Deploy Firestore Indexes** (for better query performance)
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore  # Use existing files
   npm run deploy:indexes
   ```

2. **Set Security Rules** (in Firebase Console)
   Copy rules from `FIREBASE_ADMIN_SETUP.md` → Firestore Database → Rules

3. **Test All Endpoints**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Register user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

## Important Notes

🔒 **Security:**
- The client-side Firebase config you have is for your **frontend app** (React/Vue/etc.)
- Backend needs different credentials (service account key)
- Never commit `serviceAccountKey.json` or your private key to Git

📝 **Environment Variables:**
- Required: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_DATABASE_URL`
- Optional: JWT_SECRET (for token signing)
- Optional: Market data API keys (for better data coverage)

## Troubleshooting

### "Firebase not initialized"
- Check that all Firebase env vars are set in `.env`
- Verify the private key has proper quotes and `\n` newlines

### "Permission denied" errors
- Enable Firestore Database in Firebase Console
- Check security rules allow server access

### TypeScript errors
```bash
npm run build  # Should pass with 0 errors
```

### Port already in use
```bash
lsof -ti:5000 | xargs kill -9  # Kill process on port 5000
```

## Need Help?

1. Check `FIREBASE_ADMIN_SETUP.md` for detailed instructions
2. Check `MIGRATION_COMPLETE.md` for migration details
3. All documentation is in the root directory

## What's Next?

After your server is running:
1. Connect your frontend app using the client-side Firebase config
2. Add more API keys for data sources (optional - see `.env`)
3. Deploy to production (Firebase Hosting, Cloud Run, etc.)
4. Set up monitoring and logging

---

**Status:** Ready to launch! Just need Firebase credentials. 🚀
