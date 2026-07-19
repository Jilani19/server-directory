"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const HealthRoutes_1 = require("../src/domains/health/HealthRoutes");
const errorHandler_1 = require("../src/middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/v1/health', HealthRoutes_1.healthRoutes);
app.use(errorHandler_1.errorHandler);
describe('Health Diagnostic Endpoints', () => {
    it('GET /api/v1/health/liveness should return UP', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/v1/health/liveness');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('UP');
        expect(res.body.meta.timestamp).toBeDefined();
    });
    it('GET /api/v1/health/readiness should return READY', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/v1/health/readiness');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('READY');
    });
    it('GET /api/v1/health/version should return 1.0.0', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/v1/health/version');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.version).toBe('1.0.0');
    });
});
