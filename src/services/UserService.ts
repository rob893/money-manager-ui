import axios from 'axios';
import { Budget, User } from '@/models/entities';
import { authService } from './AuthService';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';
import { CursorPaginatedResponse } from '@/models/misc';
import { UpdateUserDto } from '@/models/dtos';

export class UserService extends MoneyManagerAuthenticatedBaseService {
  public async getUsers(): Promise<User[]> {
    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<User>>('users');

    return nodes;
  }

  public async getUser(id: number): Promise<User | null> {
    const { data } = await this.httpClient.get<User | null>(`users/${id}`);

    return data;
  }

  public async updateUser(id: number, fieldsToUpdate: UpdateUserDto): Promise<User> {
    const patchDoc = Object.entries(fieldsToUpdate).map(([key, value]) => ({
      op: 'add',
      path: `/${key}`,
      value
    }));

    const { data } = await this.httpClient.patch<User>(`users/${id}`, patchDoc);

    return data;
  }

  public async getBudgetsForUser(userId: number): Promise<Budget[]> {
    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<Budget>>(`users/${userId}/budgets?includeEdges=false`);
    return nodes;
  }
}

export const userService = new UserService(axios, authService);
