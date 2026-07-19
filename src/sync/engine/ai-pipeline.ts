import { prisma } from "../../config/prisma";
import crypto from "crypto";

export async function processAiChunking(entityType: string, entityId: string, text: string) {
  if (!text || text.length < 50) return; // Skip trivial text

  // 1. Create AI Summary
  const summaryId = crypto.randomUUID();
  await prisma.aISummary.create({
    data: {
      id: summaryId,
      entityType,
      entityId,
      summary: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
      model: "gpt-4-turbo"
    }
  });

  // 2. Chunking logic (Naive 500 chars chunks for MVP)
  const chunks = [];
  for (let i = 0; i < text.length; i += 500) {
    chunks.push(text.substring(i, i + 500));
  }

  // 3. Store Chunks and Queue Embeddings
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunkContent = chunks[idx];
    const chunkId = crypto.randomUUID();
    
    await prisma.chunk.create({
      data: {
        id: chunkId,
        entityType,
        entityId,
        content: chunkContent,
        chunkIndex: idx
      }
    });

    await prisma.embeddingQueue.create({
      data: {
        id: crypto.randomUUID(),
        entityType,
        entityId,
        status: "PENDING"
      }
    });
  }

  // 4. Create Knowledge Node
  const nodeId = crypto.randomUUID();
  await prisma.knowledgeNode.create({
    data: {
      id: nodeId,
      entityType,
      entityId,
      label: `Node for ${entityType} ${entityId}`
    }
  });
}
