import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// @ts-ignore
const globalForPrisma = (globalThis as any) as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ log: ['error'] });

// @ts-ignore
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
