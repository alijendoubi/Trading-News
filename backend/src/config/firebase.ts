import admin from 'firebase-admin';
import { env } from './env.js';
import { logger } from './logger.js';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Initialize Firebase Admin with service account credentials
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
      }),
      databaseURL: env.firebase.databaseUrl,
    });

    logger.info('Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', { error });
    throw error;
  }
}

/**
 * Get Firebase Admin app instance
 */
export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

/**
 * Get Firestore instance
 */
export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseApp().firestore();
}

/**
 * Get Firebase Auth instance
 */
export function getAuth(): admin.auth.Auth {
  return getFirebaseApp().auth();
}

/**
 * Close Firebase connection
 */
export async function closeFirebase(): Promise<void> {
  if (firebaseApp) {
    await firebaseApp.delete();
    firebaseApp = null;
    logger.info('Firebase connection closed');
  }
}
