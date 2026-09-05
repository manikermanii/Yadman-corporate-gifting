import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;
let isConnected = false;

export function getPrisma(): PrismaClient {
  if (globalThis.prismaGlobal) {
    return globalThis.prismaGlobal;
  }
  if (!prismaInstance) {
    const dbUrl = config.databaseUrl;
    prismaInstance = new PrismaClient({
      datasourceUrl: dbUrl || undefined,
      log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
    });
    if (config.nodeEnv !== 'production') {
      globalThis.prismaGlobal = prismaInstance;
    }
  }
  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!config.databaseUrl) {
    console.warn('⚠️  [Database] DATABASE_URL is not set. Running in resilient memory-store mode.');
    return false;
  }
  try {
    const p = getPrisma();
    await p.$queryRaw`SELECT 1`;
    isConnected = true;
    console.log('✅ [Database] Successfully connected to PostgreSQL via Prisma.');
    return true;
  } catch (error: any) {
    console.warn('⚠️  [Database] Could not connect to PostgreSQL:', error.message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export const prisma = getPrisma();
