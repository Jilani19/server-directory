"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseWrapper = void 0;
class ResponseWrapper {
    static success(data, meta) {
        return {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta
            }
        };
    }
    static error(errorCode, message, meta) {
        return {
            success: false,
            error: {
                code: errorCode,
                message
            },
            meta: {
                timestamp: new Date().toISOString(),
                ...meta
            }
        };
    }
}
exports.ResponseWrapper = ResponseWrapper;
