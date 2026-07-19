import { prisma } from "../../config/prisma";
import { createSyncRun, createSyncJob, logSync } from "../engine/queue";

export interface ConnectorResponse {
  success: boolean;
  message?: string;
  payload?: any;
}

export abstract class BaseConnector {
  abstract name: string;
  abstract version: string;

  protected async saveStagingPayload(source: string, endpoint: string, payload: any, checksum: string) {
    return await prisma.stagingPayload.create({
      data: {
        source,
        endpoint,
        payload: JSON.stringify(payload),
        checksum,
        processed: false
      }
    });
  }

  protected async markJobComplete(jobId: string, status: "SUCCESS" | "ERROR") {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: { status, completedAt: new Date() }
    });
  }

  abstract execute(entityId?: string): Promise<ConnectorResponse>;
}
