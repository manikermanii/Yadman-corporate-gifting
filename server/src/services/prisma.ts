import { PrismaClient } from '@prisma/client';
import { ENV } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const dbUrl = ENV.DATABASE_URL;

export const prisma =
  globalThis.prismaGlobal ||
  new PrismaClient({
    datasourceUrl: dbUrl || undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
