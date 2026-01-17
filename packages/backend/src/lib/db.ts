// packages/backend/src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// This ensures we don't create too many connections during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Logs SQL queries to terminal (helpful for debugging)
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;