"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
// @ts-ignore
const globalForPrisma = globalThis;
let overrideUrl = undefined;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    const dbPath = path_1.default.join(process.cwd(), "prisma", "dev.db");
    console.log("Absolute SQLite Path:", dbPath);
    overrideUrl = `file:${dbPath}`;
}
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({
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
    globalForPrisma.prisma = exports.prisma;
}
