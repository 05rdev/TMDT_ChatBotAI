import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const errorMessage = err.errors.map(e => e.message).join(', ');
    res.status(400).json({
      success: false,
      message: errorMessage,
      errors: err.errors
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
