import { Request, Response } from 'express';
import { BaseController } from '../../core/BaseController';

export class HealthController extends BaseController {
  
  public liveness = (req: Request, res: Response): void => {
    this.sendSuccess(res, { status: 'UP' });
  };

  public readiness = (req: Request, res: Response): void => {
    // In a real app, you would check Prisma connection here
    this.sendSuccess(res, { status: 'READY', db: 'OK' });
  };

  public version = (req: Request, res: Response): void => {
    this.sendSuccess(res, { version: '1.0.0' });
  };
}
