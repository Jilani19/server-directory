import { PrismaClient } from "@prisma/client";
import { ClinicalTrialsConnector } from "./connectors/clinical-trials";
import { CompanyEnrichmentConnector } from "./connectors/company-enrichment";
import { OpenFDAConnector } from "./connectors/openfda";
import crypto from "crypto";

const prisma = new PrismaClient();

async function run() {
  console.log("Creating test user and company to anchor the data...");
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      passwordHash: "hash",
      role: {
        create: {
          name: `Role-${Date.now()}`
        }
      }
    }
  });

  const company = await prisma.company.create({
    data: {
      name: "Pfizer",
      slug: `pfizer-${Date.now()}`,
      userId: user.id
    }
  });

  console.log("Running Clinical Trials Connector...");
  const ctConnector = new ClinicalTrialsConnector();
  await ctConnector.execute(company.id);

  console.log("Running Company Enrichment Connector...");
  const enrichConnector = new CompanyEnrichmentConnector();
  await enrichConnector.execute(company.id);

  console.log("Running OpenFDA Connector...");
  const fdaConnector = new OpenFDAConnector();
  await fdaConnector.execute(company.id);

  // SyncRun, SyncJob, Connector, ConnectorLog, RetryQueue for completeness
  const syncRunId = crypto.randomUUID();
  const connector = await prisma.connector.create({
    data: { name: `MainSync-${Date.now()}`, version: "1.0", status: "COMPLETED" }
  });

  await prisma.connectorLog.create({
    data: {
      connectorId: connector.id,
      level: "INFO",
      message: "Sync completed successfully"
    }
  });

  await prisma.syncRun.create({
    data: {
      id: syncRunId,
      connectorId: connector.id,
      status: "SUCCESS",
      syncStatus: "SUCCESS",
      completedAt: new Date()
    }
  });

  await prisma.auditTrail.create({
    data: {
      userId: user.id,
      action: "FULL_SYNC",
      entityType: "Company",
      entityId: company.id,
      details: "Completed massive data synchronization"
    }
  });

  console.log("All data populated successfully.");
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
