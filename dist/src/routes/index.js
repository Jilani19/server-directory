"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_route_1 = __importDefault(require("./health.route"));
const CompanyRoutes_1 = require("../domains/company/CompanyRoutes");
const router = (0, express_1.Router)();
router.use("/health", health_route_1.default);
router.use("/companies", CompanyRoutes_1.companyRoutes);
exports.default = router;
