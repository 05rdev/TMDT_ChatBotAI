import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log lỗi để debug
  if (statusCode === 500) {
    console.error('💥 ERROR:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
