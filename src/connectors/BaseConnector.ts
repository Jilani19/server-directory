import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import Bottleneck from 'bottleneck';
import { ConnectorError } from '../foundation/errors';
import { logger } from '../foundation/logger';

export abstract class BaseConnector {
  protected client: AxiosInstance;
  protected limiter: Bottleneck;
  protected sourceName: string;

  constructor(sourceName: string, baseURL: string, requestsPerSecond: number = 2) {
    this.sourceName = sourceName;
    
    this.client = axios.create({
      baseURL,
      timeout: 15000,
    });

    // Native retry logic with exponential backoff
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
      onRetry: (retryCount, error, requestConfig) => {
        logger.warn({ source: this.sourceName, retryCount, error: error.message }, 'Retrying request due to failure/rate-limit');
      }
    });

    // Token bucket rate limiting
    this.limiter = new Bottleneck({
      minTime: Math.ceil(1000 / requestsPerSecond), 
      maxConcurrent: 1
    });
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.limiter.schedule(() => this.client.get<T>(url, config));
      return response.data;
    } catch (error: any) {
      logger.error({ source: this.sourceName, error: error.message, url }, 'Connector GET Error');
      throw new ConnectorError(`Failed to fetch from \${this.sourceName}`, this.sourceName, error.response?.status || 500);
    }
  }
}
