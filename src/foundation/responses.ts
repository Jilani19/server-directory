import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200, meta?: any) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode: number = 500, details?: any) => {
  const response: ApiResponse<null> = {
    success: false,
    error: message,
    details,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
};
