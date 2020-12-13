export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  created: string;
  roles: string[];
}

export interface Budget {
  id: number;
  userId: string;
  name: string;
  description?: string;
  taxFilingStatus: TaxFilingStatus;
  taxLiability: TaxLiability;
  incomes: Income[];
  expenses: Expense[];
}

export interface TaxLiability {
  id: number;
  budgetId: number;
  federal: number;
  fica: number;
  state: number;
}

export interface Income {
  id: number;
  budgetId: number;
  incomeType: IncomeType;
  name: string;
  description?: string;
  amount: number;
}

export interface Expense {
  id: number;
  budgetId: number;
  name: string;
  description?: string;
  amount: number;
  frequency: ExpenseFrequency;
}

export enum ExpenseFrequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'BiWeekly',
  Monthly = 'Monthly',
  Annually = 'Annually'
}

export enum TaxFilingStatus {
  Single = 'Single',
  MarriedFilingJointly = 'MarriedFilingJointly',
  MarriedFilingSeparately = 'MarriedFilingSeparately',
  HeadOfHousehold = 'HeadOfHousehold'
}

export enum IncomeType {
  W2 = 'W2',
  ShortTermCapitalGains = 'ShortTermCapitalGains',
  LongTermCapitalGains = 'LongTermCapitalGains'
}
