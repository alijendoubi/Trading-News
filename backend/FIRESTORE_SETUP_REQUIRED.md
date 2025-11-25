# ⚠️ FIRESTORE DATABASE NOT ENABLED

## Issue
The application is getting a "5 NOT_FOUND" error because **Firestore database has not been enabled** in your Firebase project.

## Solution: Enable Firestore in Firebase Console

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/tradinghub-1b8b0/firestore

### Step 2: Create Firestore Database
1. Click **"Create database"** button
2. Choose a starting mode:
   - **Test mode** (recommended for development) - Allows all reads/writes for 30 days
   - **Production mode** - Requires security rules (see below)
3. Select a location (choose one closest to your users):
   - `us-central1` (Iowa) - Good for North America
   - `europe-west1` (Belgium) - Good for Europe
   - `asia-southeast1` (Singapore) - Good for Asia
4. Click **"Enable"**

### Step 3: Wait for Database Creation
It usually takes 1-2 minutes for the database to be fully provisioned.

### Step 4: Test the Connection
Run this command to test:
```bash
cd backend
node test-firebase.js
```

You should see:
```
✅ Firebase Admin initialized successfully
✅ Firestore instance obtained
✅ Test document created successfully!
✅ All tests passed! Firebase is working correctly.
```

## Security Rules (For Test Mode)

If you chose **Test mode**, your initial rules will be:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 25);
    }
  }
}
```

## Security Rules (For Production Mode)

If you chose **Production mode**, update your rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if true; // Allow user registration
    }
    
    // Watchlists
    match /user_watchlists/{watchlistId} {
      allow read, write: if request.auth != null && 
                             request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
    
    // Alerts
    match /user_alerts/{alertId} {
      allow read, write: if request.auth != null && 
                             request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
    
    // Public collections (read-only for authenticated users)
    match /economic_events/{eventId} {
      allow read: if true;
      allow write: if false; // Only backend can write
    }
    
    match /market_assets/{assetId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /news_articles/{articleId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## After Enabling Firestore

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test user registration:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
   ```

3. **Expected response:**
   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": "...",
         "email": "user@example.com",
         "name": "Test User"
       },
       "tokens": {
         "accessToken": "...",
         "refreshToken": "..."
       }
     },
     "message": "User registered successfully"
   }
   ```

## Quick Links

- **Firebase Console:** https://console.firebase.google.com/project/tradinghub-1b8b0
- **Firestore Database:** https://console.firebase.google.com/project/tradinghub-1b8b0/firestore
- **Firestore Rules:** https://console.firebase.google.com/project/tradinghub-1b8b0/firestore/rules

## Troubleshooting

### Still getting "5 NOT_FOUND" error?
1. Make sure you clicked "Create database" and waited for it to finish
2. Verify you're in the correct Firebase project (tradinghub-1b8b0)
3. Check that your service account key hasn't been revoked
4. Try regenerating the service account key

### How to regenerate service account key?
1. Go to: https://console.firebase.google.com/project/tradinghub-1b8b0/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file
4. Replace `backend/serviceAccountKey.json` with the new file
5. Update the values in `backend/.env` from the new JSON file

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**After completing these steps, authentication should work correctly!**
