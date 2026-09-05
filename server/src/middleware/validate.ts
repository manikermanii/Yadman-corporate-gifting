import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || [];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: issues.map((e: any) => e.message).join('، '),
            details: issues,
          },
        });
        return;
      }
      next(err);
    }
  };
}
