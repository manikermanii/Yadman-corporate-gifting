import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export interface JwtUserPayload {
  userId: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPERADMIN' | string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  fullName?: string;
  name?: string;
}

export type AuthenticatedRequest = Request & {
  user: JwtUserPayload;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export function generateToken(payload: JwtUserPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn } as any);
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtUserPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // 2. Check cookies
  if (req.cookies && req.cookies.yadman_auth_token) {
    return req.cookies.yadman_auth_token;
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'لطفاً ابتدا وارد حساب کاربری خود شوید.', 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    return sendError(res, 'INVALID_TOKEN', 'نشست کاربری شما منقضی شده است. لطفاً مجدداً وارد شوید.', 401);
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'دسترسی به این بخش نیاز به ورود به پنل مدیریت دارد.', 401);
  }

  const payload = verifyToken(token);
  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN' && payload.role !== 'SUPER_ADMIN')) {
    return sendError(res, 'FORBIDDEN', 'شما دسترسی لازم برای مشاهده این بخش را ندارید.', 403);
  }

  req.user = payload;
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
