import { logger } from '../utils/logger';

export abstract class BaseService {
  protected logInfo(message: string, obj?: any): void {
    if (obj) {
      logger.info(obj, `[${this.constructor.name}] ${message}`);
    } else {
      logger.info(`[${this.constructor.name}] ${message}`);
    }
  }

  protected logError(message: string, obj?: any): void {
    if (obj) {
      logger.error(obj, `[${this.constructor.name}] ${message}`);
    } else {
      logger.error(`[${this.constructor.name}] ${message}`);
    }
  }

  protected logWarn(message: string, obj?: any): void {
    if (obj) {
      logger.warn(obj, `[${this.constructor.name}] ${message}`);
    } else {
      logger.warn(`[${this.constructor.name}] ${message}`);
    }
  }
}
