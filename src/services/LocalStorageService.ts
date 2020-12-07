export class LocalStorageService {
  private readonly storage: Storage;

  private readonly storagePrefix: string;

  public constructor(storage: Storage) {
    const { VUE_APP_LOCAL_STORAGE_PREFIX, NODE_ENV } = process.env;

    if (!VUE_APP_LOCAL_STORAGE_PREFIX || !NODE_ENV) {
      throw new Error('VUE_APP_LOCAL_STORAGE_PREFIX and NODE_ENV must be env variables.');
    }

    this.storage = storage;
    this.storagePrefix = `${VUE_APP_LOCAL_STORAGE_PREFIX}-${NODE_ENV}-`;
  }

  public getItem(key: string): string | null {
    const item = this.storage.getItem(this.computeKey(key));

    if (!item) {
      return null;
    }

    return item;
  }

  public getParsedItem<T extends Record<keyof T, unknown> | unknown[]>(key: string): T | null {
    const item = this.getItem(key);

    if (!item) {
      return null;
    }

    const parsed = JSON.parse(item);

    return parsed;
  }

  public setItem<T>(key: string, value: T): void {
    const asString = JSON.stringify(value);
    this.storage.setItem(this.computeKey(key), asString);
  }

  public removeItem(key: string): void {
    this.storage.removeItem(this.computeKey(key));
  }

  public clear(): void {
    this.storage.clear();
  }

  private computeKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }
}

export const localStorageService = new LocalStorageService(localStorage);
