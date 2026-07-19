"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const ResponseWrapper_1 = require("../utils/ResponseWrapper");
const logger_1 = require("../utils/logger");
const constants_1 = require("../utils/constants");
function errorHandler(err, req, res, next) {
    logger_1.logger.error({ stack: err.stack, url: req.url }, `[errorHandler] ${err.message}`);
    if (err instanceof zod_1.ZodError) {
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json(ResponseWrapper_1.ResponseWrapper.error(constants_1.ERROR_CODES.VALIDATION_ERROR, "Validation failed", { issues: err.issues }));
        return;
    }
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json(ResponseWrapper_1.ResponseWrapper.error(err.errorCode, err.message));
        return;
    }
    // Fallback 500
    res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json(ResponseWrapper_1.ResponseWrapper.error(constants_1.ERROR_CODES.INTERNAL_SERVER_ERROR, "Internal server error"));
}
