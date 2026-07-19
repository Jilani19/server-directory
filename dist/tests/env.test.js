"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
describe('Environment Validation', () => {
    const envSchema = zod_1.z.object({
        NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
        PORT: zod_1.z.string().default('5000'),
        DATABASE_URL: zod_1.z.string().min(1),
        LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
    });
    it('should pass with valid environment', () => {
        const validEnv = {
            NODE_ENV: 'test',
            PORT: '3000',
            DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
            LOG_LEVEL: 'debug'
        };
        const result = envSchema.safeParse(validEnv);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.PORT).toBe('3000');
        }
    });
    it('should fail when DATABASE_URL is missing', () => {
        const invalidEnv = {
            NODE_ENV: 'test',
            PORT: '3000'
        };
        const result = envSchema.safeParse(invalidEnv);
        expect(result.success).toBe(false);
    });
});
