# Firebase Admin SDK Setup

## ⚠️ Important: Backend vs Frontend Firebase Configuration

The Firebase config you have is for **frontend web apps** (contains `apiKey`, `authDomain`, etc.).
For the **backend Node.js server**, we need **Firebase Admin SDK** credentials, which are different.

## Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **tradinghub-1b8b0**
3. Click the gear icon ⚙️ next to "Project Overview" → **Project settings**
4. Go to the **Service accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** - this will download a JSON file

## Step 2: Extract Credentials from JSON

The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "tradinghub-1b8b0",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tradinghub-1b8b0.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Step 3: Update Your .env File

Update the following in your `.env` file:

```bash
# Firebase / Firestore
FIREBASE_PROJECT_ID=tradinghub-1b8b0
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tradinghub-1b8b0.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://tradinghub-1b8b0.firebaseio.com
```

**IMPORTANT:** 
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` newline characters in the private key
- **NEVER commit this to Git** - it's already in .gitignore

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database** in the left menu
2. Click **"Create database"**
3. Choose **Production mode** (we'll set up security rules)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

## Step 5: Deploy Firestore Indexes

After setting up your credentials, deploy the indexes:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore  # Select your project, use existing files
npm run deploy:indexes
```

## Step 6: Set Up Security Rules

In Firebase Console → Firestore Database → Rules, add:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read market data, events, news
    match /economic_events/{document=**} {
      allow read: if true;
      allow write: if false;  // Only server can write
    }
    
    match /market_assets/{document=**} {
      allow read: if true;
      allow write: if false;  // Only server can write
    }
    
    match /news_articles/{document=**} {
      allow read: if true;
      allow write: if false;  // Only server can write
    }
    
    // User-specific collections
    match /user_alerts/{alertId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    match /user_watchlists/{watchlistId} {
      allow read, write: if request.auth != null && 
                           resource.data.user_id == request.auth.uid;
    }
    
    // Blog, forum, brokers - public read, authenticated write
    match /{collection}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 7: Test Your Setup

```bash
npm run dev
```

Check the console output for:
```
✅ Firebase initialized successfully
```

## Troubleshooting

### Error: "Invalid service account"
- Make sure you copied the entire private key with BEGIN/END markers
- Check that the key is wrapped in quotes in .env

### Error: "Project not found"
- Verify FIREBASE_PROJECT_ID matches your Firebase Console project ID

### Error: "Permission denied"
- Your service account might need Firestore Admin role
- Go to IAM & Admin in Google Cloud Console
- Add "Cloud Datastore User" role to your service account

## Frontend Configuration (Separate)

The client-side Firebase config you provided should be used in your **frontend application**:
```javascript
// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQMAo0C3OzPPN63DdzvnlbQBWjw2hkfG0",
  authDomain: "tradinghub-1b8b0.firebaseapp.com",
  projectId: "tradinghub-1b8b0",
  storageBucket: "tradinghub-1b8b0.firebasestorage.app",
  messagingSenderId: "598160578566",
  appId: "1:598160578566:web:2333b1170943ec027bcb87",
  measurementId: "G-G2ST01JVCH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

This is safe to commit publicly and should be used in your React/Vue/Angular frontend.
