import dotenv from 'dotenv';
dotenv.config();

function sanitizeEnv(val?: string): string {
  if (!val) return '';
  let str = val.trim();
  str = str.replace(/^[A-Z0-9_]+\s*=\s*/, '');
  str = str.replace(/^['"]|['"]$/g, '').trim();
  return str;
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeEnv(process.env.DATABASE_URL);
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = sanitizeEnv(process.env.DIRECT_URL);
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: 3000,
  DATABASE_URL: sanitizeEnv(process.env.DATABASE_URL),
  DIRECT_URL: sanitizeEnv(process.env.DIRECT_URL),
  JWT_SECRET: process.env.JWT_SECRET || 'yadman-super-secure-production-jwt-secret-2026',
  JWT_EXPIRES_IN: '7d',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  UPLOAD_DIR: 'uploads',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'zarinpal',
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000',
  PAYMENT_SANDBOX: process.env.PAYMENT_SANDBOX !== 'false',
  PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/api/orders/payment/callback',
};

export const config = {
  nodeEnv: ENV.NODE_ENV,
  port: ENV.PORT,
  databaseUrl: ENV.DATABASE_URL,
  directUrl: ENV.DIRECT_URL,
  jwtSecret: ENV.JWT_SECRET,
  jwtExpiresIn: ENV.JWT_EXPIRES_IN,
  storageProvider: ENV.STORAGE_PROVIDER,
  uploadDir: ENV.UPLOAD_DIR,
  appUrl: ENV.APP_URL,
  corsOrigin: ENV.CORS_ORIGIN,
  paymentProvider: ENV.PAYMENT_PROVIDER,
  zarinpalMerchantId: ENV.ZARINPAL_MERCHANT_ID,
  paymentSandbox: ENV.PAYMENT_SANDBOX,
  paymentCallbackUrl: ENV.PAYMENT_CALLBACK_URL,
};
