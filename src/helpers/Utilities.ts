export class Utilities {
  public static isNumeric(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  }
}
