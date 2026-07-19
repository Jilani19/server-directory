import { Company } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export class IdentityMismatchError extends Error {
  public confidence: number;
  constructor(message: string, confidence: number) {
    super(message);
    this.name = "IdentityMismatchError";
    this.confidence = confidence;
  }
}

export interface ExternalIdentity {
  website?: string;
  ticker?: string;
  lei?: string;
  name?: string;
  aliases?: string[];
  source: string;
}

export interface ResolutionResult {
  confidence: number;
  match: boolean;
  reasons: string[];
}

export interface AuditRecord {
  companyName: string;
  companyId: string;
  officialWebsite: string;
  ticker: string;
  country: string;
  source: string;
  confidence: number;
  rejected: boolean;
  timestamp: string;
  mismatchReason?: string;
}

export class IdentityResolver {
  private auditLogPath = path.join(__dirname, "../../../logs/identity_audit.json");
  private threshold = 95;

  constructor() {
    this.ensureLogDir();
  }

  private ensureLogDir() {
    const dir = path.dirname(this.auditLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private normalizeUrl(url?: string): string {
    if (!url) return "";
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      let hostname = parsed.hostname.toLowerCase();
      if (hostname.startsWith('www.')) hostname = hostname.substring(4);
      return hostname;
    } catch {
      return url.toLowerCase().replace('www.', '').trim();
    }
  }

  private normalizeString(str?: string): string {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  }

  public verify(company: Company, external: ExternalIdentity): ResolutionResult {
    let confidence = 0;
    const reasons: string[] = [];

    const compDomain = this.normalizeUrl(company.website || "");
    const extDomain = this.normalizeUrl(external.website || "");

    const compTicker = this.normalizeString(company.ticker || "");
    const extTicker = this.normalizeString(external.ticker || "");

    const compLei = this.normalizeString(company.lei || "");
    const extLei = this.normalizeString(external.lei || "");

    const compName = this.normalizeString(company.legalName || company.name || "");
    const extName = this.normalizeString(external.name || "");

    // 1. LEI Match
    if (compLei && extLei && compLei === extLei) {
      confidence = 100;
      reasons.push("Exact LEI match");
    }
    // 2. Website Domain Match
    else if (compDomain && extDomain && compDomain === extDomain) {
      confidence = 100;
      reasons.push("Exact Website Domain match");
    }
    // 3. Ticker Match
    else if (compTicker && extTicker && compTicker === extTicker) {
      confidence = 95;
      reasons.push("Exact Ticker match");
    }
    // 4. Name Match
    else if (compName && extName) {
      if (compName === extName) {
        confidence = 95;
        reasons.push("Exact Name match");
      } else if (compName.includes(extName) || extName.includes(compName)) {
        confidence = 90;
        reasons.push("Partial Name match");
      }

      if (confidence > 0) {
        // If we only match on name, but website or ticker contradict, reduce confidence
        if (compDomain && extDomain && compDomain !== extDomain) {
          confidence -= 20;
          reasons.push("Contradictory Website Domain");
        }
        if (compTicker && extTicker && compTicker !== extTicker) {
          confidence -= 20;
          reasons.push("Contradictory Ticker");
        }
      }
    } 
    // 5. Fallback/No match
    else {
      confidence = 10;
      reasons.push("No core identity fields matched");
    }

    const match = confidence >= this.threshold;

    // Log Audit
    this.logAudit({
      companyName: company.name,
      companyId: company.id,
      officialWebsite: company.website || "N/A",
      ticker: company.ticker || "N/A",
      country: company.countryId || "N/A",
      source: external.source,
      confidence,
      rejected: !match,
      timestamp: new Date().toISOString(),
      mismatchReason: match ? undefined : reasons.join(", ")
    });

    if (!match) {
      throw new IdentityMismatchError(`Identity resolution failed for ${company.name} from ${external.source}. Confidence: ${confidence}% (${reasons.join(", ")})`, confidence);
    }

    return { confidence, match, reasons };
  }

  private logAudit(record: AuditRecord) {
    let logs: AuditRecord[] = [];
    try {
      if (fs.existsSync(this.auditLogPath)) {
        logs = JSON.parse(fs.readFileSync(this.auditLogPath, "utf-8"));
      }
    } catch(e) {}
    
    logs.push(record);
    fs.writeFileSync(this.auditLogPath, JSON.stringify(logs, null, 2));
  }
}

export const identityResolver = new IdentityResolver();
