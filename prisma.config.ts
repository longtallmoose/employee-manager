// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// Manually load .env from the root directory
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  schema: 'packages/database/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});