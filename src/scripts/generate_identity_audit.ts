import * as fs from "fs";
import * as path from "path";
import { AuditRecord } from "../sync/engine/identity-resolver";

async function generateAuditReport() {
  const auditLogPath = path.join(__dirname, "../../logs/identity_audit.json");
  const reportPath = path.join(__dirname, "../../../IDENTITY_AUDIT_REPORT.md");

  let logs: AuditRecord[] = [];
  if (fs.existsSync(auditLogPath)) {
    logs = JSON.parse(fs.readFileSync(auditLogPath, "utf-8"));
  }

  let md = `# 🛡️ IDENTITY AUDIT REPORT\n\n`;
  md += `*Generated: ${new Date().toISOString()}*\n\n`;
  md += `This report details the identity resolution confidence scores and any rejected updates across all synchronization connectors to ensure strictly enforced data integrity.\n\n`;

  md += `## Summary Statistics\n`;
  md += `- **Total Sync Attempts**: ${logs.length}\n`;
  md += `- **Successful Matches**: ${logs.filter(l => !l.rejected).length}\n`;
  md += `- **Rejected Mismatches**: ${logs.filter(l => l.rejected).length}\n\n`;

  // Group by Company
  const byCompany = logs.reduce((acc, log) => {
    if (!acc[log.companyName]) acc[log.companyName] = [];
    acc[log.companyName].push(log);
    return acc;
  }, {} as Record<string, AuditRecord[]>);

  md += `## Detailed Audit By Company\n\n`;

  for (const [companyName, companyLogs] of Object.entries(byCompany)) {
    md += `### ${companyName}\n`;
    const anyRejected = companyLogs.some(l => l.rejected);
    md += `**Status**: ${anyRejected ? "⚠️ Contains Rejected Mismatches" : "✅ All Sources Matched"}\n\n`;

    md += `| Source | Official Website | Ticker | Country | Confidence | Outcome | Mismatch Reason |\n`;
    md += `|--------|-----------------|--------|---------|------------|---------|-----------------|\n`;
    
    for (const log of companyLogs) {
      const outcome = log.rejected ? "❌ Rejected" : "✅ Accepted";
      const reason = log.mismatchReason || "-";
      md += `| ${log.source} | ${log.officialWebsite} | ${log.ticker} | ${log.country} | ${log.confidence}% | ${outcome} | ${reason} |\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(reportPath, md);
  console.log(`Identity Audit Report generated at: ${reportPath}`);
}

generateAuditReport().catch(console.error);
