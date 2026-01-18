import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

// 1. Create a standard Postgres Pool
const pool = new Pool({ connectionString });

// 2. Create the Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to PrismaClient (This satisfies the new strict requirement)
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;