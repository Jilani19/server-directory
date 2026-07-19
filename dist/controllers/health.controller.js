"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getHealth = (0, asyncHandler_1.asyncHandler)(async (req, res) => { res.status(200).json({ success: true, message: "Server is running", timestamp: new Date().toISOString(), version: "1.0.0" }); });
