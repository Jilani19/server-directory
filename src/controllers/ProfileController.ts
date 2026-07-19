import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export class ProfileController {
  
  private createResponse(data: any, provenance: any = null, pagination: any = null) {
    return {
      data,
      metadata: {
        provenance: provenance || {
          source: "Master Registry",
          lastVerified: new Date().toISOString(),
          lastSynced: new Date().toISOString(),
          confidenceScore: 100,
          completeness: 100
        },
        pagination,
        timestamp: new Date().toISOString()
      }
    };
  }

  async getOverview(req: Request, res: Response) {
    const companySlug = req.params.slug as string;
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      include: {
        facilities: { where: { type: "HQ" }, take: 1 },
        executives: { take: 5 },
        categories: true,
        country: true,
        drugRelations: { include: { drug: true }, take: 5 },
        trialRelations: { include: { trial: true }, take: 5 },
        news: { take: 5, orderBy: { publishDate: 'desc' } }
      }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });
    
    // Pass the full payload back
    res.json(this.createResponse(company, { source: "Master Registry" }));
  }

  async getClinicalTrials(req: Request, res: Response) {
    const companySlug = req.params.slug as string;
    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;

    const company = await prisma.company.findUnique({
      where: { slug: companySlug }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const search = req.query.search as string | undefined;
    const phase = req.query.phase as string | undefined;
    const status = req.query.status as string | undefined;

    const whereCondition: any = { companyId: company.id };
    
    if (search) whereCondition.title = { contains: search };
    if (phase) whereCondition.phase = phase;
    if (status) whereCondition.status = status;
    
    const [trials, total] = await Promise.all([
      prisma.companyClinicalTrial.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      prisma.companyClinicalTrial.count({ where: whereCondition })
    ]);

    res.json(this.createResponse(trials, { source: "ClinicalTrials.gov (ARES API)" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getFinancials(req: Request, res: Response) {
    const companySlug = req.params.slug as string;
    const company = await prisma.company.findUnique({
      where: { slug: companySlug }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    res.json(this.createResponse({
      marketCap: (company as any).marketCap,
      funding: (company as any).funding,
      profit: (company as any).profit,
      employeeGrowth: (company as any).employeeGrowth,
      stockPrice: (company as any).stockPrice,
      latestSecFiling: (company as any).latestSecFiling,
      enterpriseValue: (company as any).enterpriseValue,
      revenue: (company as any).revenue,
      netIncome: (company as any).netIncome,
      ebitda: (company as any).ebitda,
      operatingIncome: (company as any).operatingIncome,
      cash: (company as any).cash,
      assets: (company as any).assets,
      liabilities: (company as any).liabilities,
      equity: (company as any).equity,
      debt: (company as any).debt,
      freeCashFlow: (company as any).freeCashFlow,
      eps: (company as any).eps,
      peRatio: (company as any).peRatio,
      sharesOutstanding: (company as any).sharesOutstanding,
      fiftyTwoWeekHigh: (company as any).fiftyTwoWeekHigh,
      fiftyTwoWeekLow: (company as any).fiftyTwoWeekLow,
      dividend: (company as any).dividend,
      fiscalYear: (company as any).fiscalYear,
      reportingDate: (company as any).reportingDate,
      rdSpend: (company as any).rdSpend,
      currency: (company as any).currency || "USD",
      ticker: (company as any).ticker,
    }, { source: "Yahoo Finance" }));
  }

  async getCorporate(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { 
        history: true, businessOverview: true, foundedYear: true,
        legalName: true, ownershipType: true, globalOffices: true,
        therapeuticAreas: true, technologyPlatforms: true, manufacturing: true,
        tradeName: true, parentCompany: true, incorporationDate: true,
        companyNumber: true, isin: true, duns: true, registeredAddress: true,
        manufacturingLocs: true, rdCenters: true, countriesServed: true,
        businessModel: true, keyProducts: true, researchFocus: true,
        geographicPresence: true, regulatoryFootprint: true, businessSegments: true,
        marketsServed: true, customers: true, recentMilestones: true,
        recentAcquisitions: true, recentApprovals: true, recentPartnerships: true,
        corporateHighlights: true, lei: true, cik: true, rorId: true, 
        wikidataId: true, openCorpId: true
      }
    });
    res.json(this.createResponse(company || {}, { source: "SEC EDGAR", confidenceScore: 99 }));
  }

  async getLeadership(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    
    const executives = await prisma.companyExecutive.findMany({
      where: { companyId: company.id }
    });
    res.json(this.createResponse(executives));
  }

  async getProducts(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string | undefined;
    const approvalStatus = req.query.approvalStatus as string | undefined;

    const whereCondition: any = { companyId: company.id };
    
    if (search) {
      whereCondition.name = { contains: search };
    }
    if (approvalStatus) {
      whereCondition.status = approvalStatus;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where: whereCondition })
    ]);
    
    // Map product data to the field names the frontend ProductsTab expects
    const drugs = products.map((p: any) => ({
      id: p.id,
      brandName: p.name,                         // component reads row.brandName
      genericName: p.genericName || null,         // component reads row.genericName
      activeIngredients: p.genericName || null,   // fallback column
      therapeuticArea: p.therapeuticArea || null, // filter + display
      approvalStatus: p.approvalStatus || p.status || 'ACTIVE', // badge
      approvalYear: p.approvalYear || null,
      applicationNumber: p.applicationNumber || null,
      manufacturer: p.manufacturer || null,
      dosageForm: p.dosageForm || null,
      route: p.route || null,
      description: p.description || null,
      ndcCode: p.ndcCode || null,
    }));

    res.json(this.createResponse({ drugs, products: drugs }, { source: "FDA openFDA" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getTherapeuticAreas(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { therapeuticAreas: true }
    });
    res.json(this.createResponse(company?.therapeuticAreas));
  }

  async getResearch(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { researchFocus: true }
    });
    res.json(this.createResponse(company?.researchFocus));
  }

  async getManufacturing(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { manufacturing: true, facilities: true }
    });
    res.json(this.createResponse(company));
  }

  async getRegulatory(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    const agencyFilter = req.query.agency as string | undefined;
    const typeFilter   = req.query.type as string | undefined;
    const whereCondition: any = { companyId: company.id };
    if (agencyFilter) whereCondition.agency = { contains: agencyFilter };
    if (typeFilter)   whereCondition.type   = { contains: typeFilter };

    const [actions, total] = await Promise.all([
      prisma.companyRegulatoryAction.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { issueDate: 'desc' }
      }),
      prisma.companyRegulatoryAction.count({ where: whereCondition })
    ]);

    // Map type -> actionType so frontend RegulatoryTab gets the right field
    const mapped = actions.map((a: any) => ({
      ...a,
      actionType: a.type,
      subject: a.title,
    }));

    res.json(this.createResponse(mapped, { source: "OpenFDA, FDA Enforcement" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getPublications(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;
    const year = req.query.year as string | undefined;
    const journal = req.query.journal as string | undefined;

    const whereCondition: any = { companyId: company.id };
    if (search) {
      whereCondition.title = { contains: search };
    }
    if (year) {
      whereCondition.publicationDate = { contains: year };
    }
    if (journal) {
      whereCondition.journal = { contains: journal };
    }

    const [publications, total] = await Promise.all([
      prisma.companyPublication.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      prisma.companyPublication.count({ where: whereCondition })
    ]);

    res.json(this.createResponse(publications, { source: "PubMed" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getPatents(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const office = req.query.office as string | undefined;

    const whereCondition: any = { companyId: company.id };
    if (search) {
      whereCondition.title = { contains: search };
    }
    if (status) {
      whereCondition.status = status;
    }
    if (office) {
      whereCondition.agencies = { contains: office };
    }

    const [patents, total] = await Promise.all([
      prisma.companyPatent.findMany({
        where: whereCondition,
        skip,
        take: limit,
      }),
      prisma.companyPatent.count({ where: whereCondition })
    ]);

    res.json(this.createResponse(patents, { source: "USPTO" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getPartnerships(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { recentPartnerships: true }
    });
    res.json(this.createResponse(company?.recentPartnerships));
  }

  async getAcquisitions(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { recentAcquisitions: true }
    });
    res.json(this.createResponse(company?.recentAcquisitions));
  }

  async getCompetitors(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    
    const competitors = await prisma.companyCompetitor.findMany({
      where: { sourceCompanyId: company.id },
      include: { targetCompany: true }
    });

    res.json(this.createResponse(competitors));
  }

  async getNews(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string | undefined;
    // const category = req.query.category as string | undefined;

    const whereCondition: any = { companyId: company.id };
    if (search) {
      whereCondition.title = { contains: search };
    }

    const [news, total] = await Promise.all([
      prisma.companyNews.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { publishDate: 'desc' }
      }),
      prisma.companyNews.count({ where: whereCondition })
    ]);

    res.json(this.createResponse(news, null, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getDocuments(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "10");
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      prisma.companyDocument.findMany({
        where: { companyId: company.id },
        skip,
        take: limit,
      }),
      prisma.companyDocument.count({ where: { companyId: company.id } })
    ]);

    res.json(this.createResponse(documents, null, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getDownloads(req: Request, res: Response) {
    res.json(this.createResponse([]));
  }

  async getTimeline(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string },
      select: { recentMilestones: true }
    });
    res.json(this.createResponse(company?.recentMilestones));
  }


  async getContacts(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      prisma.companyContact.findMany({
        where: { companyId: company.id },
        skip,
        take: limit,
      }),
      prisma.companyContact.count({ where: { companyId: company.id } })
    ]);

    res.json(this.createResponse(contacts, { source: "Company Registry" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getPipeline(req: Request, res: Response) {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug as string }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const pageStr = req.query.page as string | undefined;
    const limitStr = req.query.limit as string | undefined;
    const page = parseInt(pageStr || "1");
    const limit = parseInt(limitStr || "20");
    const skip = (page - 1) * limit;

    // Try companyPipelineAsset first
    const pipelineCount = await prisma.companyPipelineAsset.count({ where: { companyId: company.id } });

    if (pipelineCount > 0) {
      const [assets, total] = await Promise.all([
        prisma.companyPipelineAsset.findMany({
          where: { companyId: company.id },
          skip,
          take: limit,
        }),
        Promise.resolve(pipelineCount)
      ]);
      const drugs = assets.map((a: any) => ({
        id: a.id,
        brandName: a.assetName || a.name || null,
        genericName: a.genericName || a.molecule || null,
        therapeuticArea: a.indication || a.therapeuticArea || null,
        approvalStatus: a.clinicalStage || a.stage || a.phase || 'Investigational',
        approvalYear: null,
      }));
      return res.json(this.createResponse({ drugs }, { source: "Pipeline Database" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }

    // Fall back to clinical trials as pipeline proxy (active/recruiting Phase 1-3)
    const whereCondition: any = {
      companyId: company.id,
      phase: { in: ['PHASE1', 'PHASE2', 'PHASE3', 'EARLY_PHASE1'] },
      status: { in: ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION'] }
    };
    const [trials, total] = await Promise.all([
      prisma.companyClinicalTrial.findMany({ where: whereCondition, skip, take: limit }),
      prisma.companyClinicalTrial.count({ where: whereCondition })
    ]);
    const drugs = trials.map((t: any) => ({
      id: t.id,
      brandName: (t.interventions || t.title || '').split(';')[0].trim().substring(0, 60) || t.title.substring(0, 60),
      genericName: t.conditions || null,
      therapeuticArea: t.conditions || null,
      approvalStatus: t.phase || 'Investigational',
      approvalYear: null,
      description: t.title,
    }));
    res.json(this.createResponse({ drugs }, { source: "ClinicalTrials.gov" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  }

  async getAiInsights(req: Request, res: Response) {
    const summaries = await prisma.aISummary.findMany({
      where: { entityType: 'Company' }
    });
    res.json(this.createResponse(summaries, { source: "cGxP Intelligence Engine" }));
  }
}

