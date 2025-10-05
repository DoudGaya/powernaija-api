import admin from 'firebase-admin';
import { logger } from '@/utils/logger';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const messaging = admin.messaging();

/**
 * Verify Firebase ID token
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification error:', error);
    throw new Error('Invalid Firebase token');
  }
}

/**
 * Get user by Firebase UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    logger.error('Get Firebase user error:', error);
    return null;
  }
}

/**
 * Send push notification
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const response = await messaging.send(message);
    logger.info(`Push notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    logger.error('Send push notification error:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendMulticastPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    logger.info(`Multicast notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
    return response;
  } catch (error) {
    logger.error('Send multicast notification error:', error);
    throw error;
  }
}

export default admin;
