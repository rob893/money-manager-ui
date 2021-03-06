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

export interface EditFormField<TValue = any> {
  edited: boolean;
  value: TValue;
}

export interface UpdateBudgetDto extends Indexable {
  name?: string;
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

export interface UpdateIncomeDto extends Indexable {
  name?: string;
  description?: string;
  amount?: number;
  incomeType?: IncomeType;
}

export interface CreateExpenseDto {
  budgetId: number;
  name: string;
  description?: string;
  amount: number;
  frequency: ExpenseFrequency;
}

export type CreateExpenseForBudgetDto = Omit<CreateExpenseDto, 'budgetId'>;

export interface UpdateExpenseDto extends Indexable {
  name?: string;
  description?: string;
  amount?: number;
  frequency?: ExpenseFrequency;
}

export interface RegisterUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}
