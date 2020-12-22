import { Expense, ExpenseFrequency, AmountPerTimeFrame } from '@/models';

export class Utilities {
  public static isNumeric(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  }

  public static splitAtUpperCase(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim();
  }

  public static removeItemFromArray<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);

    if (index >= 0) {
      arr.splice(index, 1);
      return true;
    }

    return false;
  }

  public static getFrequencyNumericValue(freq: ExpenseFrequency): number {
    switch (freq) {
      case ExpenseFrequency.Daily:
        return 1;
      case ExpenseFrequency.Weekly:
        return 2;
      case ExpenseFrequency.BiWeekly:
        return 3;
      case ExpenseFrequency.Monthly:
        return 4;
      case ExpenseFrequency.Annually:
        return 5;
      default:
        return 0;
    }
  }

  public static clearObject(obj: Record<string, unknown>): void {
    Object.keys(obj).forEach(key => delete obj[key]);
  }

  public static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  public static calculateExpensePerTimeFrame(expense: Expense | Expense[]): AmountPerTimeFrame {
    if (Array.isArray(expense)) {
      return expense.reduce(
        (prev, curr) => {
          const { annual, monthly, biWeekly, weekly, daily } = Utilities.calculateExpensePerTimeFrame(curr);

          return {
            annual: prev.annual + annual,
            monthly: prev.monthly + monthly,
            biWeekly: prev.biWeekly + biWeekly,
            weekly: prev.weekly + weekly,
            daily: prev.daily + daily
          };
        },
        { annual: 0, monthly: 0, biWeekly: 0, weekly: 0, daily: 0 }
      );
    }

    const annualExpense = Utilities.calculateAnnualExpense(expense);

    return {
      annual: annualExpense,
      monthly: annualExpense / 12,
      biWeekly: annualExpense / 26,
      weekly: annualExpense / 52,
      daily: annualExpense / 365
    };
  }

  public static calculateAnnualExpense({ frequency, amount }: Expense): number {
    switch (frequency) {
      case ExpenseFrequency.Annually:
        return amount;
      case ExpenseFrequency.Monthly:
        return amount * 12;
      case ExpenseFrequency.BiWeekly:
        return amount * 26;
      case ExpenseFrequency.Weekly:
        return amount * 52;
      case ExpenseFrequency.Daily:
        return amount * 365;
      default:
        throw new Error('Invalid frequency');
    }
  }
}
