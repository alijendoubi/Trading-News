import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Testing Firebase Connection...\n');

console.log('Environment variables loaded:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);
console.log('');

try {
  // Initialize Firebase Admin
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  console.log('✅ Firebase Admin initialized successfully\n');

  // Get Firestore instance
  const db = admin.firestore();
  console.log('✅ Firestore instance obtained\n');

  // Try to create a test document
  console.log('Attempting to create a test document...');
  const testRef = db.collection('test').doc('connection-test');
  
  await testRef.set({
    message: 'Connection test',
    timestamp: new Date(),
  });

  console.log('✅ Test document created successfully!\n');

  // Read it back
  const doc = await testRef.get();
  console.log('Document data:', doc.data());
  console.log('');

  // Clean up
  await testRef.delete();
  console.log('✅ Test document deleted\n');

  console.log('✅ All tests passed! Firebase is working correctly.');
  
  await app.delete();
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
