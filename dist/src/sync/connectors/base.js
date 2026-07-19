"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnector = void 0;
const prisma_1 = require("../../config/prisma");
class BaseConnector {
    async saveStagingPayload(source, endpoint, payload, checksum) {
        return await prisma_1.prisma.stagingPayload.create({
            data: {
                source,
                endpoint,
                payload: JSON.stringify(payload),
                checksum,
                processed: false
            }
        });
    }
    async markJobComplete(jobId, status) {
        await prisma_1.prisma.syncJob.update({
            where: { id: jobId },
            data: { status, completedAt: new Date() }
        });
    }
}
exports.BaseConnector = BaseConnector;
