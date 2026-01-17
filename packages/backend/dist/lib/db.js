"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// packages/backend/src/lib/db.ts
const client_1 = require("@prisma/client");
// This ensures we don't create too many connections during development
const globalForPrisma = global;
exports.db = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: ['query'], // Logs SQL queries to terminal (helpful for debugging)
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.db;
