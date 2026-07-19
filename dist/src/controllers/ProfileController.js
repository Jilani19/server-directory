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
        const companySlug = req.params.companySlug;
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: companySlug },
            include: {
                facilities: { where: { type: "HQ" } }
            }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        res.json(this.createResponse({
            id: company.id,
            name: company.name,
            description: company.description,
            industry: "Biotechnology",
            website: company.website,
            phone: company.phone,
            employees: company.employees,
            status: company.status,
            hq: company.facilities?.length > 0 ? company.facilities[0] : null
        }, { source: "Yahoo Finance & Master Registry" }));
    }
    async getClinicalTrials(req, res) {
        const companySlug = req.params.companySlug;
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
        if (search || phase || status) {
            whereCondition.trial = {};
            if (search)
                whereCondition.trial.title = { contains: search };
            if (phase)
                whereCondition.trial.phase = phase;
            if (status)
                whereCondition.trial.status = status;
        }
        const [relations, total] = await Promise.all([
            prisma_1.prisma.companyTrialRelation.findMany({
                where: whereCondition,
                skip,
                take: limit,
                include: { trial: true }
            }),
            prisma_1.prisma.companyTrialRelation.count({ where: whereCondition })
        ]);
        const trials = relations.map((rel) => ({
            ...rel.trial,
            sponsorRole: rel.role
        }));
        res.json(this.createResponse(trials, { source: "ClinicalTrials.gov ARES API" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getFinancials(req, res) {
        const companySlug = req.params.companySlug;
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: companySlug }
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        res.json(this.createResponse({
            marketCap: company.marketCap,
            revenue: company.revenue,
            netIncome: company.netIncome,
            cash: company.cash,
            debt: company.debt,
            ebitda: company.ebitda,
            currency: company.currency || "USD",
            ticker: company.ticker,
        }, { source: "Yahoo Finance" }));
    }
    async getCorporate(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: {
                history: true, businessOverview: true, foundedYear: true,
                legalName: true, ownershipType: true, globalOffices: true,
                therapeuticAreas: true, technologyPlatforms: true, manufacturing: true
            }
        });
        res.json(this.createResponse(company || {}, { source: "SEC EDGAR", confidenceScore: 99 }));
    }
    async getLeadership(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug }
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
        const [drugs, total] = await Promise.all([
            prisma_1.prisma.drug.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma_1.prisma.drug.count({ where: whereCondition })
        ]);
        res.json(this.createResponse({ drugs, products: [] }, { source: "FDA openFDA" }, { page, limit, total, totalPages: Math.ceil(total / limit) }));
    }
    async getTherapeuticAreas(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: { therapeuticAreas: true }
        });
        res.json(this.createResponse(company?.therapeuticAreas));
    }
    async getResearch(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: { researchFocus: true }
        });
        res.json(this.createResponse(company?.researchFocus));
    }
    async getManufacturing(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: { manufacturing: true, facilities: { where: { type: 'Manufacturing' } } }
        });
        res.json(this.createResponse(company));
    }
    async getRegulatory(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: { regulatoryFootprint: true }
        });
        res.json(this.createResponse(company));
    }
    async getPublications(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug },
            select: { recentPartnerships: true }
        });
        res.json(this.createResponse(company?.recentPartnerships));
    }
    async getAcquisitions(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug },
            select: { recentAcquisitions: true }
        });
        res.json(this.createResponse(company?.recentAcquisitions));
    }
    async getCompetitors(req, res) {
        const company = await prisma_1.prisma.company.findUnique({
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug }
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
            where: { slug: req.params.companySlug },
            select: { recentMilestones: true }
        });
        res.json(this.createResponse(company?.recentMilestones));
    }
    async getAiInsights(req, res) {
        const summaries = await prisma_1.prisma.aISummary.findMany({
            where: { entityType: 'Company' }
        });
        res.json(this.createResponse(summaries, { source: "cGxP Intelligence Engine" }));
    }
}
exports.ProfileController = ProfileController;
