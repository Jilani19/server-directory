"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const response_1 = require("../utils/response");
const notFoundHandler = (req, res, next) => { (0, response_1.sendError)(res, `Route ${req.originalUrl} not found`, [], 404); };
exports.notFoundHandler = notFoundHandler;
