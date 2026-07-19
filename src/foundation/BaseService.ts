import { logger } from './logger';

export abstract class BaseService {
  protected logger = logger;

  protected handleError(error: any, context: string): never {
    this.logger.error({ err: error, context }, 'Service Error');
    throw error;
  }
}
