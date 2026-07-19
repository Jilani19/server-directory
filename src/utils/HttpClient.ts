import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from './logger';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
      onRetry: (retryCount, error, requestConfig) => {
        logger.warn(`[HttpClient] Retrying ${requestConfig.url} (Attempt ${retryCount}) due to ${error.message}`);
      }
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`[HttpClient] [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`[HttpClient Error] ${error.config?.url} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }
}
