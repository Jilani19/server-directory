import { Router } from 'express';
import { HealthController } from './HealthController';

export const healthRoutes = Router();
const healthController = new HealthController();

healthRoutes.get('/liveness', healthController.liveness);
healthRoutes.get('/readiness', healthController.readiness);
healthRoutes.get('/version', healthController.version);
