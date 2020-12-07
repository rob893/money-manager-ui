import { TypeGuards } from '@/helpers/TypeGuards';
import { Logger } from '@/models/misc';
import { AxiosInstance, AxiosStatic } from 'axios';

export abstract class MoneyManagerBaseService {
  protected readonly logger: Logger;

  protected readonly httpClient: AxiosInstance;

  public constructor(axiosStatic: AxiosStatic, logger?: Logger) {
    const { VUE_APP_MONEY_MANAGER_SERVICE_BASE_URL: baseURL } = process.env;

    if (!baseURL) {
      throw new Error('No VUE_APP_MONEY_MANAGER_SERVICE_BASE_URL environment variable set.');
    }

    this.logger = logger || console;
    this.httpClient = axiosStatic.create({ baseURL });
    this.httpClient.interceptors.response.use(
      response => response,
      error => {
        if (TypeGuards.isAxiosError(error) && error.response?.status === 404) {
          const { response } = error;
          response.data = null;

          return Promise.resolve(response);
        }

        return Promise.reject(error);
      }
    );
  }
}
