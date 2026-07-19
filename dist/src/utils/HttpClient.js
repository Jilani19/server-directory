"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const logger_1 = require("./logger");
class HttpClient {
    client;
    constructor(baseURL, timeout = 10000) {
        this.client = axios_1.default.create({
            baseURL,
            timeout,
        });
        (0, axios_retry_1.default)(this.client, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => {
                return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
            onRetry: (retryCount, error, requestConfig) => {
                logger_1.logger.warn(`[HttpClient] Retrying ${requestConfig.url} (Attempt ${retryCount}) due to ${error.message}`);
            }
        });
        this.initializeInterceptors();
    }
    initializeInterceptors() {
        this.client.interceptors.response.use((response) => {
            logger_1.logger.debug(`[HttpClient] [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
            return response;
        }, (error) => {
            logger_1.logger.error(`[HttpClient Error] ${error.config?.url} - ${error.message}`);
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        return this.client.get(url, config);
    }
}
exports.HttpClient = HttpClient;
