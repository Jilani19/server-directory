import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import path from "path";

// @ts-ignore
const globalForPrisma = (globalThis as any) as { prisma: PrismaClient };

let overrideUrl: string | undefined = undefined;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  console.log("Absolute SQLite Path:", dbPath);
  overrideUrl = `file:${dbPath}`;
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  log: ['error'],
  ...(overrideUrl && {
    datasources: {
      db: {
        url: overrideUrl
      }
    }
  })
});
// @ts-ignore
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
