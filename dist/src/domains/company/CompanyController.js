"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const BaseController_1 = require("../../core/BaseController");
class CompanyController extends BaseController_1.BaseController {
    service;
    constructor(service) {
        super();
        this.service = service;
    }
    getCompanies = async (req, res, next) => {
        try {
            const { page, limit, search, sort, order, companyType, industry, country, status, publicPrivate, verifiedOnly, hasProducts, hasTrials, hasFinancials, hasFacilities, hasPublications, hasPatents } = req.query;
            const result = await this.service.getCompanies({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                sort: sort,
                order: order,
                companyType: companyType,
                industry: industry,
                country: country,
                status: status,
                publicPrivate: publicPrivate,
                verifiedOnly: verifiedOnly === 'true',
                hasProducts: hasProducts === 'true',
                hasTrials: hasTrials === 'true',
                hasFinancials: hasFinancials === 'true',
                hasFacilities: hasFacilities === 'true',
                hasPublications: hasPublications === 'true',
                hasPatents: hasPatents === 'true'
            });
            this.sendSuccess(res, result.items, result.meta);
        }
        catch (error) {
            next(error);
        }
    };
    getStats = async (req, res, next) => {
        try {
            const stats = await this.service.getStats();
            this.sendSuccess(res, stats);
        }
        catch (error) {
            next(error);
        }
    };
    getCategories = async (req, res, next) => {
        try {
            const categories = await this.service.getCategories();
            this.sendSuccess(res, categories);
        }
        catch (error) {
            next(error);
        }
    };
    getCompanyBySlug = async (req, res, next) => {
        try {
            const company = await this.service.getCompanyBySlug(req.params.slug);
            this.sendSuccess(res, company);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CompanyController = CompanyController;
