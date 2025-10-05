// Shared TypeScript types for the application

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  COMPANY_REP = 'COMPANY_REP',
}

export enum TokenType {
  RENEWABLE = 'RENEWABLE',
  NON_RENEWABLE = 'NON_RENEWABLE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  USAGE = 'USAGE',
  CARBON_CREDIT_SALE = 'CARBON_CREDIT_SALE',
  REFUND = 'REFUND',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  supportEmail?: string;
  supportPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  companyId: string;
  type: TokenType;
  pricePerUnit: number;
  isAvailable: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  cashBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  companyId?: string;
  tokenId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  quantity?: number;
  reference: string;
  paymentMethod?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLog {
  id: string;
  userId: string;
  tokenId: string;
  amount: number;
  timestamp: Date;
  metadata?: any;
  createdAt: Date;
}

export interface CarbonCredit {
  id: string;
  userId: string;
  amount: number;
  source: string;
  renewableKwh: number;
  isSold: boolean;
  soldAt?: Date;
  soldPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  language: string;
  isActive: boolean;
  ticketCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  translated: boolean;
  translatedFrom?: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Extended types with relations
export interface UserWithWallet extends User {
  wallet: Wallet | null;
}

export interface TokenWithCompany extends Token {
  company: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

// Auth types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Token purchase types
export interface TokenPurchaseData {
  tokenId: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
}
