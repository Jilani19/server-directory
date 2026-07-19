"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorError = exports.ValidationError = exports.ApiError = exports.BaseError = void 0;
class BaseError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
class ApiError extends BaseError {
    constructor(message, statusCode = 500) {
        super(message, statusCode, true);
    }
}
exports.ApiError = ApiError;
class ValidationError extends BaseError {
    details;
    constructor(message, details) {
        super(message, 400, true);
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class ConnectorError extends BaseError {
    source;
    constructor(message, source, statusCode = 502) {
        super(message, statusCode, true);
        this.source = source;
    }
}
exports.ConnectorError = ConnectorError;
