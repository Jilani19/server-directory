"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const prisma_1 = require("../config/prisma");
class ProfileController {
    createResponse(data, provenance = null, pagination = null) {
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
    async getOverview(req, res) {
        const companySlug = req.params.slug;
        const company = await prisma_1.prisma.company.findUnique({
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
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        // Pass the full payload back
        res.json(this.createResponse(company, { source: "Master Registry" }));
    }
    async getClinicalTrials(req, res) {
        const companySlug = req.params.slug;
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: companySlug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const search = req.query.search;
        const phase = req.query.phase;
        const status = req.query.status;
        const whereCondition = { companyId: company.id };
        if (search)
            whereCondition.title = { contains: search };
        if (phase)
            whereCondition.phase = phase;
        if (status)
            whereCondition.status = status;
        const [trials, total] = await Promise.all([
            prisma_1.prisma.companyClinicalTrial.findMany({
                where: whereCondition,
                skip,
                take: limit,
            }),
            prisma_1.prisma.companyClinicalTrial.count({ where: whereCondition })
        ]);
        res.json(this.createResponse(trials, { source: "ClinicalTrials.gov (ARES API)" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getFinancials(req, res) {
        const companySlug = req.params.slug;
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: companySlug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        res.json(this.createResponse({
            marketCap: company.marketCap,
            funding: company.funding,
            profit: company.profit,
            employeeGrowth: company.employeeGrowth,
            stockPrice: company.stockPrice,
            latestSecFiling: company.latestSecFiling,
            enterpriseValue: company.enterpriseValue,
            revenue: company.revenue,
            netIncome: company.netIncome,
            ebitda: company.ebitda,
            operatingIncome: company.operatingIncome,
            cash: company.cash,
            assets: company.assets,
            liabilities: company.liabilities,
            equity: company.equity,
            debt: company.debt,
            freeCashFlow: company.freeCashFlow,
            eps: company.eps,
            peRatio: company.peRatio,
            sharesOutstanding: company.sharesOutstanding,
            fiftyTwoWeekHigh: company.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: company.fiftyTwoWeekLow,
            dividend: company.dividend,
            fiscalYear: company.fiscalYear,
            reportingDate: company.reportingDate,
            rdSpend: company.rdSpend,
            currency: company.currency || "USD",
            ticker: company.ticker,
        }, { source: "Yahoo Finance" }));
    }
    async getCorporate(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
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
    async getLeadership(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const executives = await prisma_1.prisma.companyExecutive.findMany({
            where: { companyId: company.id }
        });
        res.json(this.createResponse(executives));
    }
    async getProducts(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const approvalStatus = req.query.approvalStatus;
        const whereCondition = { companyId: company.id };
        if (search) {
            whereCondition.name = { contains: search };
        }
        if (approvalStatus) {
            whereCondition.status = approvalStatus;
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma_1.prisma.product.count({ where: whereCondition })
        ]);
        // Map product data to the field names the frontend ProductsTab expects
        const drugs = products.map((p) => ({
            id: p.id,
            brandName: p.name, // component reads row.brandName
            genericName: p.genericName || null, // component reads row.genericName
            activeIngredients: p.genericName || null, // fallback column
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
    async getTherapeuticAreas(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { therapeuticAreas: true }
        });
        res.json(this.createResponse(company?.therapeuticAreas));
    }
    async getResearch(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { researchFocus: true }
        });
        res.json(this.createResponse(company?.researchFocus));
    }
    async getManufacturing(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { manufacturing: true, facilities: true }
        });
        res.json(this.createResponse(company));
    }
    async getRegulatory(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "20");
        const skip = (page - 1) * limit;
        const agencyFilter = req.query.agency;
        const typeFilter = req.query.type;
        const whereCondition = { companyId: company.id };
        if (agencyFilter)
            whereCondition.agency = { contains: agencyFilter };
        if (typeFilter)
            whereCondition.type = { contains: typeFilter };
        const [actions, total] = await Promise.all([
            prisma_1.prisma.companyRegulatoryAction.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { issueDate: 'desc' }
            }),
            prisma_1.prisma.companyRegulatoryAction.count({ where: whereCondition })
        ]);
        // Map type -> actionType so frontend RegulatoryTab gets the right field
        const mapped = actions.map((a) => ({
            ...a,
            actionType: a.type,
            subject: a.title,
        }));
        res.json(this.createResponse(mapped, { source: "OpenFDA, FDA Enforcement" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getPublications(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const year = req.query.year;
        const journal = req.query.journal;
        const whereCondition = { companyId: company.id };
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
            prisma_1.prisma.companyPublication.findMany({
                where: whereCondition,
                skip,
                take: limit,
            }),
            prisma_1.prisma.companyPublication.count({ where: whereCondition })
        ]);
        res.json(this.createResponse(publications, { source: "PubMed" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getPatents(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const status = req.query.status;
        const office = req.query.office;
        const whereCondition = { companyId: company.id };
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
            prisma_1.prisma.companyPatent.findMany({
                where: whereCondition,
                skip,
                take: limit,
            }),
            prisma_1.prisma.companyPatent.count({ where: whereCondition })
        ]);
        res.json(this.createResponse(patents, { source: "USPTO" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getPartnerships(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { recentPartnerships: true }
        });
        res.json(this.createResponse(company?.recentPartnerships));
    }
    async getAcquisitions(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { recentAcquisitions: true }
        });
        res.json(this.createResponse(company?.recentAcquisitions));
    }
    async getCompetitors(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const competitors = await prisma_1.prisma.companyCompetitor.findMany({
            where: { sourceCompanyId: company.id },
            include: { targetCompany: true }
        });
        res.json(this.createResponse(competitors));
    }
    async getNews(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const search = req.query.search;
        // const category = req.query.category as string | undefined;
        const whereCondition = { companyId: company.id };
        if (search) {
            whereCondition.title = { contains: search };
        }
        const [news, total] = await Promise.all([
            prisma_1.prisma.companyNews.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { publishDate: 'desc' }
            }),
            prisma_1.prisma.companyNews.count({ where: whereCondition })
        ]);
        res.json(this.createResponse(news, null, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getDocuments(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "10");
        const skip = (page - 1) * limit;
        const [documents, total] = await Promise.all([
            prisma_1.prisma.companyDocument.findMany({
                where: { companyId: company.id },
                skip,
                take: limit,
            }),
            prisma_1.prisma.companyDocument.count({ where: { companyId: company.id } })
        ]);
        res.json(this.createResponse(documents, null, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getDownloads(req, res) {
        res.json(this.createResponse([]));
    }
    async getTimeline(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug },
            select: { recentMilestones: true }
        });
        res.json(this.createResponse(company?.recentMilestones));
    }
    async getContacts(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "20");
        const skip = (page - 1) * limit;
        const [contacts, total] = await Promise.all([
            prisma_1.prisma.companyContact.findMany({
                where: { companyId: company.id },
                skip,
                take: limit,
            }),
            prisma_1.prisma.companyContact.count({ where: { companyId: company.id } })
        ]);
        res.json(this.createResponse(contacts, { source: "Company Registry" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getPipeline(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.slug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        const pageStr = req.query.page;
        const limitStr = req.query.limit;
        const page = parseInt(pageStr || "1");
        const limit = parseInt(limitStr || "20");
        const skip = (page - 1) * limit;
        // Try companyPipelineAsset first
        const pipelineCount = await prisma_1.prisma.companyPipelineAsset.count({ where: { companyId: company.id } });
        if (pipelineCount > 0) {
            const [assets, total] = await Promise.all([
                prisma_1.prisma.companyPipelineAsset.findMany({
                    where: { companyId: company.id },
                    skip,
                    take: limit,
                }),
                Promise.resolve(pipelineCount)
            ]);
            const drugs = assets.map((a) => ({
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
        const whereCondition = {
            companyId: company.id,
            phase: { in: ['PHASE1', 'PHASE2', 'PHASE3', 'EARLY_PHASE1'] },
            status: { in: ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'NOT_YET_RECRUITING', 'ENROLLING_BY_INVITATION'] }
        };
        const [trials, total] = await Promise.all([
            prisma_1.prisma.companyClinicalTrial.findMany({ where: whereCondition, skip, take: limit }),
            prisma_1.prisma.companyClinicalTrial.count({ where: whereCondition })
        ]);
        const drugs = trials.map((t) => ({
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
    async getAiInsights(req, res) {
        const summaries = await prisma_1.prisma.aISummary.findMany({
            where: { entityType: 'Company' }
        });
        res.json(this.createResponse(summaries, { source: "cGxP Intelligence Engine" }));
    }
}
exports.ProfileController = ProfileController;
