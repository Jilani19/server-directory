"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message = "", data = {}, statusCode = 200) => { res.status(statusCode).json({ success: true, message, data }); };
exports.sendSuccess = sendSuccess;
const sendError = (res, message = "", errors = [], statusCode = 500) => { res.status(statusCode).json({ success: false, message, errors }); };
exports.sendError = sendError;
