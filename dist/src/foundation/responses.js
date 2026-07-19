"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, details) => {
    const response = {
        success: false,
        error: message,
        details,
        meta: {
            timestamp: new Date().toISOString(),
        },
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
