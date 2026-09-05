import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[API Error]', err);

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'اطلاعات ارسالی نامعتبر است';
    return sendError(res, 'VALIDATION_ERROR', message, 400, err.issues);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'خطای غیرمنتظره در سرور رخ داد. لطفاً مجدداً تلاش کنید.';

  return sendError(res, code, message, statusCode);
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 'NOT_FOUND', `مسیر درخواستی یافت نشد: ${req.method} ${req.originalUrl}`, 404);
}
