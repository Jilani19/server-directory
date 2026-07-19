"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLimiter = void 0;
exports.createSyncRun = createSyncRun;
exports.createSyncJob = createSyncJob;
exports.logSync = logSync;
const bottleneck_1 = __importDefault(require("bottleneck"));
const prisma_1 = require("../../config/prisma");
exports.syncLimiter = new bottleneck_1.default({
    maxConcurrent: 5,
    minTime: 1000 // 1 req per sec per queue to avoid rate limits
});
async function createSyncRun(connectorName) {
    const connector = await prisma_1.prisma.connector.upsert({
        where: { name: connectorName },
        update: {},
        create: { name: connectorName, version: "1.0", isActive: true }
    });
    return await prisma_1.prisma.syncRun.create({
        data: {
            connectorId: connector.id,
            status: "STARTED"
        }
    });
}
async function createSyncJob(syncRunId, entityType, entityId) {
    return await prisma_1.prisma.syncJob.create({
        data: {
            syncRunId,
            entityType,
            entityId,
            status: "PENDING"
        }
    });
}
async function logSync(syncJobId, level, message) {
    await prisma_1.prisma.syncLog.create({
        data: { syncJobId, level, message }
    });
    console.log(`[${level}] Job ${syncJobId}: ${message}`);
}
