import admin from 'firebase-admin';
/**
 * Initialize Firebase Admin SDK
 */
export declare function initializeFirebase(): admin.app.App;
/**
 * Get Firebase Admin app instance
 */
export declare function getFirebaseApp(): admin.app.App;
/**
 * Get Firestore instance
 */
export declare function getFirestore(): admin.firestore.Firestore;
/**
 * Get Firebase Auth instance
 */
export declare function getAuth(): admin.auth.Auth;
/**
 * Close Firebase connection
 */
export declare function closeFirebase(): Promise<void>;
//# sourceMappingURL=firebase.d.ts.map