import { Router } from "express";
import healthRoutes from "./health.route";
import { companyRoutes } from "../domains/company/CompanyRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/companies", companyRoutes);

export default router;
