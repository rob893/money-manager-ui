import axios from 'axios';
import { authService } from './AuthService';
import { Budget, Expense, Income } from '@/models/entities';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';
import { CreateBudgetDto, CreateExpenseForBudgetDto, CreateIncomeForBudgetDto, UpdateBudgetDto } from '@/models/dtos';

export class BudgetService extends MoneyManagerAuthenticatedBaseService {
  public async getBudget(id: number): Promise<Budget | null> {
    const { data } = await this.httpClient.get<Budget | null>(`budgets/${id}`);
    return data;
  }

  public async createBudget(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    const { data } = await this.httpClient.post<Budget>('budgets', createBudgetDto);
    return data;
  }

  public async updateBudget(budgetId: number, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const patchDocs = Object.entries(updateBudgetDto).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.httpClient.patch<Budget>(`budgets/${budgetId}`, patchDocs);

    return data;
  }

  public async addIncomeToBudget(budgetId: number, income: CreateIncomeForBudgetDto): Promise<Income> {
    const { data } = await this.httpClient.post<Income>(`budgets/${budgetId}/incomes`, income);
    return data;
  }

  public async addExpenseToBudget(budgetId: number, expense: CreateExpenseForBudgetDto): Promise<Expense> {
    const { data } = await this.httpClient.post<Expense>(`budgets/${budgetId}/expenses`, expense);
    return data;
  }
}

export const budgetService = new BudgetService(axios, authService);
