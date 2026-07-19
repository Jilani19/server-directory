import { prisma } from "../../config/prisma";
import crypto from "crypto";

export async function validateAndHistory(
  entityType: string,
  entityId: string,
  syncJobId: string,
  oldData: any,
  newData: any,
  sourceId: string
) {
  let confidenceScore = 1.0;
  const issues = [];
  
  // 1. Missing field detection
  for (const [key, value] of Object.entries(newData)) {
    if (value === null || value === undefined || value === "") {
      issues.push(`Missing field: ${key}`);
      confidenceScore -= 0.05;
    }
  }

  // 2. Conflict detection (if oldData exists)
  if (oldData) {
    for (const [key, newValue] of Object.entries(newData)) {
      if (oldData[key] !== undefined && oldData[key] !== newValue) {
        // Record Entity History for the change
        const changeId = crypto.randomUUID();
        await prisma.entityHistory.create({
          data: {
            id: changeId,
            entityType,
            entityId,
            fieldName: key,
            oldValue: JSON.stringify(oldData[key]),
            newValue: JSON.stringify(newValue),
            changedAt: new Date()
          }
        });
      }
    }
  }

  // Guarantee minimum score bounds
  confidenceScore = Math.max(0.0, Math.min(1.0, confidenceScore));

  // Write Validation History
  await prisma.validationHistory.create({
    data: {
      entityType,
      entityId,
      status: issues.length > 0 ? "WARNING" : "PASSED",
      message: issues.join(", ") || "No validation issues found"
    }
  });

  // Write Data Confidence
  await prisma.dataConfidence.create({
    data: {
      entityType,
      entityId,
      score: confidenceScore,
      reasons: issues.join(", ") || "No validation issues found"
    }
  });

  return confidenceScore;
}
