import axios from 'axios';
import { authService } from './AuthService';
import { Budget } from '@/models/entities';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';

export class BudgetService extends MoneyManagerAuthenticatedBaseService {
  public async getBudget(id: number): Promise<Budget | null> {
    const { data } = await this.httpClient.get<Budget | null>(`budgets/${id}`);

    return data;
  }
}

export const budgetService = new BudgetService(axios, authService);
