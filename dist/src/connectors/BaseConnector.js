"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const errors_1 = require("../foundation/errors");
const logger_1 = require("../foundation/logger");
class BaseConnector {
    client;
    limiter;
    sourceName;
    constructor(sourceName, baseURL, requestsPerSecond = 2) {
        this.sourceName = sourceName;
        this.client = axios_1.default.create({
            baseURL,
            timeout: 15000,
        });
        // Native retry logic with exponential backoff
        (0, axios_retry_1.default)(this.client, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
            onRetry: (retryCount, error, requestConfig) => {
                logger_1.logger.warn({ source: this.sourceName, retryCount, error: error.message }, 'Retrying request due to failure/rate-limit');
            }
        });
        // Token bucket rate limiting
        this.limiter = new bottleneck_1.default({
            minTime: Math.ceil(1000 / requestsPerSecond),
            maxConcurrent: 1
        });
    }
    async get(url, config) {
        try {
            const response = await this.limiter.schedule(() => this.client.get(url, config));
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ source: this.sourceName, error: error.message, url }, 'Connector GET Error');
            throw new errors_1.ConnectorError(`Failed to fetch from \${this.sourceName}`, this.sourceName, error.response?.status || 500);
        }
    }
}
exports.BaseConnector = BaseConnector;
