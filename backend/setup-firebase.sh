#!/bin/bash

# Firebase Setup Script for Trading Backend
# This script helps you configure Firebase credentials

set -e  # Exit on error

echo "🔥 Firebase Admin SDK Setup for Trading Backend"
echo "================================================"
echo ""

# Check if service account key file exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Service account key file not found!"
    echo ""
    echo "📋 Follow these steps:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select your project: tradinghub-1b8b0"
    echo "3. Click ⚙️ → Project settings → Service accounts"
    echo "4. Click 'Generate new private key'"
    echo "5. Save the file as 'serviceAccountKey.json' in this directory"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Found serviceAccountKey.json"
echo ""

# Extract values from service account key
PROJECT_ID=$(node -pe "JSON.parse(require('fs').readFileSync('serviceAccountKey.json', 'utf8')).project_id")
CLIENT_EMAIL=$(node -pe "JSON.parse(require('fs').readFileSync('serviceAccountKey.json', 'utf8')).client_email")
PRIVATE_KEY=$(node -pe "JSON.parse(require('fs').readFileSync('serviceAccountKey.json', 'utf8')).private_key")
DATABASE_URL="https://${PROJECT_ID}.firebaseio.com"

echo "📝 Extracted credentials:"
echo "   Project ID: $PROJECT_ID"
echo "   Client Email: $CLIENT_EMAIL"
echo "   Database URL: $DATABASE_URL"
echo ""

# Update .env file
echo "📝 Updating .env file..."

# Create backup
cp .env .env.backup
echo "✅ Created backup: .env.backup"

# Update .env with extracted values
sed -i.tmp "s|FIREBASE_PROJECT_ID=.*|FIREBASE_PROJECT_ID=$PROJECT_ID|g" .env
sed -i.tmp "s|FIREBASE_CLIENT_EMAIL=.*|FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL|g" .env
sed -i.tmp "s|FIREBASE_DATABASE_URL=.*|FIREBASE_DATABASE_URL=$DATABASE_URL|g" .env

# Handle private key (it contains newlines)
# We need to escape it properly for .env - replace actual newlines with literal \n
ESCAPED_KEY=$(echo "$PRIVATE_KEY" | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
sed -i.tmp "s|FIREBASE_PRIVATE_KEY=.*|FIREBASE_PRIVATE_KEY=\"$ESCAPED_KEY\"|g" .env

# Clean up temp files
rm .env.tmp

echo "✅ Updated .env file"
echo ""

# Check if Firestore is enabled
echo "🔍 Next steps:"
echo ""
echo "1. Enable Firestore Database:"
echo "   → Go to Firebase Console → Firestore Database"
echo "   → Click 'Create database'"
echo "   → Choose 'Production mode'"
echo "   → Select your preferred location"
echo ""
echo "2. Install Firebase CLI and deploy indexes:"
echo "   npm install -g firebase-tools"
echo "   firebase login"
echo "   firebase init firestore"
echo "   npm run deploy:indexes"
echo ""
echo "3. Start your server:"
echo "   npm run dev"
echo ""
echo "4. Security: DELETE serviceAccountKey.json after setup!"
echo "   rm serviceAccountKey.json"
echo ""
echo "✅ Setup complete! Check FIREBASE_ADMIN_SETUP.md for more details."
