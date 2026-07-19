import Bottleneck from "bottleneck";
import { prisma } from "../../config/prisma";
import { randomUUID } from "crypto";

export const syncLimiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 1000 // 1 req per sec per queue to avoid rate limits
});

export async function createSyncRun(connectorName: string) {
  const connector = await prisma.connector.upsert({
    where: { name: connectorName },
    update: {},
    create: { name: connectorName, version: "1.0", isActive: true }
  });

  return await prisma.syncRun.create({
    data: {
      connectorId: connector.id,
      status: "STARTED"
    }
  });
}

export async function createSyncJob(syncRunId: string, entityType: string, entityId?: string) {
  return await prisma.syncJob.create({
    data: {
      syncRunId,
      entityType,
      entityId,
      status: "PENDING"
    }
  });
}

export async function logSync(syncJobId: string, level: string, message: string) {
  await prisma.syncLog.create({
    data: { syncJobId, level, message }
  });
  console.log(`[${level}] Job ${syncJobId}: ${message}`);
}
