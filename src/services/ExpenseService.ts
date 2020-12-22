import axios from 'axios';
import { authService } from './AuthService';
import { Expense } from '@/models/entities';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';
import { CreateExpenseDto, UpdateExpenseDto } from '@/models/dtos';

export class ExpenseService extends MoneyManagerAuthenticatedBaseService {
  public async getExpense(id: number): Promise<Expense | null> {
    const { data } = await this.httpClient.get<Expense | null>(`expenses/${id}`);
    return data;
  }

  public async createExpense(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { data } = await this.httpClient.post<Expense>('expenses', createExpenseDto);
    return data;
  }

  public deleteExpense(id: number): Promise<void> {
    return this.httpClient.delete(`expenses/${id}`);
  }

  public async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const patchDocs = Object.entries(updateExpenseDto).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.httpClient.patch<Expense>(`expenses/${id}`, patchDocs);

    return data;
  }
}

export const expenseService = new ExpenseService(axios, authService);
