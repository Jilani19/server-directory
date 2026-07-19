"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const BaseService_1 = require("../../core/BaseService");
const AppError_1 = require("../../utils/AppError");
class CompanyService extends BaseService_1.BaseService {
    repo;
    constructor(repo) {
        super();
        this.repo = repo;
    }
    async getCompanies(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search) {
            where.OR = [
                { name: { contains: params.search } },
                { slug: { contains: params.search } }
            ];
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.hasProducts)
            where.drugRelations = { some: {} };
        if (params.hasTrials)
            where.trialRelations = { some: {} };
        if (params.hasFacilities)
            where.facilities = { some: {} };
        let orderBy = {};
        if (params.sort) {
            switch (params.sort) {
                case "A-Z":
                    orderBy = { name: "asc" };
                    break;
                case "Z-A":
                    orderBy = { name: "desc" };
                    break;
                case "Newest Added":
                    orderBy = { createdAt: "desc" };
                    break;
                case "Oldest Added":
                    orderBy = { createdAt: "asc" };
                    break;
                case "Most Products":
                    orderBy = { drugRelations: { _count: "desc" } };
                    break;
                case "Most Clinical Trials":
                    orderBy = { trialRelations: { _count: "desc" } };
                    break;
                case "Recently Updated":
                    orderBy = { updatedAt: "desc" };
                    break;
                default:
                    orderBy = [
                        { isFeatured: "desc" },
                        { displayPriority: "desc" },
                        { completenessScore: "desc" },
                        { name: "asc" }
                    ];
                    break;
            }
        }
        else {
            orderBy = [
                { isFeatured: "desc" },
                { displayPriority: "desc" },
                { completenessScore: "desc" },
                { name: "asc" }
            ];
        }
        const [items, total] = await Promise.all([
            this.repo.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    categories: true,
                    country: true,
                    facilities: { where: { type: "HQ" }, take: 1 },
                    _count: {
                        select: {
                            drugRelations: true,
                            trialRelations: true,
                            products: true,
                            facilities: true,
                            executives: true,
                            publications: true,
                            patents: true,
                            news: true,
                            relationships: true
                        }
                    }
                }
            }),
            this.repo.count({ where })
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getStats() {
        return this.repo.getStats();
    }
    async getCategories() {
        return this.repo.getCategories();
    }
    async getCompanyBySlug(slug) {
        const company = await this.repo.getBySlug(slug);
        if (!company)
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Company not found');
        return company;
    }
}
exports.CompanyService = CompanyService;
