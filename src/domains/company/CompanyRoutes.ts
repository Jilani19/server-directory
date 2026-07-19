import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CompanyRepository } from './CompanyRepository';
import { CompanyService } from './CompanyService';
import { CompanyController } from './CompanyController';
import profileRoutes from '../../routes/profile.routes';

export const companyRoutes = Router();

const prisma = new PrismaClient();
const repository = new CompanyRepository(prisma);
const service = new CompanyService(repository);
const controller = new CompanyController(service);

companyRoutes.get('/', controller.getCompanies);
companyRoutes.get('/stats', controller.getStats);
companyRoutes.get('/categories', controller.getCategories);
companyRoutes.get('/search', controller.getCompanies);

// Mount the granular profile endpoints
companyRoutes.use('/', profileRoutes);

// Fallback for getting the entire company object (legacy)
companyRoutes.get('/:slug', controller.getCompanyBySlug);
