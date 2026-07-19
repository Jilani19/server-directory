export class BaseError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ApiError extends BaseError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, true);
  }
}

export class ValidationError extends BaseError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400, true);
    this.details = details;
  }
}

export class ConnectorError extends BaseError {
  public source: string;
  constructor(message: string, source: string, statusCode: number = 502) {
    super(message, statusCode, true);
    this.source = source;
  }
}
