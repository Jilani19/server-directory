import { prisma } from "../config/prisma";
import { Company } from "@prisma/client";

export class DiscoveryEngine {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async discover(name: string, sourceName: string, sourceUrl?: string, confidenceScore: number = 0.5): Promise<Company | null> {
    if (!name || name.trim() === "") return null;

    console.log(`[DISCOVERY ENGINE] Attempting to enrich candidate: ${name} via ${sourceName}`);
    
    const baseSlug = this.generateSlug(name);
    
    // REGISTRY FIRST ARCHITECTURE:
    // We completely disable the ability for the Discovery Engine to CREATE new companies.
    // It can ONLY return a company if it already exists in the master registry.
    const existing = await prisma.company.findUnique({
      where: { slug: baseSlug }
    });

    if (existing) {
      console.log(`[DISCOVERY ENGINE] Matched existing Registry company: ${existing.name}`);
      // (Company Source tracking is now handled by the MasterSyncEngine and EntityHistory)
      return existing;
    }

    console.log(`[DISCOVERY ENGINE] Rejected candidate ${name}: Not in Master Registry.`);
    return null;
  }
}
