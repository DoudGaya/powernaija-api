import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: { userId: string; email: string; role: string }): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: { userId: string }): string {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    return decoded;
  } catch (error) {
    logger.error('Access token verification failed:', error);
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Generate random token (for email verification, password reset, etc.)
 */
export function generateRandomToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
}

/**
 * Encrypt sensitive data (e.g., payment info)
 */
export function encryptData(data: string): string {
  // Simple base64 encoding for demo - use proper encryption in production
  return Buffer.from(data).toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  // Simple base64 decoding for demo - use proper decryption in production
  return Buffer.from(encryptedData, 'base64').toString('utf-8');
}
