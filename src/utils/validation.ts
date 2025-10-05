import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+234[0-9]{10}$/, 'Invalid Nigerian phone number format').optional(),
  language: z.enum(['en', 'ha', 'ig', 'yo', 'pidgin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const firebaseSyncSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  idToken: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Token purchase schema
export const tokenPurchaseSchema = z.object({
  tokenId: z.string().cuid('Invalid token ID'),
  quantity: z.number().positive('Quantity must be positive'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['paystack', 'stripe', 'card', 'bank']),
});

// Usage tracking schema
export const usageTrackSchema = z.object({
  tokenId: z.string().cuid('Invalid token ID'),
  amount: z.number().positive('Amount must be positive'),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// Usage limits schema
export const usageLimitsSchema = z.object({
  dailyLimit: z.number().positive().optional(),
  weeklyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
  alertThreshold: z.number().min(0).max(1).optional(),
});

// Carbon credits monetize schema
export const carbonMonetizeSchema = z.object({
  creditIds: z.array(z.string().cuid()),
  action: z.enum(['sell_to_cash', 'convert_to_tokens']),
  amount: z.number().positive(),
});

// Chat message schema
export const chatMessageSchema = z.object({
  sessionId: z.string().cuid().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  language: z.enum(['en', 'ha', 'ig', 'yo', 'pidgin']).optional(),
});

// Company create/update schema
export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  isActive: z.boolean().optional(),
  supportEmail: z.string().email('Invalid email').optional(),
  supportPhone: z.string().optional(),
});

// Token create/update schema
export const tokenSchema = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  type: z.enum(['RENEWABLE', 'NON_RENEWABLE']),
  pricePerUnit: z.number().positive('Price must be positive'),
  isAvailable: z.boolean().optional(),
  description: z.string().optional(),
});

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().regex(/^\+234[0-9]{10}$/).optional(),
  language: z.enum(['en', 'ha', 'ig', 'yo', 'pidgin']).optional(),
  profileImage: z.string().url().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Query params schema
export const queryParamsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  ...paginationSchema.shape,
});
