import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('[ERROR]', err);

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Postgres unique violation
  const pgErr = err as Record<string, unknown>;
  if (pgErr.code === '23505') {
    res.status(409).json({
      ok: false,
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
      },
    });
    return;
  }

  // Postgres foreign key violation
  if (pgErr.code === '23503') {
    res.status(400).json({
      ok: false,
      error: {
        message: 'Referenced resource not found',
        code: 'FOREIGN_KEY_VIOLATION',
      },
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    ok: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    ok: false,
    error: {
      message: `Route ${req.method} ${req.url} not found`,
      code: 'NOT_FOUND',
    },
  });
};
