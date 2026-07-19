"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe('Directory API Endpoints', () => {
    it('GET /api/v1/companies - should return companies with pagination', async () => {
        const start = Date.now();
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/companies?limit=5');
        const executionTime = Date.now() - start;
        console.log(`GET /api/v1/companies - Status: ${res.status}, Time: ${executionTime}ms`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('GET /api/v1/companies/stats - should return database statistics', async () => {
        const start = Date.now();
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/companies/stats');
        const executionTime = Date.now() - start;
        console.log(`GET /api/v1/companies/stats - Status: ${res.status}, Time: ${executionTime}ms`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(typeof res.body.data.totalCompanies).toBe('number');
    });
    it('GET /api/v1/companies/categories - should return unique categories', async () => {
        const start = Date.now();
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/companies/categories');
        const executionTime = Date.now() - start;
        console.log(`GET /api/v1/companies/categories - Status: ${res.status}, Time: ${executionTime}ms`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('GET /api/v1/companies/search - should perform search', async () => {
        const start = Date.now();
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/companies/search?search=test');
        const executionTime = Date.now() - start;
        console.log(`GET /api/v1/companies/search - Status: ${res.status}, Time: ${executionTime}ms`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
