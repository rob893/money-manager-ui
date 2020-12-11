import axios, { AxiosStatic } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { LoginResponse, RefreshTokenResponse } from '@/models/responses';
import { LocalStorageService, localStorageService as localStorageServiceInstance } from './LocalStorageService';
import { User } from '@/models/entities';
import { MoneyManagerBaseService } from './MoneyManagerBaseService';
import { Logger } from '@/models/misc';

export class AuthService extends MoneyManagerBaseService {
  public readonly onUserLoggedIn: ((user: User) => void)[] = [];

  public readonly onUserLoggedOut: (() => void)[] = [];

  private readonly localStorageService: LocalStorageService;

  private readonly accessTokenStorageKey: string = 'access-token';

  private readonly refreshTokenStorageKey: string = 'refresh-token';

  private readonly userStorageKey: string = 'user';

  private cachedAccessToken: string | null = null;

  private cachedRefreshToken: string | null = null;

  private cachedLoggedInUser: User | null = null;

  public constructor(axiosStatic: AxiosStatic, localStorageService: LocalStorageService, logger?: Logger) {
    super(axiosStatic, logger);
    this.localStorageService = localStorageService;
  }

  public get isUserLoggedIn(): boolean {
    return this.loggedInUser !== null;
  }

  public get loggedInUser(): User | null {
    if (!this.cachedLoggedInUser) {
      const userFromLocalStorage = this.localStorageService.getParsedItem<User>(this.userStorageKey);

      if (!userFromLocalStorage) {
        return null;
      }

      this.cachedLoggedInUser = userFromLocalStorage;
    }

    return { ...this.cachedLoggedInUser };
  }

  private get accessToken(): string | null {
    if (!this.cachedAccessToken) {
      const tokenFromLocalStorage = this.localStorageService.getItem(this.accessTokenStorageKey);

      if (!tokenFromLocalStorage) {
        return null;
      }

      this.cachedAccessToken = tokenFromLocalStorage;
    }

    return this.cachedAccessToken;
  }

  private get refreshToken(): string | null {
    if (!this.cachedRefreshToken) {
      const tokenFromLocalStorage = this.localStorageService.getItem(this.refreshTokenStorageKey);

      if (!tokenFromLocalStorage) {
        return null;
      }

      this.cachedRefreshToken = tokenFromLocalStorage;
    }

    return this.cachedRefreshToken;
  }

  public async login(username: string, password: string): Promise<LoginResponse> {
    const result = await this.httpClient.post<LoginResponse>('auth/login', {
      username,
      password
    });

    const { token, refreshToken, user } = result.data;

    this.cachedAccessToken = token;
    this.cachedRefreshToken = refreshToken;
    this.cachedLoggedInUser = user;

    this.localStorageService.setItem(this.accessTokenStorageKey, token);
    this.localStorageService.setItem(this.refreshTokenStorageKey, refreshToken);
    this.localStorageService.setItem(this.userStorageKey, user);

    this.onUserLoggedIn.forEach(handler => handler(user));

    return result.data;
  }

  public logout(): void {
    this.localStorageService.clear();
    this.cachedAccessToken = null;
    this.cachedRefreshToken = null;
    this.cachedLoggedInUser = null;
    this.onUserLoggedOut.forEach(handler => handler());
  }

  public async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    if (this.isTokenExpired(this.accessToken)) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  public async refreshAccessToken(): Promise<RefreshTokenResponse> {
    const result = await this.httpClient.post<RefreshTokenResponse>('auth/refreshToken', {
      token: this.accessToken,
      refreshToken: this.refreshToken
    });

    const { token, refreshToken } = result.data;

    this.cachedAccessToken = token;
    this.cachedRefreshToken = refreshToken;

    this.localStorageService.setItem(this.accessTokenStorageKey, token);
    this.localStorageService.setItem(this.refreshTokenStorageKey, refreshToken);

    return result.data;
  }

  public isTokenExpired(token: string, expOffsetInSeconds: number = 300): boolean {
    const { exp } = jwtDecode<JwtPayload>(token);

    if (!exp) {
      throw new Error('Token is missing exp claim');
    }

    const nowUTCSeconds = Date.now() / 1000;

    return nowUTCSeconds >= exp - expOffsetInSeconds;
  }
}

export const authService = new AuthService(axios, localStorageServiceInstance);
