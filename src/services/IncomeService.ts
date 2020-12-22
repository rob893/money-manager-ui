import axios from 'axios';
import { authService } from './AuthService';
import { Income } from '@/models/entities';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';
import { CreateIncomeDto, UpdateIncomeDto } from '@/models/dtos';

export class IncomeService extends MoneyManagerAuthenticatedBaseService {
  public async getIncome(id: number): Promise<Income | null> {
    const { data } = await this.httpClient.get<Income | null>(`incomes/${id}`);
    return data;
  }

  public async createIncome(createIncomeDto: CreateIncomeDto): Promise<Income> {
    const { data } = await this.httpClient.post<Income>('incomes', createIncomeDto);
    return data;
  }

  public deleteIncome(id: number): Promise<void> {
    return this.httpClient.delete(`incomes/${id}`);
  }

  public async updateIncome(id: number, updateIncomeDto: UpdateIncomeDto): Promise<Income> {
    const patchDocs = Object.entries(updateIncomeDto).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.httpClient.patch<Income>(`incomes/${id}`, patchDocs);

    return data;
  }
}

export const incomeService = new IncomeService(axios, authService);
