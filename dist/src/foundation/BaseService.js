"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const logger_1 = require("./logger");
class BaseService {
    logger = logger_1.logger;
    handleError(error, context) {
        this.logger.error({ err: error, context }, 'Service Error');
        throw error;
    }
}
exports.BaseService = BaseService;
