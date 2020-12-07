import { AxiosStatic } from 'axios';
import { Logger } from '@/models/misc';
import { MoneyManagerBaseService } from './MoneyManagerBaseService';
import { AuthService } from './AuthService';

export abstract class MoneyManagerAuthenticatedBaseService extends MoneyManagerBaseService {
  public constructor(axiosStatic: AxiosStatic, authService: AuthService, logger?: Logger) {
    super(axiosStatic, logger);

    this.httpClient.interceptors.request.use(async config => {
      const token = await authService.getAccessToken();
      config.headers.authorization = `Bearer ${token}`;

      return config;
    });
  }
}
