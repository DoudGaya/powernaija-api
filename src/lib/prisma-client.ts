import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

const prisma = global.prisma ?? prismaClientSingleton();

// Log Prisma queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

// Log Prisma errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error:', e);
});

// Log Prisma info
prisma.$on('info' as never, (e: any) => {
  logger.info('Prisma Info:', e);
});

// Log Prisma warnings
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning:', e);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
