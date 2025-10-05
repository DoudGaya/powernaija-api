// Shared constants for backend

export const APP_NAME = 'Energy Token Management';
export const APP_VERSION = '1.0.0';

// Nigerian Energy Companies with detailed info
export const NIGERIAN_COMPANIES = [
  {
    name: 'Ikeja Electric',
    slug: 'ikeja-electric',
    description: 'Serving Lagos State residents',
  },
  {
    name: 'Eko Electricity Distribution Company (EKEDC)',
    slug: 'eko-electricity',
    description: 'Serving parts of Lagos',
  },
  {
    name: 'Abuja Electricity Distribution Company (AEDC)',
    slug: 'abuja-electricity',
    description: 'Serving FCT and surrounding areas',
  },
  {
    name: 'Kano Electricity Distribution Company (KEDCO)',
    slug: 'kano-electricity',
    description: 'Serving Kano and Katsina states',
  },
  {
    name: 'Port Harcourt Electricity Distribution Company (PHED)',
    slug: 'port-harcourt-electric',
    description: 'Serving Rivers, Bayelsa, Cross River, Akwa Ibom states',
  },
  {
    name: 'Enugu Electricity Distribution Company (EEDC)',
    slug: 'enugu-electricity',
    description: 'Serving Enugu, Anambra, Ebonyi, Abia, Imo states',
  },
  {
    name: 'Jos Electricity Distribution Company (JED)',
    slug: 'jos-electricity',
    description: 'Serving Plateau, Bauchi, Gombe, Benue states',
  },
  {
    name: 'Kaduna Electric',
    slug: 'kaduna-electric',
    description: 'Serving Kaduna, Kebbi, Sokoto, Zamfara states',
  },
  {
    name: 'Benin Electricity Distribution Company (BEDC)',
    slug: 'benin-electricity',
    description: 'Serving Edo, Delta, Ondo, Ekiti states',
  },
  {
    name: 'Ibadan Electricity Distribution Company (IBEDC)',
    slug: 'ibadan-electricity',
    description: 'Serving Oyo, Ogun, Osun, Kwara states',
  },
  {
    name: 'Lumos Nigeria',
    slug: 'lumos',
    description: 'Solar renewable energy provider',
  },
  {
    name: 'Arnergy Solar',
    slug: 'arnergy',
    description: 'Solar renewable energy provider',
  },
] as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  ha: 'Hausa',
  ig: 'Igbo',
  yo: 'Yoruba',
  pidgin: 'Nigerian Pidgin',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Carbon credit constants
export const CARBON_CREDIT_RATIO = 10; // 1 credit per 10 kWh of renewable energy
export const CARBON_CREDIT_PRICE = 750; // ₦750 per carbon credit
export const CO2_REDUCTION_PER_KWH = 0.5; // 0.5 kg CO2 per kWh (Nigerian grid intensity)

// Token Prices (default)
export const DEFAULT_TOKEN_PRICES = {
  NON_RENEWABLE: 85, // ₦85 per kWh
  RENEWABLE: 95, // ₦95 per kWh
} as const;

// Usage Limits (defaults in kWh)
export const DEFAULT_USAGE_LIMITS = {
  DAILY: 20,
  WEEKLY: 120,
  MONTHLY: 450,
  ALERT_THRESHOLD: 0.8, // 80%
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API Response Codes
export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// JWT Token Expiry
export const JWT_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  PAYMENT: { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
} as const;

// Validation Patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?234[0-9]{10}$/, // Nigerian phone format
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  USAGE_ALERT: 'usage_alert',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  CARBON_CREDIT_EARNED: 'carbon_credit_earned',
  LOW_BALANCE: 'low_balance',
  SYSTEM_UPDATE: 'system_update',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
