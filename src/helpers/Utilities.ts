export class Utilities {
  public static isNumeric(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  }

  public static splitAtUpperCase(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim();
  }
}
