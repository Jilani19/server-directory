"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => { logger_1.logger.error(err.message, err.stack); const statusCode = err.statusCode || 500; const message = err.message || "Internal Server Error"; (0, response_1.sendError)(res, message, [], statusCode); };
exports.errorHandler = errorHandler;
