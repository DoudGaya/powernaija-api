# Backend API Documentation

## Overview
This is the Next.js 15 backend for the Nigerian Energy Token Management Platform. It provides a comprehensive REST API for managing energy tokens, usage tracking, carbon credits, and AI-powered chatbot support.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Firebase Admin SDK
- **Caching**: Redis
- **AI**: OpenAI GPT-3.5-turbo
- **Payments**: Paystack (Stripe ready)
- **Validation**: Zod
- **Logging**: Winston

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema (11 models)
├── src/
│   ├── app/api/              # Next.js API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── companies/        # Company management
│   │   ├── tokens/           # Token operations
│   │   ├── usage/            # Usage tracking
│   │   ├── carbon-credits/   # Carbon credit monetization
│   │   ├── chat/             # AI chatbot
│   │   └── payments/         # Payment callbacks
│   ├── services/             # Business logic layer
│   │   ├── userService.ts
│   │   ├── tokenService.ts
│   │   ├── usageService.ts
│   │   ├── carbonService.ts
│   │   ├── paymentService.ts
│   │   ├── chatbotService.ts
│   │   └── companyService.ts
│   ├── middleware/           # Express-style middleware
│   │   ├── auth.ts           # JWT/Firebase authentication
│   │   ├── rateLimit.ts      # Rate limiting with Redis
│   │   └── errorHandler.ts   # Global error handling
│   ├── lib/                  # External integrations
│   │   ├── prisma.ts         # Prisma client
│   │   ├── firebase-admin.ts # Firebase Admin SDK
│   │   ├── redis.ts          # Redis client
│   │   └── openai.ts         # OpenAI integration
│   ├── utils/               # Utilities
│   │   ├── validation.ts    # Zod schemas
│   │   ├── encryption.ts    # Password hashing, JWT
│   │   └── logger.ts        # Winston logger
│   ├── shared/
│   │   └── constants.ts     # Shared constants
│   └── types/
│       └── index.ts         # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Companies
- `GET /api/companies` - List active companies (public) or all (admin)
- `POST /api/companies` - Create company (admin only)

### Tokens
- `GET /api/tokens` - List available tokens
- `POST /api/tokens` - Create token (admin only)
- `POST /api/tokens/purchase` - Purchase tokens (initiates payment)

### Usage Tracking
- `GET /api/usage` - Get usage statistics
- `POST /api/usage` - Log energy usage
- `GET /api/usage/limits` - Get usage limits
- `PUT /api/usage/limits` - Update usage limits

### Carbon Credits
- `GET /api/carbon-credits` - Get carbon credits and stats
- `POST /api/carbon-credits` - Monetize carbon credits

### Chat
- `POST /api/chat` - Send message to AI chatbot

### Payments
- `GET /api/payments/callback` - Paystack payment callback

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/energy_tokens"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Firebase Admin
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-..."

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYMENT_CALLBACK_URL="http://localhost:3000/api/payments/callback"

# App
NODE_ENV="development"
```

## Database Models

### Core Models
1. **User** - User accounts with roles (CUSTOMER, ADMIN, COMPANY_REP)
2. **Company** - Nigerian energy companies (12 providers)
3. **Token** - Energy tokens (RENEWABLE, NON_RENEWABLE)
4. **Wallet** - User wallet balances (kWh + cash)
5. **Transaction** - Purchase/usage/refund records
6. **UsageLog** - Energy consumption tracking
7. **UsageLimit** - Daily/weekly/monthly limits
8. **CarbonCredit** - Earned carbon credits
9. **ChatSession** - AI chatbot conversations
10. **ChatMessage** - Individual chat messages
11. **Notification** - User notifications

## Features

### Authentication
- JWT token-based authentication
- Firebase Admin SDK integration
- Refresh token support
- Role-based access control (CUSTOMER, ADMIN, COMPANY_REP)

### Token Management
- Multi-company support (12 Nigerian providers)
- Renewable and non-renewable token types
- Dynamic pricing per company
- Token purchase with Paystack integration

### Usage Tracking
- Real-time usage logging
- Daily/weekly/monthly statistics
- Customizable usage limits
- Automatic alert notifications at 80% threshold

### Carbon Credits
- Automatic credit generation (1 credit per 10 kWh renewable)
- CO2 reduction calculations (0.5 kg per kWh)
- Monetization options:
  - Sell to cash (₦750 per credit)
  - Convert to tokens

### AI Chatbot
- OpenAI GPT-3.5-turbo powered
- Multi-language support (English, Hausa, Igbo, Yoruba, Pidgin)
- Context-aware conversations
- Company-specific knowledge base

### Payments
- Paystack integration (primary)
- Stripe ready (placeholder)
- Webhook verification
- Automatic purchase completion

### Rate Limiting
- General API: 100 req/15min
- Auth endpoints: 5 req/15min
- Payment: 10 req/min
- Chat: 30 req/min

### Error Handling
- Zod validation with detailed error messages
- Prisma error handling (unique, foreign key, not found)
- Custom API errors with status codes
- Winston logging for debugging

## Getting Started

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Setup database**:
```bash
npx prisma generate
npx prisma db push
```

3. **Seed data** (optional):
```bash
npx prisma db seed
```

4. **Run development server**:
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm start`

## Security

- All passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Rate limiting to prevent abuse
- Input validation with Zod
- SQL injection protection via Prisma
- CORS configuration
- Environment variable protection

## Monitoring

- Winston logger with file rotation
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Exception handling: `logs/exceptions.log`

## Support

For issues or questions, contact the development team.

## License

Proprietary - All rights reserved
