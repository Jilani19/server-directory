"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const CompanyRepository_1 = require("./CompanyRepository");
const CompanyService_1 = require("./CompanyService");
const CompanyController_1 = require("./CompanyController");
const profile_routes_1 = __importDefault(require("../../routes/profile.routes"));
exports.companyRoutes = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const repository = new CompanyRepository_1.CompanyRepository(prisma);
const service = new CompanyService_1.CompanyService(repository);
const controller = new CompanyController_1.CompanyController(service);
exports.companyRoutes.get('/', controller.getCompanies);
exports.companyRoutes.get('/stats', controller.getStats);
exports.companyRoutes.get('/categories', controller.getCategories);
exports.companyRoutes.get('/search', controller.getCompanies);
// Mount the granular profile endpoints
exports.companyRoutes.use('/', profile_routes_1.default);
// Fallback for getting the entire company object (legacy)
exports.companyRoutes.get('/:slug', controller.getCompanyBySlug);
