# Firebase/Firestore Setup Guide

## Overview
This project has been migrated from PostgreSQL to Firebase/Firestore for production deployment.

## Prerequisites
- Node.js 18+ installed
- A Google account
- Firebase CLI (optional, for deploying indexes)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** or select an existing project
3. Follow the setup wizard to create your project
4. Enable **Google Analytics** if desired (optional)

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose production mode (recommended) or test mode
4. Select your preferred Cloud Firestore location
5. Click **Enable**

## Step 3: Generate Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to the **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file (keep it secure!)

## Step 4: Configure Environment Variables

Open your `.env` file and update the Firebase credentials:

```bash
# Firebase / Firestore Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**Important Notes:**
- `FIREBASE_PROJECT_ID`: Found in your service account JSON as `project_id`
- `FIREBASE_CLIENT_EMAIL`: Found in your service account JSON as `client_email`
- `FIREBASE_PRIVATE_KEY`: Found in your service account JSON as `private_key` (keep the quotes and escape `\n` characters)
- `FIREBASE_DATABASE_URL`: Usually `https://PROJECT_ID.firebaseio.com` (optional for Firestore-only)

### Example from Service Account JSON:
```json
{
  "project_id": "my-trading-app",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@my-trading-app.iam.gserviceaccount.com"
}
```

## Step 5: Deploy Firestore Indexes

For optimal query performance, deploy the composite indexes:

### Option 1: Using Firebase CLI (Recommended)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy indexes
npm run deploy:indexes
```

### Option 2: Manual Index Creation

1. Go to **Firestore Database** > **Indexes** in Firebase Console
2. Create composite indexes as needed based on `firestore.indexes.json`
3. Firestore will also suggest indexes automatically when queries fail

## Step 6: Security Rules (Important!)

Set up Firestore security rules to protect your data:

1. Go to **Firestore Database** > **Rules**
2. Update rules based on your security requirements

### Example Production Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read public data
    match /economic_events/{eventId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
    
    match /market_assets/{assetId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
    
    match /news_articles/{articleId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
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
  }
}
```

## Step 7: Test Your Setup

Start your development server:

```bash
npm run dev
```

The application should connect to Firebase successfully. Check the logs for:
```
Firebase Admin initialized successfully
Firebase connected successfully
```

## Collections Structure

Your Firestore database will have the following collections:

- **users** - User accounts and preferences
- **economic_events** - Economic calendar events
- **market_assets** - Stock, forex, and crypto market data
- **news_articles** - Financial news articles
- **user_alerts** - Price alerts per user
- **user_watchlists** - User watchlists

## Migration from PostgreSQL

All data models have been migrated from PostgreSQL to Firestore:
- ✅ User authentication (JWT-based, stored in Firestore)
- ✅ Economic events
- ✅ Market assets
- ✅ News articles
- ✅ User alerts
- ✅ User watchlists

**Key Changes:**
- IDs are now strings instead of integers
- Timestamps use Firebase Timestamp objects
- No foreign key constraints (document references instead)
- Queries use Firestore syntax (no SQL)

## Firestore Best Practices

1. **Indexes**: Firestore will suggest indexes when queries fail. Deploy them promptly.
2. **Pagination**: Use `.limit()` and `.offset()` or cursor-based pagination for large result sets
3. **Batch Operations**: Use batched writes for multiple document updates
4. **Read/Write Costs**: Be mindful of document reads/writes (see Firebase pricing)
5. **Subcollections**: Consider using subcollections for user-specific data

## Firestore Pricing

Firebase offers a generous free tier:
- **Stored data**: 1 GB
- **Document reads**: 50,000/day
- **Document writes**: 20,000/day
- **Document deletes**: 20,000/day

For production usage beyond the free tier, see [Firebase Pricing](https://firebase.google.com/pricing).

## Troubleshooting

### Error: "Firebase not initialized"
- Check that all environment variables are set correctly
- Ensure private key is properly escaped

### Error: "The query requires an index"
- Deploy the missing index using Firebase CLI or console
- Firestore provides a link to create the index

### Authentication Issues
- Verify JWT secret is set in `.env`
- Check that Firebase Admin SDK is initialized before app starts

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
