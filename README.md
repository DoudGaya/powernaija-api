# Backend - Energy Token Management Platform

Next.js 15 backend with API endpoints and admin dashboard.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with Nigerian companies
npx prisma db seed

# Start development server
npm run dev
```

Access the app at http://localhost:3000

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts             # Seed data
│   └── migrations/         # Migration history
├── src/
│   ├── app/                # Next.js app router
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages
│   │   └── (dashboard)/   # Admin dashboard
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
└── public/               # Static files
```

## 🔑 Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `FIREBASE_PROJECT_ID` - Firebase Admin SDK
- `OPENAI_API_KEY` - For AI chatbot
- `PAYSTACK_SECRET_KEY` - Payment integration

## 📊 Database Commands

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Create new migration
npx prisma migrate dev --name your_migration

# Reset database (DANGER!)
npm run db:reset

# Generate Prisma Client
npm run db:generate
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t alf-app-backend .

# Run container
docker run -p 3000:3000 alf-app-backend
```

## 📝 API Documentation

See [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md) for full API reference.

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Core Endpoints

- `GET /api/companies` - List energy companies
- `POST /api/tokens/purchase` - Purchase tokens
- `POST /api/usage/track` - Log usage
- `GET /api/carbon-credits` - Get carbon credits
- `POST /api/chat` - AI chatbot

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Testing**: Jest

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
# powernaija-api
