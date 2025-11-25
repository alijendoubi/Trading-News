import admin from 'firebase-admin';
import { env } from './env.js';
import { logger } from './logger.js';
let firebaseApp = null;
/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
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
    }
    catch (error) {
        logger.error('Failed to initialize Firebase Admin', { error });
        throw error;
    }
}
/**
 * Get Firebase Admin app instance
 */
export function getFirebaseApp() {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseApp;
}
/**
 * Get Firestore instance
 */
export function getFirestore() {
    return getFirebaseApp().firestore();
}
/**
 * Get Firebase Auth instance
 */
export function getAuth() {
    return getFirebaseApp().auth();
}
/**
 * Close Firebase connection
 */
export async function closeFirebase() {
    if (firebaseApp) {
        await firebaseApp.delete();
        firebaseApp = null;
        logger.info('Firebase connection closed');
    }
}
//# sourceMappingURL=firebase.js.map