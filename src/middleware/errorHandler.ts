import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { ResponseWrapper } from '../utils/ResponseWrapper';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({ stack: err.stack, url: req.url }, `[errorHandler] ${err.message}`);

  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json(
      ResponseWrapper.error(ERROR_CODES.VALIDATION_ERROR, "Validation failed", { issues: err.issues })
    );
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ResponseWrapper.error(err.errorCode, err.message)
    );
    return;
  }

  // Fallback 500
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    ResponseWrapper.error(ERROR_CODES.INTERNAL_SERVER_ERROR, "Internal server error")
  );
}
