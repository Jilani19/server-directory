"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const response_1 = require("../utils/response");
const requireAuth = (req, res, next) => { const token = req.headers.authorization?.split(" ")[1]; if (!token) {
    return (0, response_1.sendError)(res, "Authentication required", [], 401);
} next(); };
exports.requireAuth = requireAuth;
