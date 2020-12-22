import { ExpenseFrequency, IncomeType, TaxFilingStatus } from './entities';
import { Indexable } from './misc';

export interface UpdateUserDto extends Indexable {
  firstName?: string;
  lastName?: string;
}

export interface CreateBudgetDto {
  name: string;
  userId: number;
  description?: string;
  taxFilingStatus?: TaxFilingStatus;
}

export interface UpdateBudgetDto extends Indexable {
  description?: string;
}

export interface CreateIncomeDto {
  budgetId: number;
  name: string;
  description?: string;
  amount: number;
  incomeType: IncomeType;
}

export type CreateIncomeForBudgetDto = Omit<CreateIncomeDto, 'budgetId'>;

export interface CreateExpenseDto {
  budgetId: number;
  name: string;
  description?: string;
  amount: number;
  frequency: ExpenseFrequency;
}

export type CreateExpenseForBudgetDto = Omit<CreateExpenseDto, 'budgetId'>;
