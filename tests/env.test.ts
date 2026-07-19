import { z } from 'zod';

describe('Environment Validation', () => {
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().min(1),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
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
