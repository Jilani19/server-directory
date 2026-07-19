"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const logger_1 = require("../utils/logger");
class BaseService {
    logInfo(message, obj) {
        if (obj) {
            logger_1.logger.info(obj, `[${this.constructor.name}] ${message}`);
        }
        else {
            logger_1.logger.info(`[${this.constructor.name}] ${message}`);
        }
    }
    logError(message, obj) {
        if (obj) {
            logger_1.logger.error(obj, `[${this.constructor.name}] ${message}`);
        }
        else {
            logger_1.logger.error(`[${this.constructor.name}] ${message}`);
        }
    }
    logWarn(message, obj) {
        if (obj) {
            logger_1.logger.warn(obj, `[${this.constructor.name}] ${message}`);
        }
        else {
            logger_1.logger.warn(`[${this.constructor.name}] ${message}`);
        }
    }
}
exports.BaseService = BaseService;
