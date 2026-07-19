import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../core/BaseController';
import { CompanyService } from './CompanyService';

export class CompanyController extends BaseController {
  constructor(private readonly service: CompanyService) {
    super();
  }

  getCompanies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, sort, order, companyType, industry, country, status, publicPrivate, verifiedOnly, hasProducts, hasTrials, hasFinancials, hasFacilities, hasPublications, hasPatents } = req.query;
      const result = await this.service.getCompanies({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        sort: sort as string,
        order: order as 'asc' | 'desc',
        companyType: companyType as string,
        industry: industry as string,
        country: country as string,
        status: status as string,
        publicPrivate: publicPrivate as string,
        verifiedOnly: verifiedOnly === 'true',
        hasProducts: hasProducts === 'true',
        hasTrials: hasTrials === 'true',
        hasFinancials: hasFinancials === 'true',
        hasFacilities: hasFacilities === 'true',
        hasPublications: hasPublications === 'true',
        hasPatents: hasPatents === 'true'
      });
      this.sendSuccess(res, result.items, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.service.getCategories();
      this.sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  };

  getCompanyBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company = await this.service.getCompanyBySlug(req.params.slug as string);
      this.sendSuccess(res, company);
    } catch (error) {
      next(error);
    }
  };
}
